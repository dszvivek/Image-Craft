import { pipeline, env, AutoConfig, RawImage } from '@huggingface/transformers';

// Disable loading local models since they are served over CDN
env.allowLocalModels = false;

// Set WASM paths if needed, or rely on Hugging Face CDN defaults
if (env.backends?.onnx?.wasm) {
  env.backends.onnx.wasm.numThreads = 1;
}

let currentEngine: 'fast' | 'studio' | null = null;
let segmenter: any = null;

const getSegmenter = async (engine: 'fast' | 'studio', onProgress: (data: any) => void) => {
  if (segmenter && currentEngine === engine) {
    return segmenter;
  }

  // Dispose previous pipeline if changing engines
  segmenter = null;
  currentEngine = engine;

  if (engine === 'fast') {
    // MODNet quantized is only ~6.6MB (26x smaller than RMBG unquantized)
    // Downloads in 1-2 seconds and executes in real-time WebAssembly
    segmenter = await pipeline('background-removal', 'Xenova/modnet', {
      dtype: 'q8',
      progress_callback: (data: any) => {
        if (data.status === 'progress') {
          onProgress(data);
        }
      }
    });
  } else {
    // RMBG-1.4 with quantized: true is ~44MB (4x smaller than unquantized 176MB)
    const config = await AutoConfig.from_pretrained('briaai/RMBG-1.4');
    config.model_type = 'segformer';

    segmenter = await pipeline('image-segmentation', 'briaai/RMBG-1.4', {
      config,
      dtype: 'q8',
      progress_callback: (data: any) => {
        if (data.status === 'progress') {
          onProgress(data);
        }
      }
    });
  }

  return segmenter;
};

self.addEventListener('message', async (event: MessageEvent) => {
  const { image, buffer, mimeType, engine = 'fast' } = event.data;
  if (!image && !buffer) return;

  try {
    const pipe = await getSegmenter(engine, (progressData) => {
      const file = progressData.file || '';
      const isWeights = file.endsWith('.onnx') || file.includes('model');

      self.postMessage({
        status: 'progress',
        progress: isWeights ? progressData.progress : Math.min(progressData.progress || 0, 8),
        file: progressData.file,
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

    if (engine === 'fast') {
      // background-removal pipeline returns RawImage with 4 RGBA channels
      const result: any = await pipe(inputImage);
      const maskData = new Uint8Array(result.width * result.height);
      const outPixels = result.data;
      for (let i = 0; i < maskData.length; i++) {
        maskData[i] = outPixels[i * 4 + 3];
      }
      (self as any).postMessage({
        status: 'complete',
        mask: {
          width: result.width,
          height: result.height,
          data: maskData
        }
      }, [maskData.buffer]);
    } else {
      // image-segmentation pipeline returns array with mask
      const result = await pipe(inputImage);
      const mask = Array.isArray(result) && result[0] ? result[0].mask : result;
      const maskData = mask.data;
      (self as any).postMessage({
        status: 'complete',
        mask: {
          width: mask.width,
          height: mask.height,
          data: maskData
        }
      }, [maskData.buffer]);
    }
  } catch (error: any) {
    self.postMessage({
      status: 'error',
      error: error.message || 'Background removal failed.'
    });
  }
});
