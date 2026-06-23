import os
import re

pages_dir = r"c:\Projects\Image Craft\src\pages"

# Define the mapping for pages, their gif imports, static imports, and target variable names
refactor_configs = [
    {
        "file": "AspectResizer.tsx",
        "gif_import": "aspectResizerGif",
        "gif_file": "aspect_resizer_feature.gif",
        "static_import": "aspectResizerStaticImg",
        "static_file": "aspect_resizer_feature_static.webp",
        "img_tag_regex": r'<img\s+src=\{aspectResizerGif\}\s+alt="Aspect Resizer Demo"\s+className="w-full h-full object-cover"\s*/>'
    },
    {
        "file": "BackgroundRemover.tsx",
        "gif_import": "bgRemoverGif",
        "gif_file": "bg_remover_feature.gif",
        "static_import": "bgRemoverStaticImg",
        "static_file": "bg_remover_feature_static.webp",
        "img_tag_regex": r'<img\s+src=\{bgRemoverGif\}\s+alt="Background Remover Demo"\s+className="w-full h-full object-cover"\s*/>'
    },
    {
        "file": "BatchConverter.tsx",
        "gif_import": "batchConverterGif",
        "gif_file": "batch_converter_feature.gif",
        "static_import": "batchConverterStaticImg",
        "static_file": "batch_converter_feature_static.webp",
        "img_tag_regex": r'<img\s+src=\{batchConverterGif\}\s+alt="Batch Converter Demo"\s+className="w-full h-full object-cover"\s*/>'
    },
    {
        "file": "CollageMaker.tsx",
        "gif_import": "collageMakerGif",
        "gif_file": "collage_maker_feature.gif",
        "static_import": "collageMakerStaticImg",
        "static_file": "collage_maker_feature_static.webp",
        "img_tag_regex": r'<img\s+src=\{collageMakerGif\}\s+alt="Collage Maker Demo"\s+className="w-full h-full object-cover"\s*/>'
    },
    {
        "file": "Compressor.tsx",
        "gif_import": "compressorGif",
        "gif_file": "compressor_feature.gif",
        "static_import": "compressorStaticImg",
        "static_file": "compressor_feature_static.webp",
        "img_tag_regex": r'<img\s+src=\{compressorGif\}\s+alt="Compressor Demo"\s+className="w-full h-full object-cover"\s*/>'
    },
    {
        "file": "GridSplitter.tsx",
        "gif_import": "gridSplitterGif",
        "gif_file": "grid_splitter_feature.gif",
        "static_import": "gridSplitterStaticImg",
        "static_file": "grid_splitter_feature_static.webp",
        "img_tag_regex": r'<img\s+src=\{gridSplitterGif\}\s+alt="Grid Splitter Demo"\s+className="w-full h-full object-cover"\s*/>'
    },
    {
        "file": "MemeGenerator.tsx",
        "gif_import": "memeGeneratorGif",
        "gif_file": "meme_generator_feature.gif",
        "static_import": "memeGeneratorStaticImg",
        "static_file": "meme_generator_feature_static.webp",
        "img_tag_regex": r'<img\s+src=\{memeGeneratorGif\}\s+alt="Meme Generator Demo"\s+className="w-full h-full object-cover"\s*/>'
    },
    {
        "file": "MetadataStripper.tsx",
        "gif_import": "metadataStripperGif",
        "gif_file": "metadata_stripper_feature.gif",
        "static_import": "metadataStripperStaticImg",
        "static_file": "metadata_stripper_feature_static.webp",
        "img_tag_regex": r'<img\s+src=\{metadataStripperGif\}\s+alt="Metadata Stripper Demo"\s+className="w-full h-full object-cover"\s*/>'
    },
    {
        "file": "MosaicGenerator.tsx",
        "gif_import": "mosaicImg",
        "gif_file": "mosaic_feature.gif",
        "static_import": "mosaicStaticImg",
        "static_file": "mosaic_feature_static.webp",
        "img_tag_regex": r'<img\s+src=\{mosaicImg\}\s+alt="Photo Mosaic Preview"\s+className="w-full h-full object-cover"\s*/>'
    },
    {
        "file": "OcrExtractor.tsx",
        "gif_import": "ocrExtractorGif",
        "gif_file": "ocr_extractor_feature.gif",
        "static_import": "ocrExtractorStaticImg",
        "static_file": "ocr_extractor_feature_static.webp",
        "img_tag_regex": r'<img\s+src=\{ocrExtractorGif\}\s+alt="OCR Extractor Demo"\s+className="w-full h-full object-cover"\s*/>'
    },
    {
        "file": "PaletteExtractor.tsx",
        "gif_import": "paletteExtractorGif",
        "gif_file": "palette_extractor_feature.gif",
        "static_import": "paletteExtractorStaticImg",
        "static_file": "palette_extractor_feature_static.webp",
        "img_tag_regex": r'<img\s+src=\{paletteExtractorGif\}\s+alt="Color Palette Extractor Demo"\s+className="w-full h-full object-cover"\s*/>'
    },
    {
        "file": "SvgVectorizer.tsx",
        "gif_import": "svgVectorizerGif",
        "gif_file": "svg_vectorizer_feature.gif",
        "static_import": "svgVectorizerStaticImg",
        "static_file": "svg_vectorizer_feature_static.webp",
        "img_tag_regex": r'<img\s+src=\{svgVectorizerGif\}\s+alt="SVG Vectorizer Demo"\s+className="w-full h-full object-cover"\s*/>'
    },
    {
        "file": "WatermarkOverlay.tsx",
        "gif_import": "watermarkOverlayGif",
        "gif_file": "watermark_overlay_feature.gif",
        "static_import": "watermarkOverlayStaticImg",
        "static_file": "watermark_overlay_feature_static.webp",
        "img_tag_regex": r'<img\s+src=\{watermarkOverlayGif\}\s+alt="Watermark Overlay Demo"\s+className="w-full h-full object-cover"\s*/>'
    }
]

