# 🏔️ ImageGiri - Privacy-First Local Image Tools Suite

ImageGiri is a modern, responsive, and 100% client-side web application offering a suite of 12 powerful image manipulation and local AI utilities. All file transformations, compression, text extraction, and background removals are executed **entirely in your browser's memory** via WebAssembly (WASM), Web Workers, and ONNX Runtime Web. Your image bytes never leave your device.

🌐 **Live Demo:** [imagegiri.com](https://imagegiri.com)

---

## 🚀 Key Features (12 Tools)

- **Image Compressor:** Optimize JPEGs, PNGs, and WebPs client-side with quality sliders and a side-by-side comparison slider.
- **AI Background Remover:** Local neural segmenting using the RMBG-1.4 model inside browser Web Workers (no server uploads).
- **OCR Text Extractor:** Scan and extract multi-lingual texts from image files locally via Tesseract.js (WASM).
- **Instagram Grid Splitter:** Slice your images into creative grid tiles (3x3, 3x2, etc.) for social profiles.
- **Photo Collage Maker:** Arrange multiple photos in pre-built layout canvas grids with custom spacing, background colors, and border radius.
- **Color Palette Extractor:** Extract dominant colors and HEX palettes using k-means quantization.
- **Batch Image to PDF & Format Converter:** Bulk convert images (JPEG, PNG, WebP) or merge them into custom-ordered PDF documents entirely offline.
- **EXIF Metadata Stripper:** Read, inspect, and wipe personal camera details and GPS location headers from image metadata.
- **Watermark Overlay:** Apply custom text patterns or logos to multiple images client-side with opacity controls.
- **Aspect Ratio Resizer:** Crop and scale photos to social preset dimensions (Instagram, YouTube, Twitter/X).
- **Instant Meme Generator:** Design captions (top/bottom text styles) onto any uploaded photo locally.
- **SVG Vectorizer:** Trace raster files (JPG/PNG) into scalable vector coordinates (SVG paths).

---

## 🛠️ Technology Stack

- **Framework:** React 19 + TypeScript + Vite 8
- **Styling:** Tailwind CSS v4 + Vanilla CSS transitions
- **AI Engine:** ONNX Runtime Web (`@huggingface/transformers`) inside Web Workers
- **OCR Processing:** Tesseract.js (WebAssembly)
- **PDF Generation:** jsPDF
- **Compression/Archiving:** JSZip
- **SEO & Search Indexing:** Site webmanifest metadata + `/llms.txt` + `/sitemap.xml`

---

## 💻 Getting Started (Local Development)

### Prerequisites

- Node.js (v18.x or higher recommended)
- npm or pnpm

### Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/dszvivek/Image-Craft.git
   cd Image-Craft
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

Open `http://localhost:5173` in your browser to run the app.

---

## 📦 Production Deployment

To compile the optimized production bundle with manual rollup code-splitting chunks:

```bash
npm run build
```

This will create a `dist/` directory containing statically deployable files.

### Deploying to Cloudflare Pages (Recommended)

1. Create a new project on Cloudflare Pages and link this repository.
2. Configure build settings:
   - **Framework Preset:** `Vite`
   - **Build Command:** `npm run build`
   - **Build Output Directory:** `dist`
3. Click **Deploy**.

*Note: Vite copies `/public/_redirects` to handle history-based React routing fallbacks automatically.*

### ⚡ Recommended Server Headers (For 10x AI Speed)
For the background remover to utilize native multi-threaded CPU processing (via `SharedArrayBuffer`), configure your host to send these security headers:
```http
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
```

---

## 🔒 Security & Privacy Promise

ImageGiri runs **zero backend servers**. All operations are processed locally in your browser cache. You can verify this assertion by opening your browser's Developer Tools (F12) > **Network** tab, dropping an image file, and observing that no image bytes or uploads are generated.

---

## 📄 License

This project is open-source. Feel free to inspect, modify, or fork the repository.
