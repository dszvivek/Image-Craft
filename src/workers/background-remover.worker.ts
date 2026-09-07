import { pipeline, env, AutoConfig, RawImage } from '@huggingface/transformers';

// Disable loading local models since they are served over CDN
env.allowLocalModels = false;

// Set WASM paths if needed, or rely on Hugging Face CDN defaults
// Safe multi-threading detection: enable multi-threading if crossOriginIsolated & SharedArrayBuffer are available
if (env.backends?.onnx?.wasm) {
  const isIsolated = typeof crossOriginIsolated !== 'undefined' && crossOriginIsolated;
  const hasSharedArrayBuffer = typeof SharedArrayBuffer !== 'undefined';
  if (isIsolated && hasSharedArrayBuffer) {
    const cores = navigator.hardwareConcurrency || 2;
    env.backends.onnx.wasm.numThreads = Math.min(4, Math.max(1, cores - 1));
  } else {
    env.backends.onnx.wasm.numThreads = 1;
  }
}

let segmenter: any = null;

const getSegmenter = async (onProgress: (data: any) => void) => {
  if (segmenter) {
    return segmenter;
  }

  // RMBG-1.4 quantized (~42MB) - state-of-the-art universal background removal for people, products, pets, cars, objects
  const config = await AutoConfig.from_pretrained('briaai/RMBG-1.4');
  config.model_type = 'segformer';

  segmenter = await pipeline('image-segmentation', 'briaai/RMBG-1.4', {
    config,
    dtype: 'q8',
    progress_callback: (data: any) => {
      if (data.status === 'progress' || data.status === 'progress_total') {
        onProgress(data);
      }
    }
  });

  return segmenter;
};

self.addEventListener('message', async (event: MessageEvent) => {
  const { image, buffer, mimeType, engine = 'fast' } = event.data;
  if (!image && !buffer) return;

  try {
    const pipe = await getSegmenter((progressData) => {
      const isTotal = progressData.status === 'progress_total';
      const file = progressData.file || (isTotal ? 'model_quantized.onnx' : '');

      self.postMessage({
        status: 'progress',
        progress: progressData.progress ? Math.round(progressData.progress) : 0,
        file,
        loaded: progressData.loaded,
        total: progressData.total,
        engine
      });
    });

    self.postMessage({ status: 'processing', engine });

    // Prepare input image
    let inputImage: any = image;
    if (buffer) {
      const blob = new Blob([buffer], { type: mimeType || 'image/png' });
      inputImage = await RawImage.fromBlob(blob);
    }

    // Run inference using universal neural vision model
    const result = await pipe(inputImage);
    const mask = Array.isArray(result) && result[0] ? result[0].mask : result;
    const maskData = new Uint8Array(mask.width * mask.height);
    const srcData = mask.data;
    if (mask.channels === 1) {
      maskData.set(srcData);
    } else if (mask.channels === 4) {
      for (let i = 0; i < maskData.length; i++) {
        maskData[i] = srcData[i * 4 + 3];
      }
    } else if (mask.channels === 3) {
      for (let i = 0; i < maskData.length; i++) {
        maskData[i] = srcData[i * 3];
      }
    } else {
      for (let i = 0; i < maskData.length; i++) {
        maskData[i] = srcData[i] ?? 0;
      }
    }

    (self as any).postMessage({
      status: 'complete',
      mask: {
        width: mask.width,
        height: mask.height,
        data: maskData
      }
    }, [maskData.buffer]);
  } catch (error: any) {
    self.postMessage({
      status: 'error',
      error: error.message || 'Background removal failed.'
    });
  }
});

