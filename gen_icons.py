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

def render_tilted_note(size, tilt=0, note_h_ratio=0.60):
    """Apple Music 风格双音符：粗壮圆润部件，水平放置（两干等高），裁剪后精确居中

    流程：透明图层画水平双音符 -> rotate(tilt)（默认 0 不倾斜）
    -> 裁剪 ink bbox -> 等比缩放到目标高度 -> 返回居中坐标
    """
    k = size / 512.0
    white = (255, 255, 255, 255)
    layer = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    c = size / 2
    dist = 85 * k        # 符干距中心线半距（Apple 音符两干间距紧凑）
    stem_w = 30 * k      # 符干宽（Apple 风格粗壮）
    y_top = 122 * k
    stem_bottom = 385 * k
    head_w = 112 * k     # 音符头宽（饱满圆润）
    head_h = 92 * k      # 音符头高（接近圆）
    head_cy = 372 * k
    head_dx = 34 * k     # 头中心相对符干中心的左偏
    beam_h = 58 * k      # 横梁厚

    for side in (-1, 1):
        stem_cx = c + side * dist
        head_cx = stem_cx - head_dx
        # 音符头
        d.ellipse([head_cx - head_w/2, head_cy - head_h/2,
                   head_cx + head_w/2, head_cy + head_h/2], fill=white)
        # 符干
        d.rectangle([stem_cx - stem_w/2, y_top,
                     stem_cx + stem_w/2, stem_bottom], fill=white)
    # 横梁
    d.rectangle([c - dist - stem_w/2, y_top,
                 c + dist + stem_w/2, y_top + beam_h], fill=white)

    # 整体姿态（tilt=0 时为水平，两干等高）
    rotated = layer.rotate(tilt, resample=Image.BICUBIC, expand=False)
    # 裁剪实际字形并缩放到目标高度
    bbox = rotated.getbbox()
    note = rotated.crop(bbox)
    target_h = int(size * note_h_ratio)
    target_w = max(1, int(note.width * target_h / note.height))
    note = note.resize((target_w, target_h), Image.LANCZOS)
    # 以字形中心精确居中
    x = (size - target_w) // 2
    y = (size - target_h) // 2
    return note, (x, y)

def draw_apple_style_note(img, size, note_h_ratio=0.80):
    """在渐变背景上合成 Apple 风格水平音符（居中，两干等高）"""
    note, (x, y) = render_tilted_note(size, tilt=0, note_h_ratio=note_h_ratio)
    img.alpha_composite(note, (x, y))
    return img

def make_icon(size):
    """渐变背景 + Apple 风格倾斜双音符 + 圆角"""
    img = gradient_bg(size).convert('RGBA')
    draw_apple_style_note(img, size, 0.80)
    # 圆角蒙版
    mask = Image.new('L', (size, size), 0)
    mdraw = ImageDraw.Draw(mask)
    radius = int(size * 0.22)
    mdraw.rounded_rectangle([0, 0, size - 1, size - 1], radius=radius, fill=255)
    final = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    final.paste(img, (0, 0), mask)
    return final

def make_maskable(size):
    """maskable 图标：全幅渐变背景 + 音符缩到 42% 居中（留足 safe area）"""
    bg = gradient_bg(size).convert('RGBA')
    draw_apple_style_note(bg, size, 0.60)
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
