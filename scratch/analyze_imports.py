import os
import re

src_dir = r"c:\Projects\Image Craft\src"
imports = {}

for root, dirs, files in os.walk(src_dir):
    for filename in files:
        if filename.endswith((".tsx", ".ts")):
            path = os.path.join(root, filename)
            rel_path = os.path.relpath(path, src_dir)
            with open(path, "r", encoding="utf-8") as f:
                content = f.read()
                # Match imports
                matches = re.findall(r"import\s+.*?\s+from\s+['\"](.*?)['\"]", content)
                imports[rel_path] = matches

for file_path, imp_list in imports.items():
    non_local = [imp for imp in imp_list if not imp.startswith(".") and not imp.startswith("/")]
    if non_local:
        print(f"File: {file_path}")
        for imp in non_local:
            print(f"  - {imp}")
