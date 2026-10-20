#!/usr/bin/env python3
"""生成 PWA/APP 图标：紫粉渐变背景 + 白色双音符 ♫（按字形精确居中、左右对称）"""
from PIL import Image, ImageDraw, ImageFont
import os

BASE = os.path.dirname(os.path.abspath(__file__))
FONT_PATH = '/System/Library/Fonts/STHeiti Medium.ttc'
NOTE = '\u266B'  # ♫ 双八分音符

def gradient_bg(size):
    """对角渐变背景（紫 -> 粉），逐行插值"""
    c1 = (106, 17, 203)    # 紫 #6a11cb
    c2 = (252, 70, 107)    # 粉 #fc466b
    img = Image.new('RGB', (size, size))
    px = img.load()
    denom = 2 * size - 2
    for y in range(size):
        for x in range(0, size, 4):
            t = (x + y) / denom
            r = int(c1[0] + (c2[0] - c1[0]) * t)
            g = int(c1[1] + (c2[1] - c1[1]) * t)
            b = int(c1[2] + (c2[2] - c1[2]) * t)
            for dx in range(4):
                if x + dx < size:
                    px[x + dx, y] = (r, g, b)
    return img

def render_note(font_size):
    """高分辨率渲染音符，裁剪出实际字形（ink bbox）"""
    font = ImageFont.truetype(FONT_PATH, font_size)
    tmp = Image.new('RGBA', (font_size * 2, font_size * 2), (0, 0, 0, 0))
    d = ImageDraw.Draw(tmp)
    d.text((font_size, font_size), NOTE, font=font, fill=(255, 255, 255, 255), anchor='mm')
    bbox = tmp.getbbox()
    if not bbox:
        raise RuntimeError('音符字形渲染失败')
    return tmp.crop(bbox)

def paste_note_centered(img, size, note_h_ratio):
    """音符按目标高度等比缩放后，以字形中心精确对齐图标中心（左右对称）"""
    # 用 4x 目标高度渲染，缩小后边缘更平滑
    render_h = int(size * note_h_ratio) * 4
    note = render_note(max(render_h, 200))
    target_h = int(size * note_h_ratio)
    target_w = max(1, int(note.width * target_h / note.height))
    note = note.resize((target_w, target_h), Image.LANCZOS)
    # 字形中心 = 图标中心
    x = (size - target_w) // 2
    y = (size - target_h) // 2
    img.alpha_composite(note, (x, y))
    return img

def make_icon(size, note_h_ratio=0.52):
    """渐变背景 + 居中白色音符（高度占 52%，留呼吸空间）+ 圆角"""
    img = gradient_bg(size).convert('RGBA')
    paste_note_centered(img, size, note_h_ratio)
    # 圆角蒙版
    mask = Image.new('L', (size, size), 0)
    mdraw = ImageDraw.Draw(mask)
    radius = int(size * 0.22)
    mdraw.rounded_rectangle([0, 0, size - 1, size - 1], radius=radius, fill=255)
    final = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    final.paste(img, (0, 0), mask)
    return final

def make_maskable(size, note_h_ratio=0.38):
    """maskable 图标：全幅渐变背景 + 音符高 38%（留足 safe area）"""
    bg = gradient_bg(size).convert('RGBA')
    paste_note_centered(bg, size, note_h_ratio)
    return bg

sizes = {
    'icons/icon-192.png': (192, False),
    'icons/icon-512.png': (512, False),
    'icons/apple-touch-icon.png': (180, False),
    'icons/maskable-192.png': (192, True),
    'icons/maskable-512.png': (512, True),
}
for path, (sz, maskable) in sizes.items():
    icon = make_maskable(sz) if maskable else make_icon(sz)
    icon.save(os.path.join(BASE, path))
    print('saved', path)

favicon = make_icon(32)
favicon.save(os.path.join(BASE, 'icons/favicon-32.png'))
print('saved icons/favicon-32.png')
print('done')