for cfg in refactor_configs:
    filepath = os.path.join(pages_dir, cfg["file"])
    if not os.path.exists(filepath):
        print(f"Skipping {cfg['file']} - not found")
        continue
    
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
    
    # 1. Add static WebP import
    gif_import_line = f"import {cfg['gif_import']} from '../assets/{cfg['gif_file']}';"
    static_import_line = f"import {cfg['gif_import']} from '../assets/{cfg['gif_file']}';\nimport {cfg['static_import']} from '../assets/{cfg['static_file']}';"
    if gif_import_line in content:
        content = content.replace(gif_import_line, static_import_line)
        print(f"[{cfg['file']}] Added static import")
    else:
        print(f"[{cfg['file']}] WARNING: Could not find gif import line")
    
    # 2. Add useState state variable
    # We find the component declaration and insert the state
    decl_match = re.search(r'export const (\w+):\s*React\.FC\s*=\s*\(\)\s*=>\s*\{', content)
    if decl_match:
        decl = decl_match.group(0)
        replacement = decl + "\n  const [isDemoHovered, setIsDemoHovered] = useState(false);"
        content = content.replace(decl, replacement)
        print(f"[{cfg['file']}] Added isDemoHovered state")
    else:
        print(f"[{cfg['file']}] WARNING: Could not find React.FC declaration")
        
    # 3. Replace the image container and img tag
    # The container usually looks like:
    # <div className="my-5 rounded-2xl overflow-hidden aspect-[4/3] border border-slate-150 shadow-xs relative pointer-events-none select-none">
    #   <img src={...} alt="..." className="w-full h-full object-cover" />
    # </div>
    # Note: MosaicGenerator uses className="my-4..." and aspect-[4/3]... select-none shadow-sm bg-slate-50
    # Let's match the wrapper div and image tag dynamically using a regex
    
    wrapper_regex = r'(<div\s+className="my-[45]\s+rounded-2xl\s+overflow-hidden\s+.*?\s+pointer-events-none\s+select-none">)(\s*<img\s+src=\{.*?\}.*?/>)(\s*</div>)'
    
    # Let's try replacing it with a hoverable div
    def replace_container(m):
        # We replace pointer-events-none with cursor-pointer and add hover state handlers
        div_class = m.group(1)
        div_class = div_class.replace("pointer-events-none", "cursor-pointer")
        
        # Add onMouseEnter and onMouseLeave
        div_tag = div_class[:-2] + ' onMouseEnter={() => setIsDemoHovered(true)} onMouseLeave={() => setIsDemoHovered(false)}>'
        
        # Replace image src with ternary
        img_src_replaced = f'<img src={{isDemoHovered ? {cfg["gif_import"]} : {cfg["static_import"]}}} alt="{cfg["file"].split(".")[0]} Demo" className="w-full h-full object-cover" loading="lazy" />'
        
        return f"{div_tag}\n                  {img_src_replaced}\n                </div>"

    # MosaicGenerator wrapper does not have pointer-events-none, it has select-none
    # Let's check how MosaicGenerator wrapper is written:
    # <div className="my-4 rounded-2xl overflow-hidden border border-slate-200/60 aspect-[4/3] relative select-none shadow-sm bg-slate-50">
    #   <img src={mosaicImg} alt="Photo Mosaic Preview" className="w-full h-full object-cover" />
    # </div>
    if cfg["file"] == "MosaicGenerator.tsx":
        mosaic_wrapper_regex = r'(<div\s+className="my-4\s+rounded-2xl\s+overflow-hidden\s+border\s+border-slate-200/60\s+aspect-\[4/3\]\s+relative\s+select-none\s+shadow-sm\s+bg-slate-50">)(\s*<img\s+src=\{mosaicImg\}\s+alt="Photo Mosaic Preview"\s+className="w-full h-full object-cover"\s*/>)(\s*</div>)'
        
        def replace_mosaic(m):
            div_class = m.group(1)
            div_tag = div_class[:-2] + ' onMouseEnter={() => setIsDemoHovered(true)} onMouseLeave={() => setIsDemoHovered(false)} className="my-4 rounded-2xl overflow-hidden border border-slate-200/60 aspect-[4/3] relative select-none shadow-sm bg-slate-50 cursor-pointer">'
            img_tag = f'<img src={{isDemoHovered ? mosaicImg : mosaicStaticImg}} alt="Photo Mosaic Demo" className="w-full h-full object-cover" loading="lazy" />'
            return f"{div_tag}\n                  {img_tag}\n                </div>"
            
        content, count = re.subn(mosaic_wrapper_regex, replace_mosaic, content)
        print(f"[{cfg['file']}] Replaced image container (mosaic): {count} match(es)")
    else:
        content, count = re.subn(wrapper_regex, replace_container, content)
        print(f"[{cfg['file']}] Replaced image container: {count} match(es)")
        
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)

print("Finished Refactoring!")
