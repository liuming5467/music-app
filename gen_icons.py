#!/usr/bin/env python3
"""生成 PWA/APP 图标：渐变背景 + 白色音符"""
from PIL import Image, ImageDraw
import os

BASE = os.path.dirname(os.path.abspath(__file__))

def make_icon(size):
    """渐变背景（深紫 -> 品红）+ 白色八分音符对"""
    img = Image.new('RGB', (size, size), '#1a1030')
    draw = ImageDraw.Draw(img)

    # 对角渐变背景
    c1 = (106, 17, 203)    # 紫 #6a11cb
    c2 = (252, 70, 107)    # 粉 #fc466b
    for y in range(size):
        for_x_step = max(size - 1, 1)
        for x in range(0, size, 8):  # 步长8加速，后面再平滑
            pass
    # 逐行画渐变（水平插值近似对角）
    px = img.load()
    for y in range(size):
        for x in range(0, size, 4):
            t = (x + y) / (2 * size - 2)
            r = int(c1[0] + (c2[0] - c1[0]) * t)
            g = int(c1[1] + (c2[1] - c1[1]) * t)
            b = int(c1[2] + (c2[2] - c1[2]) * t)
            for dx in range(4):
                if x + dx < size:
                    px[x + dx, y] = (r, g, b)

    draw = ImageDraw.Draw(img)
    s = size
    # 白色双音符（♫）：两个音符头 + 两根符干 + 顶部横梁
    white = (255, 255, 255, 255)

    # 几何参数（按 512 基准缩放）
    k = s / 512.0
    # 音符头1（左）
    ex1, ey = 150 * k, 330 * k
    # 音符头2（右）
    ex2 = 320 * k
    ew, eh = 84 * k, 60 * k   # 椭圆宽高
    # 符干
    stem_w = 22 * k
    stem_top = 110 * k
    stem_bottom = ey + eh / 2
    # 横梁
    beam_h = 46 * k

    # 画音符头（椭圆）
    draw.ellipse([ex1 - ew/2, ey - eh/2, ex1 + ew/2, ey + eh/2], fill=white)
    draw.ellipse([ex2 - ew/2, ey - eh/2, ex2 + ew/2, ey + eh/2], fill=white)
    # 符干（右侧贴着椭圆）
    draw.rectangle([ex1 + ew/2 - stem_w, stem_top, ex1 + ew/2, stem_bottom], fill=white)
    draw.rectangle([ex2 + ew/2 - stem_w, stem_top, ex2 + ew/2, stem_bottom], fill=white)
    # 顶部横梁（连接两根符干，略微倾斜）
    beam = [(ex1 + ew/2 - stem_w, stem_top),
            (ex2 + ew/2, stem_top + 16 * k),
            (ex2 + ew/2, stem_top + 16 * k + beam_h),
            (ex1 + ew/2 - stem_w, stem_top + beam_h)]
    draw.polygon(beam, fill=white)

    # 圆角蒙版（PWA 图标常见圆角）
    mask = Image.new('L', (s, s), 0)
    mdraw = ImageDraw.Draw(mask)
    radius = int(s * 0.22)
    mdraw.rounded_rectangle([0, 0, s - 1, s - 1], radius=radius, fill=255)
    final = Image.new('RGBA', (s, s), (0, 0, 0, 0))
    final.paste(img, (0, 0), mask)
    return final

# maskable 图标（音符略小，留 safe area 边距）
def make_maskable(size):
    img = make_icon(size)
    bg = Image.new('RGBA', (size, size), (26, 16, 48, 255))  # 与背景色一致
    d = ImageDraw.Draw(bg)
    # maskable 全填充渐变
    c1 = (106, 17, 203); c2 = (252, 70, 107)
    px = bg.load()
    for y in range(size):
        for x in range(0, size, 4):
            t = (x + y) / (2 * size - 2)
            r = int(c1[0] + (c2[0] - c1[0]) * t)
            g = int(c1[1] + (c2[1] - c1[1]) * t)
            b = int(c1[2] + (c2[2] - c1[2]) * t)
            for dx in range(4):
                if x + dx < size:
                    px[x + dx, y] = (r, g, b, 255)
    # 把音符部分缩小到 70% 居中贴上
    inner = img.resize((int(size * 0.7), int(size * 0.7)), Image.LANCZOS)
    # inner 已带透明边，直接贴
    bg.paste(inner, (int(size * 0.15), int(size * 0.15)), inner)
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
    full = os.path.join(BASE, path)
    icon.save(full)
    print('saved', path)

# favicon（32x32）
favicon = make_icon(32).convert('RGBA')
favicon.save(os.path.join(BASE, 'icons/favicon-32.png'))
print('saved icons/favicon-32.png')
print('done')
