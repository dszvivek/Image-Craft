import re
import os
import pypdf

pdf_path = r"c:\Projects\Image Craft\HDFC Bank Statement 16-01-2026_signed.pdf"

if not os.path.exists(pdf_path):
    print(f"Error: file not found at {pdf_path}")
    exit(1)

reader = pypdf.PdfReader(pdf_path)
print(f"Loaded PDF with {len(reader.pages)} pages.")

for p_idx, page in enumerate(reader.pages):
    text = page.extract_text()
    print(f"\n--- Page {p_idx+1} ---")
    print(f"Extracted text length: {len(text) if text else 0} characters")
    if text:
        print("First 200 chars of extracted text:")
        print(repr(text[:200]))
        
        # Print a few lines that contain text
        lines = [line.strip() for line in text.split("\n") if line.strip()]
        print(f"Total lines: {len(lines)}")
        print("First 5 lines:")
        for line in lines[:5]:
            print(f"  - {line}")
