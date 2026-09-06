import { pipeline, env, AutoConfig, RawImage } from '@huggingface/transformers';

// Disable loading local models since they are served over CDN
env.allowLocalModels = false;

// Set WASM paths if needed, or rely on Hugging Face CDN defaults
if (env.backends?.onnx?.wasm) {
  env.backends.onnx.wasm.numThreads = 1;
}

let segmenter: any = null;

const getSegmenter = async (onProgress: (data: any) => void) => {
  if (!segmenter) {
    const config = await AutoConfig.from_pretrained('briaai/RMBG-1.4');
    config.model_type = 'segformer';

    segmenter = await pipeline('image-segmentation', 'briaai/RMBG-1.4', {
      config,
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
  const { image, buffer, mimeType } = event.data;
  if (!image && !buffer) return;

  try {
    const pipe = await getSegmenter((progressData) => {
      // Avoid progress bar jumping to 100% on small config files and resetting to 0% for model.onnx
      const file = progressData.file || '';
      const isWeights = file.endsWith('.onnx') || file.includes('model');
      
      self.postMessage({
        status: 'progress',
        progress: isWeights ? progressData.progress : Math.min(progressData.progress || 0, 5),
        file: progressData.file,
        loaded: progressData.loaded,
        total: progressData.total
      });
    });

    self.postMessage({ status: 'processing' });

    // Prepare input: prefer zero-copy Blob from ArrayBuffer, fallback to URL/DataURL
    let inputImage: any = image;
    if (buffer) {
      const blob = new Blob([buffer], { type: mimeType || 'image/png' });
      inputImage = await RawImage.fromBlob(blob);
    }

    // Run inference through pipeline
    const result = await pipe(inputImage);

    // RMBG-1.4 output is an array containing the foreground segment mask
    const mask = Array.isArray(result) && result[0] ? result[0].mask : result;

    // Transfer typed array buffer directly to main thread with zero memory copy
    const maskData = mask.data;
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

