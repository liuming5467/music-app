#!/usr/bin/env python3
"""生成 PWA/APP 图标：紫粉渐变背景 + 系统字体渲染的白色音符 ♪（居中对称）"""
from PIL import Image, ImageDraw, ImageFont
import os

BASE = os.path.dirname(os.path.abspath(__file__))
FONT_PATH = '/System/Library/Fonts/STHeiti Medium.ttc'
NOTE = '\u266B'  # ♫ 双八分音符（左右更对称）

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

def make_icon(size, note_scale=0.62):
    """渐变背景 + 居中白色音符 + 圆角"""
    img = gradient_bg(size).convert('RGBA')
    draw = ImageDraw.Draw(img)

    # 字体渲染音符，anchor='mm' 精确居中
    font_size = int(size * 1.05)
    font = ImageFont.truetype(FONT_PATH, font_size)
    draw.text((size / 2, size / 2 + size * 0.02), NOTE,
              font=font, fill=(255, 255, 255, 255), anchor='mm')

    # 圆角蒙版
    mask = Image.new('L', (size, size), 0)
    mdraw = ImageDraw.Draw(mask)
    radius = int(size * 0.22)
    mdraw.rounded_rectangle([0, 0, size - 1, size - 1], radius=radius, fill=255)
    final = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    final.paste(img, (0, 0), mask)
    return final

def make_maskable(size):
    """maskable 图标：全幅渐变背景 + 音符缩小到 ~70% 居中（留 safe area）"""
    bg = gradient_bg(size).convert('RGBA')
    draw = ImageDraw.Draw(bg)
    font_size = int(size * 0.75)
    font = ImageFont.truetype(FONT_PATH, font_size)
    draw.text((size / 2, size / 2 + size * 0.015), NOTE,
              font=font, fill=(255, 255, 255, 255), anchor='mm')
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
