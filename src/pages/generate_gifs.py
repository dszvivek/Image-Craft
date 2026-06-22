import os
import math
from PIL import Image, ImageDraw, ImageFont, ImageFilter

# Define path constants
ASSETS_DIR = r"c:\Projects\Image Craft\src\assets"
BRAIN_DIR = r"C:\Users\dszvi\.gemini\antigravity-ide\brain\df4e2aa4-5ef4-42a8-9ea0-633d5a595a0b"
FONT_PATH = r"C:\Windows\Fonts\Arial.ttf"
FONT_BOLD_PATH = r"C:\Windows\Fonts\SegoeUIb.ttf"  # Fallback to Arial if not present

# Source human images from Artifacts directory
COMPRESSOR_SRC_PATH = os.path.join(BRAIN_DIR, "compressor_src_1782146383083.png")
BG_REMOVER_SRC_PATH = os.path.join(BRAIN_DIR, "bg_remover_src_1782146399351.png")
OCR_SRC_PATH = os.path.join(BRAIN_DIR, "ocr_src_1782146493366.png")
GRID_SPLITTER_SRC_PATH = os.path.join(BRAIN_DIR, "grid_splitter_src_1782146416365.png")
COLLAGE_SRC_A_PATH = os.path.join(BRAIN_DIR, "collage_src_a_1782146446692.png")
COLLAGE_SRC_B_PATH = os.path.join(BRAIN_DIR, "collage_src_b_1782146461856.png")
COLLAGE_SRC_C_PATH = os.path.join(BRAIN_DIR, "collage_src_c_1782146478762.png")
PALETTE_SRC_PATH = os.path.join(BRAIN_DIR, "palette_src_1782146430394.png")

# Helper to load fonts safely
def get_font(path, size):
    try:
        return ImageFont.truetype(path, size)
    except IOError:
        try:
            return ImageFont.truetype("C:\\Windows\\Fonts\\Arial.ttf", size)
        except IOError:
            return ImageFont.load_default()

font_title = get_font(FONT_BOLD_PATH, 14)
font_body = get_font(FONT_PATH, 11)
font_code = get_font(FONT_PATH, 10)
font_badge = get_font(FONT_BOLD_PATH, 9)

# Utility to crop to aspect ratio and resize
def crop_to_aspect_and_resize(img, target_w, target_h):
    img_ratio = img.width / float(img.height)
    target_ratio = target_w / float(target_h)
    if img_ratio > target_ratio:
        new_w = int(img.height * target_ratio)
        offset = (img.width - new_w) // 2
        img_cropped = img.crop((offset, 0, offset + new_w, img.height))
    else:
        new_h = int(img.width / target_ratio)
        offset = (img.height - new_h) // 2
        img_cropped = img.crop((0, offset, img.width, offset + new_h))
    return img_cropped.resize((target_w, target_h), Image.Resampling.LANCZOS)

# Utility to paste an image with rounded corners
def draw_rounded_image(dest_img, src_img, pos, radius):
    w, h = src_img.width, src_img.height
    mask = Image.new("L", (w, h), 0)
    m_draw = ImageDraw.Draw(mask)
    m_draw.rounded_rectangle([0, 0, w, h], radius=radius, fill=255)
    dest_img.paste(src_img, pos, mask=mask)

# Utility to remove a uniform studio background
def remove_background(img):
    img_rgba = img.convert("RGBA")
    w, h = img_rgba.width, img_rgba.height
    
    # Sample top-left and top-right corner pixels to average background color
    p1 = img_rgba.getpixel((2, 2))
    p2 = img_rgba.getpixel((w - 3, 2))
    bg_r = (p1[0] + p2[0]) // 2
    bg_g = (p1[1] + p2[1]) // 2
    bg_b = (p1[2] + p2[2]) // 2
    
    datas = img_rgba.getdata()
    new_data = []
    # Euclidean distance threshold
    threshold = 40
    
    for item in datas:
        r, g, b, a = item
        dist = math.sqrt((r - bg_r)**2 + (g - bg_g)**2 + (b - bg_b)**2)
        if dist < threshold:
            new_data.append((0, 0, 0, 0)) # fully transparent
        elif dist < threshold + 15:
            # linear alpha transition for smoother edges
            alpha = int(255 * ((dist - threshold) / 15.0))
            new_data.append((r, g, b, alpha))
        else:
            new_data.append((r, g, b, 255))
            
    img_rgba.putdata(new_data)
    return img_rgba

