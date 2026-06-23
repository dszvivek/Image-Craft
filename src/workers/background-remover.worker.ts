import { pipeline, env, AutoConfig } from '@huggingface/transformers';

// Disable loading local models since they are served over CDN
env.allowLocalModels = false;

// Set WASM paths if needed, or rely on Hugging Face CDN defaults
// By default, Transformers.js resolves WASM paths from CDN
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
  const { image } = event.data;
  if (!image) return;

  try {
    const pipe = await getSegmenter((progressData) => {
      self.postMessage({
        status: 'progress',
        progress: progressData.progress,
        file: progressData.file
      });
    });

    self.postMessage({ status: 'processing' });

    // The image sent is a string (Data URL or Object URL)
    const result = await pipe(image);

    // RMBG-1.4 output of 'image-segmentation' task is an array containing the foreground segment
    // We extract the mask channel (alpha channel of the output image) from result[0].mask
    const mask = Array.isArray(result) && result[0] ? result[0].mask : result;

    // Transfer the TypedArray buffer directly to main thread without copying memory
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
