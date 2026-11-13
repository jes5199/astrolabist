"""Generate the original border artwork for the illuminated treatise page.

All shapes are drawn here by hand (paths, circles); nothing is traced.
Writes into public/treatise-art/.
"""
import sys, os

OUT = sys.argv[1]

INK = "#2a1a0e"
BLUE = "#2b4c9b"
BLUE_D = "#1c3577"
ROSE = "#c0516b"
ROSE_D = "#94324c"
VERM = "#c23a22"

GOLD_DEFS = """
<linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
  <stop offset="0" stop-color="#fff3b8"/>
  <stop offset=".35" stop-color="#e2b343"/>
  <stop offset=".7" stop-color="#b07d1c"/>
  <stop offset="1" stop-color="#f0cd62"/>
</linearGradient>
"""

# Trilobed ivy leaf, stem at origin, pointing up (-y), ~18 tall.
IVY = ("M0 0 C-2 -1.5 -7.5 -1 -9.5 -5.5 C-7 -6.5 -6.5 -9 -7.5 -12.5 "
       "C-4 -11.5 -1.5 -14 0 -18 C1.5 -14 4 -11.5 7.5 -12.5 "
       "C6.5 -9 7 -6.5 9.5 -5.5 C7.5 -1 2 -1.5 0 0Z")


def ivy(x, y, rot, s=1.0):
    return (f'<g transform="translate({x} {y}) rotate({rot}) scale({s})">'
            f'<path d="{IVY}" fill="url(#g)" stroke="{INK}" stroke-width=".7" stroke-linejoin="round"/>'
            f'<path d="M0 -1 L0 -12 M0 -6 L-4 -8 M0 -6 L4 -8" fill="none" stroke="{INK}" stroke-width=".4"/>'
            '</g>')


def bezants(x, y, s=1.0):
    pts = [(0, 0), (3.2, -2.2), (-3.2, -2.2), (0, -4.6)]
    out = []
    for dx, dy in pts[:3]:
        out.append(f'<circle cx="{x+dx*s:.1f}" cy="{y+dy*s:.1f}" r="{1.6*s:.2f}" fill="url(#g)" stroke="{INK}" stroke-width=".45"/>')
    return "".join(out)


def flower(x, y, c1, c2):
    # Five-petalled flower seen face-on: coloured petals, gold heart.
    petals = []
    for i in range(5):
        a = i * 72
        petals.append(f'<ellipse cx="0" cy="-3.6" rx="2.2" ry="3.4" transform="rotate({a})" fill="{c1}" stroke="{INK}" stroke-width=".45"/>')
    return (f'<g transform="translate({x} {y})">{"".join(petals)}'
            f'<circle r="1.9" fill="url(#g)" stroke="{INK}" stroke-width=".45"/>'
            f'<circle r=".6" fill="{c2}"/></g>')


def hairs(x, y, ang_list, ln=6):
    import math
    out = []
    for a in ang_list:
        r = math.radians(a)
        x2, y2 = x + ln * math.cos(r), y + ln * math.sin(r)
        out.append(f'<path d="M{x} {y} Q{(x+x2)/2 + 1.5:.1f} {(y+y2)/2 - 1.5:.1f} {x2:.1f} {y2:.1f}" fill="none" stroke="{INK}" stroke-width=".45"/>')
        out.append(f'<circle cx="{x2:.1f}" cy="{y2:.1f}" r="1.05" fill="url(#g)" stroke="{INK}" stroke-width=".3"/>')
    return "".join(out)


def filigree(x, y0, y1):
    # White penwork running down a coloured bar: a looping hairline.
    d = [f"M{x} {y0+3}"]
    y = y0 + 3
    flip = 1
    while y + 8 < y1 - 2:
        d.append(f"q{2.2*flip} 2 0 4 q{-2.2*flip} 2 0 4")
        y += 8
        flip = -flip
    return (f'<path d="{" ".join(d)}" fill="none" stroke="#fff" stroke-opacity=".85" stroke-width=".55"/>')


