#!/usr/bin/env python3
"""生成 PWA/APP 图标：紫粉渐变背景 + 手绘对称双音符 ♫
设计要点：两根符干（竖线）严格对称于图标垂直中心线，音符头挂在符干正下方，
整体 ink 范围也严格居中，左右留白均衡。"""
from PIL import Image, ImageDraw
import os

BASE = os.path.dirname(os.path.abspath(__file__))

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

def draw_symmetric_note(img, size, note_h_ratio=0.56):
    """手绘对称双音符（基准 512 设计，按尺寸等比缩放）

    结构（以中心 c 对称）：
    - 两根符干：中心分别在 c-d 与 c+d（严格对称），从顶部贯穿到头部
    - 两个音符头：椭圆挂在符干正下方（头中心 = 干中心，对称）
    - 横梁：水平连接两干顶部
    整体 ink bbox 关于 c 中心完全对称。
    """
    k = size / 512.0
    c = size / 2
    white = (255, 255, 255, 255)
    d = 100 * k          # 符干距中心线半距（两干中心距 200*k）
    stem_w = 24 * k      # 符干宽
    head_w = 116 * k     # 音符头宽
    head_h = 78 * k      # 音符头高
    y_top = 130 * k      # 梁/干顶部
    head_cy = 377 * k    # 音符头中心 y
    beam_h = 54 * k      # 横梁高
    stem_bottom = 392 * k  # 符干底部（插入头内）

    draw = ImageDraw.Draw(img)
    for side in (-1, 1):
        x_center = c + side * d
        # 音符头（椭圆，中心 = 干中心）
        draw.ellipse([x_center - head_w/2, head_cy - head_h/2,
                      x_center + head_w/2, head_cy + head_h/2], fill=white)
        # 符干（矩形，中心对称于 x_center）
        draw.rectangle([x_center - stem_w/2, y_top,
                        x_center + stem_w/2, stem_bottom], fill=white)
    # 横梁：连接两干顶部（水平，覆盖两干并外延到干外缘）
    beam_left = c - d - stem_w/2 - 6 * k
    beam_right = c + d + stem_w/2 + 6 * k
    draw.rectangle([beam_left, y_top, beam_right, y_top + beam_h], fill=white)
    return img

def make_icon(size, note_h_ratio=0.56):
    """渐变背景 + 对称双音符 + 圆角"""
    img = gradient_bg(size).convert('RGBA')
    draw_symmetric_note(img, size, note_h_ratio)
    # 圆角蒙版
    mask = Image.new('L', (size, size), 0)
    mdraw = ImageDraw.Draw(mask)
    radius = int(size * 0.22)
    mdraw.rounded_rectangle([0, 0, size - 1, size - 1], radius=radius, fill=255)
    final = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    final.paste(img, (0, 0), mask)
    return final

def make_maskable(size):
    """maskable 图标：全幅渐变背景 + 音符缩到 40% 居中（留足 safe area）"""
    bg = gradient_bg(size).convert('RGBA')
    # 先在大画布绘制再等比缩小贴回，保证小尺寸下比例一致
    big = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw_symmetric_note(big, size, 0.56)
    # 缩放到 40% 高度（0.40/0.56 ≈ 0.714 倍）
    factor = 0.40 / 0.56
    new_w = int(size * factor)
    small = big.resize((new_w, new_w), Image.LANCZOS)
    # 只贴音符区域（big 大部分透明，resize 后整体贴上即可）
    bg.alpha_composite(small, ((size - new_w)//2, (size - new_w)//2))
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
