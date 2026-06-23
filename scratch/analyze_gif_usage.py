import os
import re

pages_dir = r"c:\Projects\Image Craft\src\pages"
gif_pages = [
    "AspectResizer.tsx", "BackgroundRemover.tsx", "BatchConverter.tsx", "CollageMaker.tsx",
    "Compressor.tsx", "GridSplitter.tsx", "MemeGenerator.tsx", "MetadataStripper.tsx",
    "MosaicGenerator.tsx", "OcrExtractor.tsx", "PaletteExtractor.tsx", "SvgVectorizer.tsx",
    "WatermarkOverlay.tsx"
]

for page in gif_pages:
    path = os.path.join(pages_dir, page)
    if os.path.exists(path):
        with open(path, "r", encoding="utf-8") as f:
            lines = f.readlines()
        
        print(f"=== {page} ===")
        for i, line in enumerate(lines):
            # Print imports of gif
            if ".gif" in line:
                print(f"L{i+1}: {line.strip()}")
            # Print img tag with gif variable
            if "src={" in line and ("gif" in line.lower() or "img" in line.lower()):
                print(f"L{i+1}: {line.strip()}")
                # Print neighboring lines to see pointer-events
                start = max(0, i - 3)
                end = min(len(lines), i + 4)
                print("Context:")
                for j in range(start, end):
                    print(f"  L{j+1}: {lines[j].strip()}")