def vine_tile():
    """Vertical tile, 72 x 220. Bar centred on x=36."""
    W, H = 72, 220
    bx0, bx1 = 32.5, 39.5
    p = []
    # Tendrils first (behind the bar).
    t = f'fill="none" stroke="{INK}" stroke-width=".85" stroke-linecap="round"'
    p.append(f'<path d="M{bx0} 34 C24 30 14 34 11 44 C9 51 12 58 18 58" {t}/>')
    p.append(ivy(18, 58, 140, 0.95))
    p.append(f'<path d="M14 40 C10 34 8 28 11 22" {t}/>')
    p.append(ivy(11, 22, -10, 0.7))
    p.append(hairs(22, 32, [-120, -80, -150]))
    p.append(f'<path d="M{bx1} 70 C48 66 58 70 60 80 C61 86 58 90 54 90" {t}/>')
    p.append(flower(54, 92, BLUE, VERM))
    p.append(f'<path d="M58 76 C64 72 66 66 63 60" {t}/>')
    p.append(bezants(63, 60, 1))
    p.append(f'<path d="M{bx1} 150 C50 146 61 152 62 164 C63 172 58 177 52 176" {t}/>')
    p.append(ivy(52, 176, -140, 0.95))
    p.append(f'<path d="M60 158 C66 152 66 146 63 141" {t}/>')
    p.append(ivy(63, 141, 10, 0.7))
    p.append(hairs(48, 148, [-60, -100, -30]))
    p.append(f'<path d="M{bx0} 182 C24 180 14 186 12 196 C11 202 14 206 18 206" {t}/>')
    p.append(flower(16, 208, ROSE, BLUE))
    p.append(f'<path d="M13 190 C7 186 6 180 9 175" {t}/>')
    p.append(bezants(9, 175, 1))
    p.append(f'<path d="M{bx0} 118 C26 116 21 120 20 126" {t}/>')
    p.append(hairs(20, 126, [100, 140, 170], 5))
    p.append(f'<path d="M{bx1} 8 C46 8 50 12 50 18" {t}/>')
    p.append(hairs(50, 18, [40, 80, 10], 5))
    # Bar: blue and rose panels with gold knots.
    p.append(f'<rect x="{bx0}" y="2.5" width="7" height="101" fill="{BLUE}" stroke="{INK}" stroke-width=".6"/>')
    p.append(f'<rect x="{bx0}" y="116.5" width="7" height="101" fill="{ROSE}" stroke="{INK}" stroke-width=".6"/>')
    p.append(f'<rect x="{bx0+1.3}" y="2.5" width="1.2" height="101" fill="{BLUE_D}" opacity=".6"/>')
    p.append(f'<rect x="{bx0+1.3}" y="116.5" width="1.2" height="101" fill="{ROSE_D}" opacity=".6"/>')
    p.append(filigree(36, 2.5, 103.5))
    p.append(filigree(36, 116.5, 217.5))
    # Gold knot: a small quatrefoil boss.
    p.append('<g transform="translate(36 110)">'
             '<path d="M0 -8 C4 -8 4 -4 8 -4 C8 0 8 0 8 4 C4 4 4 8 0 8 C-4 8 -4 4 -8 4 C-8 0 -8 0 -8 -4 C-4 -4 -4 -8 0 -8Z" '
             f'fill="url(#g)" stroke="{INK}" stroke-width=".6"/>'
             f'<circle r="2.6" fill="{VERM}" stroke="{INK}" stroke-width=".4"/>'
             '<circle r=".8" cx="-.7" cy="-.7" fill="#fff" opacity=".8"/></g>')
    # Gold bands at the tile seam.
    p.append(f'<rect x="{bx0-1.5}" y="0" width="10" height="2.5" fill="url(#g)"/>')
    p.append(f'<rect x="{bx0-1.5}" y="217.5" width="10" height="2.5" fill="url(#g)"/>')
    return W, H, "".join(p)


def svg(w, h, body, defs=GOLD_DEFS):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}">'
            f'<defs>{defs}</defs>{body}</svg>\n')


def write(name, text):
    with open(os.path.join(OUT, name), "w") as f:
        f.write(text)


W, H, body = vine_tile()
write("vine-v.svg", svg(W, H, body))
write("vine-h.svg", svg(H, W, f'<g transform="translate(0 {W}) rotate(-90)">{body}</g>'))

# Corner boss: gold square with a lozenge of blue and a rose quatrefoil.
boss = (
    f'<rect x="4" y="4" width="32" height="32" fill="url(#g)" stroke="{INK}" stroke-width=".8"/>'
    f'<rect x="8" y="8" width="24" height="24" fill="{BLUE}" stroke="{INK}" stroke-width=".6"/>'
    '<path d="M20 9 C24 9 24 15 31 20 C24 25 24 31 20 31 C16 31 16 25 9 20 C16 15 16 9 20 9Z" '
    f'fill="{ROSE}" stroke="{INK}" stroke-width=".6"/>'
    f'<circle cx="20" cy="20" r="3.4" fill="url(#g)" stroke="{INK}" stroke-width=".5"/>'
    '<path d="M11 11 l2 2 M29 11 l-2 2 M11 29 l2 -2 M29 29 l-2 -2" stroke="#fff" stroke-width=".7"/>'
    '<path d="M20 12.5 q1.2 3 0 5 M20 27.5 q-1.2 -3 0 -5 M12.5 20 q3 -1.2 5 0 M27.5 20 q-3 1.2 -5 0" '
    'fill="none" stroke="#fff" stroke-width=".5" stroke-opacity=".8"/>'
)
write("boss.svg", svg(40, 40, boss))