# Generate Feature 1: Compressor
def generate_compressor_gif():
    print("Generating Compressor GIF...")
    if not os.path.exists(COMPRESSOR_SRC_PATH):
        print(f"Error: missing {COMPRESSOR_SRC_PATH}")
        return
        
    frames = []
    w, h = 400, 300
    img_box = [35, 80, w-35, h-45]
    box_w = img_box[2] - img_box[0]
    box_h = img_box[3] - img_box[1]
    
    # Load and scale original human photo
    orig_raw = Image.open(COMPRESSOR_SRC_PATH)
    orig_photo = crop_to_aspect_and_resize(orig_raw, box_w, box_h)
    
    # Generate a realistic compressed version using JPEG compression at 85% quality (retains high sharpness and quality)
    from io import BytesIO
    buffer = BytesIO()
    orig_photo.save(buffer, format="JPEG", quality=85)
    buffer.seek(0)
    compressed_photo = Image.open(buffer).copy()
    
    for i in range(40):
        img = Image.new("RGB", (w, h), (248, 250, 252))
        draw = ImageDraw.Draw(img)
        
        # Grid dots backdrop
        for gx in range(10, w, 20):
            for gy in range(10, h, 20):
                draw.rectangle([gx, gy, gx+1, gy+1], fill=(226, 232, 240))
                
        # Main container
        draw.rounded_rectangle([20, 20, w-20, h-20], radius=16, fill=(255, 255, 255), outline=(226, 232, 240), width=1)
        
        # Header text
        draw.text((35, 35), "IMAGE COMPRESSOR", font=font_title, fill=(79, 70, 229))
        draw.text((35, 52), "Real-time slider optimization preview", font=font_body, fill=(100, 116, 139))
        
        # Slider calculation
        angle = (i / 40.0) * 2 * math.pi
        slider_x = int(200 + 130 * math.sin(angle))
        slider_x_clamped = min(max(slider_x, img_box[0]), img_box[2])
        
        # Paste original on the left side of the slider
        left_box = (0, 0, slider_x_clamped - img_box[0], box_h)
        if left_box[2] > left_box[0]:
            left_part = orig_photo.crop(left_box)
            img.paste(left_part, (img_box[0], img_box[1]))
            
        # Paste compressed version on the right side
        right_box = (slider_x_clamped - img_box[0], 0, box_w, box_h)
        if right_box[2] > right_box[0]:
            right_part = compressed_photo.crop(right_box)
            img.paste(right_part, (slider_x_clamped, img_box[1]))
            
        # Border around the photo
        draw.rectangle(img_box, outline=(203, 213, 225), width=2)
        
        # Slider vertical bar
        draw.line([(slider_x_clamped, img_box[1]), (slider_x_clamped, img_box[3])], fill=(79, 70, 229), width=2)
        # Handle circle
        draw.ellipse([slider_x_clamped-10, 150-10, slider_x_clamped+10, 150+10], fill=(79, 70, 229), outline=(255, 255, 255), width=2)
        draw.line([(slider_x_clamped-4, 150), (slider_x_clamped-1, 150-3)], fill=(255, 255, 255), width=1)
        draw.line([(slider_x_clamped-4, 150), (slider_x_clamped-1, 150+3)], fill=(255, 255, 255), width=1)
        draw.line([(slider_x_clamped+4, 150), (slider_x_clamped+1, 150-3)], fill=(255, 255, 255), width=1)
        draw.line([(slider_x_clamped+4, 150), (slider_x_clamped+1, 150+3)], fill=(255, 255, 255), width=1)
        
        # Badges
        draw.rounded_rectangle([45, 90, 130, 120], radius=4, fill=(30, 41, 59, 200), outline=(255, 255, 255), width=1)
        draw.text((52, 95), "ORIGINAL", font=font_badge, fill=(255, 255, 255))
        draw.text((52, 107), "4.2 MB", font=font_body, fill=(255, 255, 255))
        
        draw.rounded_rectangle([270, 90, 355, 120], radius=4, fill=(16, 185, 129, 220), outline=(255, 255, 255), width=1)
        draw.text((276, 95), "OPTIMIZED", font=font_badge, fill=(255, 255, 255))
        draw.text((276, 107), "242 KB (-94%)", font=font_body, fill=(255, 255, 255))
        
        frames.append(img)
        
    frames[0].save(os.path.join(ASSETS_DIR, "compressor_feature.gif"), save_all=True, append_images=frames[1:], optimize=False, duration=60, loop=0)

