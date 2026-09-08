import { pipeline, env, AutoConfig, RawImage } from '@huggingface/transformers';

// Disable loading local models since they are served over CDN
env.allowLocalModels = false;

// Configure WebAssembly safely for mobile browsers and environments without SharedArrayBuffer
const configureWasm = () => {
  if (env.backends?.onnx?.wasm) {
    const isIsolated = typeof crossOriginIsolated !== 'undefined' && crossOriginIsolated;
    const hasSharedArrayBuffer = typeof SharedArrayBuffer !== 'undefined';

    if (isIsolated && hasSharedArrayBuffer) {
      const cores = navigator.hardwareConcurrency || 2;
      env.backends.onnx.wasm.numThreads = Math.min(4, Math.max(1, cores - 1));
    } else {
      // Single-threaded WASM execution prevents mobile Safari / non-isolated context crashes
      env.backends.onnx.wasm.numThreads = 1;
    }
    // Prevent spawning child workers inside an active worker
    env.backends.onnx.wasm.proxy = false;
  }
};

configureWasm();

let fastSegmenter: any = null;
let studioSegmenter: any = null;

const getSegmenter = async (engine: 'fast' | 'studio', onProgress: (data: any) => void) => {
  configureWasm();

  if (engine === 'fast') {
    if (fastSegmenter) {
      return fastSegmenter;
    }

    // Xenova/modnet quantized (~6.6MB, 512x512 native) - ultra-lightweight, runs effortlessly on all mobile devices (<70MB RAM)
    fastSegmenter = await pipeline('image-segmentation', 'Xenova/modnet', {
      dtype: 'q8',
      progress_callback: (data: any) => {
        if (data.status === 'progress' || data.status === 'progress_total') {
          onProgress(data);
        }
      }
    });

    return fastSegmenter;
  } else {
    if (studioSegmenter) {
      return studioSegmenter;
    }

    // RMBG-1.4 quantized (~42MB, 1024x1024) - state-of-the-art deep resolution for fine hair strands & complex boundaries
    const config = await AutoConfig.from_pretrained('briaai/RMBG-1.4');
    config.model_type = 'segformer';

    studioSegmenter = await pipeline('image-segmentation', 'briaai/RMBG-1.4', {
      config,
      dtype: 'q8',
      progress_callback: (data: any) => {
        if (data.status === 'progress' || data.status === 'progress_total') {
          onProgress(data);
        }
      }
    });

    return studioSegmenter;
  }
};

self.addEventListener('message', async (event: MessageEvent) => {
  const { image, buffer, mimeType, engine = 'fast' } = event.data;
  if (!image && !buffer) return;

  try {
    const selectedEngine: 'fast' | 'studio' = engine === 'studio' ? 'studio' : 'fast';

    const pipe = await getSegmenter(selectedEngine, (progressData) => {
      const isTotal = progressData.status === 'progress_total';
      const file = progressData.file || (isTotal ? 'model_quantized.onnx' : '');

      self.postMessage({
        status: 'progress',
        progress: progressData.progress ? Math.round(progressData.progress) : 0,
        file,
        loaded: progressData.loaded,
        total: progressData.total,
        engine: selectedEngine
      });
    });

    self.postMessage({ status: 'processing', engine: selectedEngine });

    // Prepare input image
    let inputImage: any = image;
    if (buffer) {
      const blob = new Blob([buffer], { type: mimeType || 'image/png' });
      inputImage = await RawImage.fromBlob(blob);
    }

    // Run inference using the selected neural model
    const result = await pipe(inputImage);
    const mask = Array.isArray(result) && result[0] ? result[0].mask : (result.mask || result);
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


