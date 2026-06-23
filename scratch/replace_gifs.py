import os
import re

pages_dir = r"c:\Projects\Image Craft\src\pages"

configs = [
    {
        "file": "AspectResizer.tsx",
        "gif_var": "aspectResizerGif",
        "gif_file": "aspect_resizer_feature.gif",
        "static_var": "aspectResizerStaticImg",
        "static_file": "aspect_resizer_feature_static.webp",
        "alt": "Aspect Resizer Demo"
    },
    {
        "file": "BackgroundRemover.tsx",
        "gif_var": "bgRemoverGif",
        "gif_file": "bg_remover_feature.gif",
        "static_var": "bgRemoverStaticImg",
        "static_file": "bg_remover_feature_static.webp",
        "alt": "Background Remover Demo"
    },
    {
        "file": "BatchConverter.tsx",
        "gif_var": "batchConverterGif",
        "gif_file": "batch_converter_feature.gif",
        "static_var": "batchConverterStaticImg",
        "static_file": "batch_converter_feature_static.webp",
        "alt": "Batch Converter Demo"
    },
    {
        "file": "CollageMaker.tsx",
        "gif_var": "collageMakerGif",
        "gif_file": "collage_maker_feature.gif",
        "static_var": "collageMakerStaticImg",
        "static_file": "collage_maker_feature_static.webp",
        "alt": "Collage Maker Demo"
    },
    {
        "file": "Compressor.tsx",
        "gif_var": "compressorGif",
        "gif_file": "compressor_feature.gif",
        "static_var": "compressorStaticImg",
        "static_file": "compressor_feature_static.webp",
        "alt": "Compressor Demo"
    },
    {
        "file": "GridSplitter.tsx",
        "gif_var": "gridSplitterGif",
        "gif_file": "grid_splitter_feature.gif",
        "static_var": "gridSplitterStaticImg",
        "static_file": "grid_splitter_feature_static.webp",
        "alt": "Grid Splitter Demo"
    },
    {
        "file": "MemeGenerator.tsx",
        "gif_var": "memeGeneratorGif",
        "gif_file": "meme_generator_feature.gif",
        "static_var": "memeGeneratorStaticImg",
        "static_file": "meme_generator_feature_static.webp",
        "alt": "Meme Generator Demo"
    },
    {
        "file": "MetadataStripper.tsx",
        "gif_var": "metadataStripperGif",
        "gif_file": "metadata_stripper_feature.gif",
        "static_var": "metadataStripperStaticImg",
        "static_file": "metadata_stripper_feature_static.webp",
        "alt": "Metadata Stripper Demo"
    },
    {
        "file": "MosaicGenerator.tsx",
        "gif_var": "mosaicImg",
        "gif_file": "mosaic_feature.gif",
        "static_var": "mosaicStaticImg",
        "static_file": "mosaic_feature_static.webp",
        "alt": "Photo Mosaic Preview"
    },
    {
        "file": "OcrExtractor.tsx",
        "gif_var": "ocrExtractorGif",
        "gif_file": "ocr_extractor_feature.gif",
        "static_var": "ocrExtractorStaticImg",
        "static_file": "ocr_extractor_feature_static.webp",
        "alt": "OCR Extractor Demo"
    },
    {
        "file": "PaletteExtractor.tsx",
        "gif_var": "paletteExtractorGif",
        "gif_file": "palette_extractor_feature.gif",
        "static_var": "paletteExtractorStaticImg",
        "static_file": "palette_extractor_feature_static.webp",
        "alt": "Color Palette Extractor Demo"
    },
    {
        "file": "SvgVectorizer.tsx",
        "gif_var": "svgVectorizerGif",
        "gif_file": "svg_vectorizer_feature.gif",
        "static_var": "svgVectorizerStaticImg",
        "static_file": "svg_vectorizer_feature_static.webp",
        "alt": "SVG Vectorizer Demo"
    },
    {
        "file": "WatermarkOverlay.tsx",
        "gif_var": "watermarkOverlayGif",
        "gif_file": "watermark_overlay_feature.gif",
        "static_var": "watermarkOverlayStaticImg",
        "static_file": "watermark_overlay_feature_static.webp",
        "alt": "Watermark Overlay Demo"
    }
]

for cfg in configs:
    path = os.path.join(pages_dir, cfg["file"])
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    # 1. Replace the import lines
    gif_import = f"import {cfg['gif_var']} from '../assets/{cfg['gif_file']}';"
    new_imports = (
        f"import {cfg['gif_var']} from '../assets/{cfg['gif_file']}';\n"
        f"import {cfg['static_var']} from '../assets/{cfg['static_file']}';\n"
        f"import {{ DemoPreview }} from '../components/DemoPreview';"
    )
    
    if gif_import in content:
        content = content.replace(gif_import, new_imports)
        print(f"[{cfg['file']}] Replaced import lines")
    else:
        print(f"[{cfg['file']}] WARNING: Import line not found: {gif_import}")

    # 2. Find and replace the div block
    # We will search for the container div start, the img tag, and the matching closing div tag.
    # The div starts with `<div className="my-[45] ... select-none">`
    # and ends with `</div>`
    # Let's write a regex that matches this cleanly.
    
    if cfg["file"] == "MosaicGenerator.tsx":
        # MosaicGenerator has a slightly different class
        pattern = r'<div\s+className="my-4\s+rounded-2xl\s+overflow-hidden\s+border\s+border-slate-200/60\s+aspect-\[4/3\]\s+relative\s+select-none\s+shadow-sm\s+bg-slate-55?">.*?\s*<img\s+src=\{mosaicImg\}.*?\s*/>\s*</div>'
    else:
        pattern = r'<div\s+className="my-5\s+rounded-2xl\s+overflow-hidden\s+aspect-\[4/3\]\s+border\s+border-slate-150\s+shadow-xs\s+relative\s+pointer-events-none\s+select-none">.*?\s*<img\s+src=\{' + cfg["gif_var"] + r'\}.*?\s*/>\s*</div>'
        
    match = re.search(pattern, content, re.DOTALL)
    if match:
        target_block = match.group(0)
        # Determine indentation level based on preceding spaces
        lines = content[:match.start()].split('\n')
        last_line = lines[-1] if lines else ""
        indent = " " * (len(last_line) - len(last_line.lstrip()))
        
        replacement = (
            f"<DemoPreview\n"
            f"{indent}  gifSrc={{ {cfg['gif_var']} }}\n"
            f"{indent}  staticSrc={{ {cfg['static_var']} }}\n"
            f"{indent}  alt=\"{cfg['alt']}\"\n"
            f"{indent}/>"
        )
        content = content.replace(target_block, replacement)
        print(f"[{cfg['file']}] Replaced div container block")
    else:
        print(f"[{cfg['file']}] WARNING: Container block not found")

    with open(path, "w", encoding="utf-8") as f:
        f.write(content)

print("Finished safe replacements!")