# Diapered ground for miniatures: blue field, rose lozenges, gold trellis.
diaper = (
    f'<rect width="20" height="20" fill="{BLUE_D}"/>'
    f'<path d="M10 0 L20 10 L10 20 L0 10Z" fill="{ROSE_D}"/>'
    '<path d="M10 0 L20 10 L10 20 L0 10Z" fill="none" stroke="url(#g)" stroke-width=".9"/>'
    '<g fill="url(#g)"><circle cx="10" cy="0" r="1.4"/><circle cx="10" cy="20" r="1.4"/>'
    '<circle cx="0" cy="10" r="1.4"/><circle cx="20" cy="10" r="1.4"/></g>'
    '<g fill="#fff" opacity=".75"><circle cx="10" cy="8.6" r=".55"/><circle cx="10" cy="11.4" r=".55"/>'
    '<circle cx="8.6" cy="10" r=".55"/><circle cx="11.4" cy="10" r=".55"/>'
    '<circle cx="1.6" cy="1.6" r=".5"/><circle cx="18.4" cy="1.6" r=".5"/>'
    '<circle cx="1.6" cy="18.4" r=".5"/><circle cx="18.4" cy="18.4" r=".5"/></g>'
)
write("diaper.svg", svg(20, 20, diaper))

# White penwork for the grounds of painted initials (transparent tile).
fil = (
    '<g fill="none" stroke="#fff" stroke-width=".6" stroke-opacity=".7" stroke-linecap="round">'
    '<path d="M2 12 c2 -6 6 -6 6 -2 c0 3 -4 3 -3 0"/>'
    '<path d="M14 4 c2 3 6 3 6 0 c0 -2 -3 -2 -2.5 0"/>'
    '<path d="M13 18 c3 1 5 -1 4 -3"/>'
    '</g><g fill="#fff" fill-opacity=".75"><circle cx="11" cy="9" r=".6"/><circle cx="3" cy="3" r=".5"/>'
    '<circle cx="20" cy="14" r=".5"/><circle cx="6" cy="19" r=".5"/></g>'
)
write("penwork.svg", svg(22, 22, fil, ""))

# Vellum: fine grain and broad mottling from turbulence. Original filter, no image.
vellum = (
    '<filter id="f" x="0" y="0" width="100%" height="100%">'
    '<feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="3" seed="7" stitchTiles="stitch"/>'
    '<feColorMatrix values="0 0 0 0 .42  0 0 0 0 .3  0 0 0 0 .16  0 0 0 .55 -.18"/></filter>'
    '<filter id="m" x="0" y="0" width="100%" height="100%">'
    '<feTurbulence type="fractalNoise" baseFrequency=".012" numOctaves="3" seed="3" stitchTiles="stitch"/>'
    '<feColorMatrix values="0 0 0 0 .55  0 0 0 0 .38  0 0 0 0 .15  0 0 0 .9 -.38"/></filter>'
)
write("vellum.svg",
      f'<svg xmlns="http://www.w3.org/2000/svg" width="420" height="420" viewBox="0 0 420 420">'
      f'<defs>{vellum}</defs><rect width="420" height="420" filter="url(#m)"/>'
      f'<rect width="420" height="420" filter="url(#f)"/></svg>\n')