# Generate Feature 2: Background Remover
def generate_bg_remover_gif():
    print("Generating Background Remover GIF...")
    if not os.path.exists(BG_REMOVER_SRC_PATH):
        print(f"Error: missing {BG_REMOVER_SRC_PATH}")
        return
        
    frames = []
    w, h = 400, 300
    box = [35, 80, w-35, h-45]
    box_w = box[2] - box[0]
    box_h = box[3] - box[1]
    
    # Load and scale original portrait photo
    orig_raw = Image.open(BG_REMOVER_SRC_PATH)
    orig_portrait = crop_to_aspect_and_resize(orig_raw, box_w, box_h)
    
    # Cutout transparent version using chroma keying
    cutout_portrait = remove_background(orig_portrait)
    
    for i in range(40):
        img = Image.new("RGB", (w, h), (248, 250, 252))
        draw = ImageDraw.Draw(img)
        
        # Grid dots backdrop
        for gx in range(10, w, 20):
            for gy in range(10, h, 20):
                draw.rectangle([gx, gy, gx+1, gy+1], fill=(226, 232, 240))
                
        # Main container
        draw.rounded_rectangle([20, 20, w-20, h-20], radius=16, fill=(255, 255, 255), outline=(226, 232, 240), width=1)
        
        # Title text
        draw.text((35, 35), "AI BACKGROUND REMOVER", font=font_title, fill=(124, 58, 237))
        draw.text((35, 52), "On-device subject isolation model (RMBG)", font=font_body, fill=(100, 116, 139))
        
        # Determine scan line pos
        if i <= 5:
            y_scan = box[1] - 5
        elif i >= 32:
            y_scan = box[3] + 5
        else:
            t = (i - 5) / 27.0
            y_scan = box[1] + t * (box[3] - box[1])
            
        # Draw transparent checkerboard background base for the whole box
        for cy in range(box[1], box[3], 8):
            for cx in range(box[0], box[2], 8):
                rx1 = min(cx + 8, box[2])
                ry1 = min(cy + 8, box[3])
                color = (255, 255, 255) if ((cx - box[0]) // 8 + (cy - box[1]) // 8) % 2 == 0 else (226, 232, 240)
                draw.rectangle([cx, cy, rx1, ry1], fill=color)
                
        # Paste cutout transparent image on top (will show through checkerboard background)
        img_rgba = img.convert("RGBA")
        img_rgba.paste(cutout_portrait, (box[0], box[1]), mask=cutout_portrait)
        img = img_rgba.convert("RGB")
        draw = ImageDraw.Draw(img)
        
        # Overlay original image (with background) below the scanline
        if y_scan < box[3]:
            y_scan_clamped = int(max(y_scan, box[1]))
            crop_rect = (0, y_scan_clamped - box[1], box_w, box_h)
            if crop_rect[3] > crop_rect[1]:
                orig_slice = orig_portrait.crop(crop_rect)
                img.paste(orig_slice, (box[0], y_scan_clamped))
                
        # Draw container border
        draw.rectangle(box, outline=(203, 213, 225), width=2)
        
        # Draw glowing laser scanline
        if box[1] <= y_scan <= box[3]:
            draw.line([(box[0], y_scan), (box[2], y_scan)], fill=(124, 58, 237), width=3)
            draw.line([(box[0], y_scan-1), (box[2], y_scan-1)], fill=(167, 139, 250), width=1)
            draw.line([(box[0], y_scan+1), (box[2], y_scan+1)], fill=(167, 139, 250), width=1)
            
        # Badge
        if i <= 5:
            badge_text = "READY TO PROCESS"
            badge_color = (100, 116, 139)
        elif i >= 32:
            badge_text = "BACKGROUND CUTOUT SUCCESSFUL"
            badge_color = (16, 185, 129)
        else:
            badge_text = "ISOLATING SUBJECT..."
            badge_color = (124, 58, 237)
            
        draw.rounded_rectangle([45, 90, 230, 112], radius=4, fill=badge_color)
        draw.text((52, 96), badge_text, font=font_badge, fill=(255, 255, 255))
        
        frames.append(img)
        
    frames[0].save(os.path.join(ASSETS_DIR, "bg_remover_feature.gif"), save_all=True, append_images=frames[1:], optimize=False, duration=70, loop=0)

# Generate Feature 3: OCR Extractor
def generate_ocr_extractor_gif():
    print("Generating OCR Extractor GIF...")
    if not os.path.exists(OCR_SRC_PATH):
        print(f"Error: missing {OCR_SRC_PATH}")
        return
        
    frames = []
    w, h = 400, 300
    
    # Text to scan from the magazine cover
    lines_of_text = [
        "LIFESTYLE MAGAZINE",
        "ISSUE 04",
        "100% PRIVATE"
    ]
    
    # Load and scale original document photo
    orig_raw = Image.open(OCR_SRC_PATH)
    left_box = [35, 80, 200, h-45]
    box_w = left_box[2] - left_box[0]
    box_h = left_box[3] - left_box[1]
    doc_photo = crop_to_aspect_and_resize(orig_raw, box_w, box_h)
    
    for i in range(40):
        img = Image.new("RGB", (w, h), (248, 250, 252))
        draw = ImageDraw.Draw(img)
        
        # Grid dots
        for gx in range(10, w, 20):
            for gy in range(10, h, 20):
                draw.rectangle([gx, gy, gx+1, gy+1], fill=(226, 232, 240))
                
        # Main container
        draw.rounded_rectangle([20, 20, w-20, h-20], radius=16, fill=(255, 255, 255), outline=(226, 232, 240), width=1)
        
        # Title
        draw.text((35, 35), "LOCAL OCR TEXT EXTRACTOR", font=font_title, fill=(5, 150, 105))
        draw.text((35, 52), "Tesseract.js compiling in offline Web Workers", font=font_body, fill=(100, 116, 139))
        
        # Draw magazine cover document in left slot
        img.paste(doc_photo, (left_box[0], left_box[1]))
        draw.rectangle(left_box, outline=(203, 213, 225), width=1)
        
        # Right Panel (Output Text Editor)
        right_box = [215, 80, w-35, h-45]
        draw.rounded_rectangle(right_box, radius=8, fill=(15, 23, 42), outline=(51, 65, 85), width=1)
        draw.text((225, 90), "// Extracted text", font=font_code, fill=(148, 163, 184))
        
        # Scan animation state logic
        chars_to_show_1 = 0
        chars_to_show_2 = 0
        chars_to_show_3 = 0
        scan_box = None
        
        if 6 <= i <= 15:
            # Scan top section text
            scan_box = [40, 95, 195, 118]
            t = (i - 6) / 9.0
            chars_to_show_1 = int(len(lines_of_text[0]) * t)
        elif 16 <= i <= 25:
            chars_to_show_1 = len(lines_of_text[0])
            # Scan middle section text
            scan_box = [40, 145, 195, 168]
            t = (i - 16) / 9.0
            chars_to_show_2 = int(len(lines_of_text[1]) * t)
        elif 26 <= i <= 35:
            chars_to_show_1 = len(lines_of_text[0])
            chars_to_show_2 = len(lines_of_text[1])
            # Scan bottom section text
            scan_box = [40, 195, 195, 218]
            t = (i - 26) / 9.0
            chars_to_show_3 = int(len(lines_of_text[2]) * t)
        elif i > 35:
            chars_to_show_1 = len(lines_of_text[0])
            chars_to_show_2 = len(lines_of_text[1])
            chars_to_show_3 = len(lines_of_text[2])
            
        # Draw translucent scanning highlighter
        if scan_box:
            overlay = Image.new("RGBA", (w, h), (0, 0, 0, 0))
            o_draw = ImageDraw.Draw(overlay)
            o_draw.rectangle(scan_box, fill=(59, 130, 246, 40), outline=(59, 130, 246, 255), width=1)
            img = Image.alpha_composite(img.convert("RGBA"), overlay).convert("RGB")
            draw = ImageDraw.Draw(img)
            
        # Typewriter print text in dark editor panel
        editor_text_1 = lines_of_text[0][:chars_to_show_1]
        editor_text_2 = lines_of_text[1][:chars_to_show_2]
        editor_text_3 = lines_of_text[2][:chars_to_show_3]
        
        cursor = "|" if (i // 3) % 2 == 0 else ""
        y_offset = 115
        if chars_to_show_1 > 0:
            cursor_suff = cursor if chars_to_show_2 == 0 else ""
            draw.text((225, y_offset), editor_text_1 + cursor_suff, font=font_code, fill=(255, 255, 255))
            y_offset += 20
        if chars_to_show_2 > 0:
            cursor_suff = cursor if chars_to_show_3 == 0 else ""
            draw.text((225, y_offset), editor_text_2 + cursor_suff, font=font_code, fill=(255, 255, 255))
            y_offset += 20
        if chars_to_show_3 > 0:
            draw.text((225, y_offset), editor_text_3 + cursor, font=font_code, fill=(255, 255, 255))
            
        # Badges
        draw.rounded_rectangle([45, h-75, 120, h-55], radius=4, fill=(16, 185, 129))
        draw.text((50, h-70), "SCANNING...", font=font_badge, fill=(255, 255, 255))
        
        frames.append(img)
        
    frames[0].save(os.path.join(ASSETS_DIR, "ocr_extractor_feature.gif"), save_all=True, append_images=frames[1:], optimize=False, duration=80, loop=0)

# Generate Feature 4: Grid Splitter
def generate_grid_splitter_gif():
    print("Generating Grid Splitter GIF...")
    if not os.path.exists(GRID_SPLITTER_SRC_PATH):
        print(f"Error: missing {GRID_SPLITTER_SRC_PATH}")
        return
        
    frames = []
    w, h = 400, 300
    
    img_size = 150
    start_x, start_y = 125, 85
    
    # Load and scale original human photo into a square
    orig_raw = Image.open(GRID_SPLITTER_SRC_PATH)
    square_img = crop_to_aspect_and_resize(orig_raw, img_size, img_size)
    
    # Split into 3x3 square tiles (each 50x50)
    tile_size = 50
    tiles = []
    for r in range(3):
        row_tiles = []
        for c in range(3):
            tx0, ty0 = c * tile_size, r * tile_size
            tile_part = square_img.crop((tx0, ty0, tx0 + tile_size, ty0 + tile_size))
            row_tiles.append(tile_part)
        tiles.append(row_tiles)
        
    for i in range(40):
        img = Image.new("RGB", (w, h), (248, 250, 252))
        draw = ImageDraw.Draw(img)
        
        # Grid dots
        for gx in range(10, w, 20):
            for gy in range(10, h, 20):
                draw.rectangle([gx, gy, gx+1, gy+1], fill=(226, 232, 240))
                
        # Main container
        draw.rounded_rectangle([20, 20, w-20, h-20], radius=16, fill=(255, 255, 255), outline=(226, 232, 240), width=1)
        
        # Title
        draw.text((35, 35), "INSTAGRAM GRID SPLITTER", font=font_title, fill=(217, 70, 239))
        draw.text((35, 52), "Split large photos into layout rows or columns", font=font_body, fill=(100, 116, 139))
        
        # Determine gap offset spacing
        if i <= 7:
            gap = 0.0
        elif 8 <= i <= 22:
            t = (i - 8) / 14.0
            gap = 12.0 * t
        elif 23 <= i <= 33:
            gap = 12.0
        else:
            t = (i - 34) / 6.0
            gap = 12.0 * (1.0 - t)
            
        # Draw 3x3 cropped portions
        for r in range(3):
            for c in range(3):
                idx = r * 3 + c
                dx = (c - 1) * gap
                dy = (r - 1) * gap
                
                cx0 = start_x + c * tile_size + dx
                cy0 = start_y + r * tile_size + dy
                cx1 = cx0 + tile_size
                cy1 = cy0 + tile_size
                
                # Check for highlighted active panel download preview
                is_highlight = (idx == 0 and 23 <= i <= 33)
                
                # Draw the corresponding cropped image tile
                tile_part = tiles[r][c]
                if is_highlight:
                    # Scale highlighted tile slightly and draw double border
                    hlt_size = tile_size + 4
                    resized_hlt = tile_part.resize((hlt_size, hlt_size), Image.Resampling.LANCZOS)
                    draw_rounded_image(img, resized_hlt, (int(cx0 - 2), int(cy0 - 2)), 6)
                    draw.rounded_rectangle([cx0 - 2, cy0 - 2, cx1 + 2, cy1 + 2], radius=6, outline=(79, 70, 229), width=2)
                    draw.text((cx0 + 8, cy0 + 18), "DOWNLOAD", font=font_badge, fill=(255, 255, 255))
                else:
                    draw_rounded_image(img, tile_part, (int(cx0), int(cy0)), 4)
                    
        # Outline division cuts when gap is closed
        if gap == 0.0:
            for line in range(1, 3):
                lx = start_x + line * tile_size
                ly = start_y + line * tile_size
                draw.line([(lx, start_y), (lx, start_y + img_size)], fill=(255, 255, 255, 120), width=1)
                draw.line([(start_x, ly), (start_x + img_size, ly)], fill=(255, 255, 255, 120), width=1)
                
        # Layout metrics badge
        draw.rounded_rectangle([45, h-40, 160, h-22], radius=4, fill=(217, 70, 239))
        draw.text((50, h-36), f"LAYOUT: 3x3 GRID (GAP: {int(gap)}px)", font=font_badge, fill=(255, 255, 255))
        
        frames.append(img)
        
    frames[0].save(os.path.join(ASSETS_DIR, "grid_splitter_feature.gif"), save_all=True, append_images=frames[1:], optimize=False, duration=70, loop=0)

# Generate Feature 5: Collage Maker
def generate_collage_maker_gif():
    print("Generating Collage Maker GIF...")
    if not (os.path.exists(COLLAGE_SRC_A_PATH) and os.path.exists(COLLAGE_SRC_B_PATH) and os.path.exists(COLLAGE_SRC_C_PATH)):
        print("Error: missing collage source images")
        return
        
    frames = []
    w, h = 400, 300
    cx_start, cy_start = 90, 85
    
    # Load 3 collage photos
    img_a = Image.open(COLLAGE_SRC_A_PATH)
    img_b = Image.open(COLLAGE_SRC_B_PATH)
    img_c = Image.open(COLLAGE_SRC_C_PATH)
    
    for i in range(40):
        img = Image.new("RGB", (w, h), (248, 250, 252))
        draw = ImageDraw.Draw(img)
        
        # Grid dots
        for gx in range(10, w, 20):
            for gy in range(10, h, 20):
                draw.rectangle([gx, gy, gx+1, gy+1], fill=(226, 232, 240))
                
        # Main container
        draw.rounded_rectangle([20, 20, w-20, h-20], radius=16, fill=(255, 255, 255), outline=(226, 232, 240), width=1)
        
        # Title
        draw.text((35, 35), "PHOTO COLLAGE MAKER", font=font_title, fill=(219, 39, 119))
        draw.text((35, 52), "Interactive canvas grids with custom gap paddings", font=font_body, fill=(100, 116, 139))
        
        # Draw placeholder slots initially
        draw.rounded_rectangle([cx_start, cy_start, cx_start + 105, cy_start + 150], radius=4, fill=(241, 245, 249), outline=(226, 232, 240))
        draw.rounded_rectangle([cx_start + 109, cy_start, cx_start + 220, cy_start + 71], radius=4, fill=(241, 245, 249), outline=(226, 232, 240))
        draw.rounded_rectangle([cx_start + 109, cy_start + 75, cx_start + 220, cy_start + 150], radius=4, fill=(241, 245, 249), outline=(226, 232, 240))
        
        # Corner & spacing offsets at end state
        gap = 4
        radius = 4
        if 32 <= i <= 38:
            t_gap = (i - 32) / 6.0
            gap = 4 + int(8 * t_gap)
            radius = 4 + int(10 * t_gap)
        elif i > 38:
            gap = 12
            radius = 14
            
        # Draw Collage Image 1 (Left slot)
        if i >= 5:
            c1_x0 = cx_start
            if 5 <= i <= 13:
                t = (i - 5) / 8.0
                c1_x0 = int(-120 + (cx_start + 120) * t)
            
            c1_w = 110 - gap//2
            c1_photo = crop_to_aspect_and_resize(img_a, c1_w, 150)
            draw_rounded_image(img, c1_photo, (c1_x0, cy_start), radius)
            
        # Draw Collage Image 2 (Top right slot)
        if i >= 14:
            c2_y0 = cy_start
            if 14 <= i <= 22:
                t = (i - 14) / 8.0
                c2_y0 = int(-80 + (cy_start + 80) * t)
                
            c2_x0 = cx_start + 110 + gap//2
            c2_h = 75 - gap//2
            c2_w = 110 - gap//2
            c2_photo = crop_to_aspect_and_resize(img_b, c2_w, c2_h)
            draw_rounded_image(img, c2_photo, (c2_x0, c2_y0), radius)
            
        # Draw Collage Image 3 (Bottom right slot)
        if i >= 23:
            c3_scale = 1.0
            if 23 <= i <= 31:
                t = (i - 23) / 8.0
                c3_scale = t
                
            c3_x0 = cx_start + 110 + gap//2
            c3_y0 = cy_start + 75 + gap//2
            c3_w = 110 - gap//2
            c3_h = 75 - gap//2
            
            if c3_scale < 1.0:
                sw = int(c3_w * c3_scale)
                sh = int(c3_h * c3_scale)
                if sw > 2 and sh > 2:
                    c3_photo = crop_to_aspect_and_resize(img_c, sw, sh)
                    sdx = (c3_w - sw) // 2
                    sdy = (c3_h - sh) // 2
                    draw_rounded_image(img, c3_photo, (c3_x0 + sdx, c3_y0 + sdy), max(2, int(radius * c3_scale)))
            else:
                c3_photo = crop_to_aspect_and_resize(img_c, c3_w, c3_h)
                draw_rounded_image(img, c3_photo, (c3_x0, c3_y0), radius)
                
        # Status
        status_text = "READY"
        if 5 <= i <= 31:
            status_text = "ASSEMBLING PHOTOS..."
        elif i >= 32:
            status_text = f"SPACING ADJUSTED ({gap}px)"
            
        draw.rounded_rectangle([45, h-40, 200, h-22], radius=4, fill=(219, 39, 119))
        draw.text((50, h-36), status_text, font=font_badge, fill=(255, 255, 255))
        
        frames.append(img)
        
    frames[0].save(os.path.join(ASSETS_DIR, "collage_maker_feature.gif"), save_all=True, append_images=frames[1:], optimize=False, duration=75, loop=0)

# Generate Feature 6: Palette Extractor
def generate_palette_extractor_gif():
    print("Generating Palette Extractor GIF...")
    if not os.path.exists(PALETTE_SRC_PATH):
        print(f"Error: missing {PALETTE_SRC_PATH}")
        return
        
    frames = []
    w, h = 400, 300
    img_box = [35, 80, w-35, 175]
    box_w = img_box[2] - img_box[0]
    box_h = img_box[3] - img_box[1]
    
    # Load and scale original colorful photo
    orig_raw = Image.open(PALETTE_SRC_PATH)
    img_resized = crop_to_aspect_and_resize(orig_raw, box_w, box_h)
    
    # Sample real RGB colors from the photo at fixed spots
    sample_spots = [
        {"pos": (35, 20), "name": "Accent Pink"},
        {"pos": (120, 30), "name": "Vibrant Red"},
        {"pos": (200, 60), "name": "Neon Cyan"},
        {"pos": (280, 50), "name": "Gold Amber"}
    ]
    
    palette_colors = []
    for spot in sample_spots:
        rgb = img_resized.getpixel(spot["pos"])
        # ensure we drop alpha if present
        if len(rgb) > 3:
            rgb = rgb[:3]
        hex_str = f"#{rgb[0]:02X}{rgb[1]:02X}{rgb[2]:02X}"
        palette_colors.append({
            "color": rgb,
            "hex": hex_str,
            "name": spot["name"],
            # Translate position relative to the main frame container
            "pick_pos": (img_box[0] + spot["pos"][0], img_box[1] + spot["pos"][1])
        })
        
    sw_y = 195
    
    for i in range(40):
        img = Image.new("RGB", (w, h), (248, 250, 252))
        draw = ImageDraw.Draw(img)
        
        # Grid dots
        for gx in range(10, w, 20):
            for gy in range(10, h, 20):
                draw.rectangle([gx, gy, gx+1, gy+1], fill=(226, 232, 240))
                
        # Main container
        draw.rounded_rectangle([20, 20, w-20, h-20], radius=16, fill=(255, 255, 255), outline=(226, 232, 240), width=1)
        
        # Title
        draw.text((35, 35), "COLOR PALETTE EXTRACTOR", font=font_title, fill=(14, 116, 144))
        draw.text((35, 52), "Extract dominant HEX colors and source CSS codes", font=font_body, fill=(100, 116, 139))
        
        # Draw resized creative portrait inside image box
        img.paste(img_resized, (img_box[0], img_box[1]))
        draw.rectangle(img_box, outline=(203, 213, 225), width=2)
        
        # Eyedropper coordinate movements
        curr_target = None
        px, py = 200, 125 # resting default
        
        if 4 <= i <= 10:
            curr_target = 0
            t = (i - 4) / 6.0
            px = int(200 + (palette_colors[0]["pick_pos"][0] - 200) * t)
            py = int(125 + (palette_colors[0]["pick_pos"][1] - 125) * t)
        elif 11 <= i <= 17:
            curr_target = 1
            t = (i - 11) / 6.0
            p_prev = palette_colors[0]["pick_pos"]
            p_curr = palette_colors[1]["pick_pos"]
            px = int(p_prev[0] + (p_curr[0] - p_prev[0]) * t)
            py = int(p_prev[1] + (p_curr[1] - p_prev[1]) * t)
        elif 18 <= i <= 24:
            curr_target = 2
            t = (i - 18) / 6.0
            p_prev = palette_colors[1]["pick_pos"]
            p_curr = palette_colors[2]["pick_pos"]
            px = int(p_prev[0] + (p_curr[0] - p_prev[0]) * t)
            py = int(p_prev[1] + (p_curr[1] - p_prev[1]) * t)
        elif 25 <= i <= 31:
            curr_target = 3
            t = (i - 25) / 6.0
            p_prev = palette_colors[2]["pick_pos"]
            p_curr = palette_colors[3]["pick_pos"]
            px = int(p_prev[0] + (p_curr[0] - p_prev[0]) * t)
            py = int(p_prev[1] + (p_curr[1] - p_prev[1]) * t)
        elif i > 31:
            px, py = palette_colors[3]["pick_pos"]
            
        # Draw color swatches at bottom
        for idx in range(4):
            sw_x = 35 + idx * (70 + 15)
            has_color = False
            if idx == 0 and i >= 8: has_color = True
            if idx == 1 and i >= 15: has_color = True
            if idx == 2 and i >= 22: has_color = True
            if idx == 3 and i >= 29: has_color = True
            
            fill_color = palette_colors[idx]["color"] if has_color else (241, 245, 249)
            text_color = (255, 255, 255) if has_color else (148, 163, 184)
            label_color = palette_colors[idx]["hex"] if has_color else "EMPTY"
            
            draw.rounded_rectangle([sw_x, sw_y, sw_x + 70, sw_y + 55], radius=6, fill=fill_color, outline=(226, 232, 240), width=1)
            draw.text((sw_x + 8, sw_y + 12), palette_colors[idx]["name"][:10], font=font_badge, fill=text_color)
            draw.text((sw_x + 8, sw_y + 28), label_color, font=font_code, fill=text_color)
            
            # Show "COPIED" bubbles on swatch grab
            is_active_pick = (curr_target == idx and (4 + idx * 7 + 4) <= i <= (4 + idx * 7 + 6))
            if is_active_pick:
                draw.rounded_rectangle([sw_x-2, sw_y-2, sw_x + 72, sw_y + 57], radius=8, outline=(79, 70, 229), width=2)
                draw.rounded_rectangle([sw_x + 5, sw_y - 22, sw_x + 65, sw_y - 4], radius=4, fill=(15, 23, 42))
                draw.text((sw_x + 12, sw_y - 18), "COPIED!", font=font_badge, fill=(255, 255, 255))
                
        # Draw target cursor crosshair
        draw.line([(px - 12, py), (px + 12, py)], fill=(255, 255, 255), width=2)
        draw.line([(px, py - 12), (px, py + 12)], fill=(255, 255, 255), width=2)
        draw.ellipse([px-6, py-6, px+6, py+6], outline=(15, 23, 42), width=2)
        
        # Color magnification ring
        sampled_color = palette_colors[curr_target]["color"] if curr_target is not None else (255, 255, 255)
        draw.ellipse([px-14, py-42, px+14, py-28], fill=sampled_color, outline=(255, 255, 255), width=2)
        
        frames.append(img)
        
    frames[0].save(os.path.join(ASSETS_DIR, "palette_extractor_feature.gif"), save_all=True, append_images=frames[1:], optimize=False, duration=80, loop=0)

if __name__ == "__main__":
    os.makedirs(ASSETS_DIR, exist_ok=True)
    generate_compressor_gif()
    generate_bg_remover_gif()
    generate_ocr_extractor_gif()
    generate_grid_splitter_gif()
    generate_collage_maker_gif()
    generate_palette_extractor_gif()
    print("All human-focused GIFs generated successfully!")
