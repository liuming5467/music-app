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

def draw_standard_note(img, size):
    """手绘标准乐理形态双音符 ♫（基准 512 设计，按尺寸等比缩放）

    标准形态（乐谱里的样子）：
    - 音符头：椭圆，位于符干的左下方
    - 符干：从音符头右侧竖直向上
    - 横梁：水平连接两干顶部
    布局约束：两根符干中心严格对称于图标垂直中心线。
    """
    k = size / 512.0
    c = size / 2
    white = (255, 255, 255, 255)
    d = 98 * k           # 符干距中心线半距（两干中心距 196*k，严格对称）
    stem_w = 26 * k      # 符干宽
    y_top = 130 * k      # 梁/干顶部
    stem_bottom = 382 * k  # 符干底部（到头中心线）
    head_w = 112 * k     # 音符头宽
    head_h = 76 * k      # 音符头高
    head_cy = 375 * k    # 音符头中心 y
    head_dx = 40 * k     # 头中心相对符干中心的左偏（头在干左下）
    beam_h = 56 * k      # 横梁高
    beam_pad = 2 * k     # 横梁在干外的延伸

    draw = ImageDraw.Draw(img)
    for side in (-1, 1):
        stem_cx = c + side * d          # 符干中心（对称于 c）
        head_cx = stem_cx - head_dx      # 音符头中心（干的左下方）
        # 音符头（椭圆）
        draw.ellipse([head_cx - head_w/2, head_cy - head_h/2,
                      head_cx + head_w/2, head_cy + head_h/2], fill=white)
        # 符干（从头顶部向上）
        draw.rectangle([stem_cx - stem_w/2, y_top,
                        stem_cx + stem_w/2, stem_bottom], fill=white)
    # 横梁：水平连接两干顶部
    draw.rectangle([c - d - stem_w/2 - beam_pad, y_top,
                    c + d + stem_w/2 + beam_pad, y_top + beam_h], fill=white)
    return img

def make_icon(size):
    """渐变背景 + 标准双音符 + 圆角"""
    img = gradient_bg(size).convert('RGBA')
    draw_standard_note(img, size)
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
    draw_standard_note(big, size)
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