# Tooled leather for the lectern behind the leaves: blind-stamped lattice.
leather = (
    '<filter id="n"><feTurbulence type="fractalNoise" baseFrequency=".7" numOctaves="2" seed="11" stitchTiles="stitch"/>'
    '<feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .35 0"/></filter>'
)
leather_body = (
    '<rect width="96" height="96" filter="url(#n)"/>'
    '<g fill="none" stroke="#000" stroke-opacity=".28" stroke-width="1.2">'
    '<path d="M48 0 L96 48 L48 96 L0 48Z"/></g>'
    '<g fill="none" stroke="#e8c27a" stroke-opacity=".10" stroke-width=".8">'
    '<path d="M48 2 L94 48 L48 94 L2 48Z"/></g>'
    '<g transform="translate(48 48)" fill="#000" fill-opacity=".22">'
    '<path d="M0 -9 C3 -3 3 -3 9 0 C3 3 3 3 0 9 C-3 3 -3 3 -9 0 C-3 -3 -3 -3 0 -9Z"/></g>'
    '<g fill="#e8c27a" fill-opacity=".14"><circle cx="0" cy="0" r="2"/><circle cx="96" cy="0" r="2"/>'
    '<circle cx="0" cy="96" r="2"/><circle cx="96" cy="96" r="2"/></g>'
)
write("leather.svg",
      f'<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">'
      f'<defs>{leather}</defs>{leather_body}</svg>\n')

# Marginal drolleries: a sun in splendour and a fixed star, painted in the margin.
import math
rays = []
for i in range(16):
    a = math.radians(i * 22.5)
    if i % 2 == 0:
        xl, yl = 50 + 22 * math.cos(a - .13), 50 + 22 * math.sin(a - .13)
        xr, yr = 50 + 22 * math.cos(a + .13), 50 + 22 * math.sin(a + .13)
        x2, y2 = 50 + 44 * math.cos(a), 50 + 44 * math.sin(a)
        rays.append(f'<path d="M{xl:.1f} {yl:.1f} L{x2:.1f} {y2:.1f} L{xr:.1f} {yr:.1f}Z" fill="url(#g)" stroke="{INK}" stroke-width=".6"/>')
    else:
        pts = []
        for k in range(9):
            r = 23 + k * 2.2
            w = (1.8 if k % 2 else -1.8)
            pts.append(f"{50 + r*math.cos(a) - w*math.sin(a):.1f} {50 + r*math.sin(a) + w*math.cos(a):.1f}")
        rays.append(f'<path d="M{" L".join(pts)}" fill="none" stroke="{VERM}" stroke-width="1.3" stroke-linecap="round"/>')
sun = (
    "".join(rays) +
    f'<circle cx="50" cy="50" r="22" fill="url(#g)" stroke="{INK}" stroke-width=".8"/>'
    f'<circle cx="50" cy="50" r="18.5" fill="none" stroke="{INK}" stroke-width=".35" stroke-dasharray="1 1.6"/>'
    f'<g fill="none" stroke="{INK}" stroke-width=".8" stroke-linecap="round">'
    '<path d="M41 45 q3 -2.5 6 0 M53 45 q3 -2.5 6 0"/>'
    '<path d="M42.5 47.6 q1.8 1 3.6 0 M54 47.6 q1.8 1 3.6 0"/>'
    '<path d="M50 46 q-1.5 5 -.5 7.5 q1 .6 2 0"/>'
    '<path d="M45.5 57.5 q4.5 3 9 0"/>'
    '<path d="M39 41 q4 -3.5 8 -1.5 M53 39.5 q4 -2 8 1.5"/></g>'
    f'<g fill="{ROSE}" opacity=".45"><circle cx="41" cy="53" r="2.6"/><circle cx="59" cy="53" r="2.6"/></g>'
)
write("marg-sun.svg", svg(100, 100, sun))

star = []
for i in range(8):
    a = math.radians(i * 45 - 90)
    r = 40 if i % 2 == 0 else 26
    x2, y2 = 50 + r * math.cos(a), 50 + r * math.sin(a)
    xl, yl = 50 + 9 * math.cos(a - .5), 50 + 9 * math.sin(a - .5)
    xr, yr = 50 + 9 * math.cos(a + .5), 50 + 9 * math.sin(a + .5)
    star.append(f'<path d="M{xl:.1f} {yl:.1f} L{x2:.1f} {y2:.1f} L{xr:.1f} {yr:.1f}Z" fill="url(#g)" stroke="{INK}" stroke-width=".6"/>')
    star.append(f'<path d="M50 50 L{x2:.1f} {y2:.1f}" stroke="{INK}" stroke-width=".35"/>')
star_s = ("".join(star) +
          f'<circle cx="50" cy="50" r="9" fill="{BLUE}" stroke="{INK}" stroke-width=".6"/>'
          f'<circle cx="50" cy="50" r="4" fill="{VERM}" stroke="{INK}" stroke-width=".4"/>'
          '<circle cx="48.6" cy="48.6" r="1.2" fill="#fff" opacity=".8"/>')
write("marg-star.svg", svg(100, 100, star_s))
print("ok")
