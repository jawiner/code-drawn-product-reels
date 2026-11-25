"""Check a 3D film's layout with numbers before writing any animation: project every board's corners and every map
pin through each camera key, using the same maths as the CSS 3D transform in the film, and print where each lands
on the 1080x1920 frame (x, y) and how big it is (s).

This copy is the check written for the FIRST LeadFlow cut (v1: four boards on a path rising from the map). The
final film (v3) uses one board over the map, so the numbers below are v1's: copy the file and change BOARDS, PINS
and KEYS to your own film's. Things it catches: a board outside the frame, two boards on top of each other, a
camera key that looks at nothing, the eye flying through a board (a huge blurry plane on screen).

    python tools/layout_check_example.py
"""
import math

P = 1400
YF = 1000
r = math.radians


def to_cam(v, c):
    x, y, z = v[0] - c['t'][0], v[1] - c['t'][1], v[2] - c['t'][2]
    ay, ap = r(c['yaw']), r(c['pitch'])
    x1 = x * math.cos(ay) + z * math.sin(ay)
    z1 = -x * math.sin(ay) + z * math.cos(ay)
    y2 = y * math.cos(ap) - z1 * math.sin(ap)
    z2 = y * math.sin(ap) + z1 * math.cos(ap)
    return x1, y2, z2 + P - c['d']


def proj(v, c):
    x, y, z = to_cam(v, c)
    w = P - z
    s = P / max(w, 1)
    return round(540 + x * s), round(960 + y * s), round(s, 2)


def eye(c):
    p, y = r(c['pitch']), r(c['yaw'])
    return (c['t'][0] - c['d'] * math.cos(p) * math.sin(y), c['t'][1] + c['d'] * math.sin(p), c['t'][2] + c['d'] * math.cos(p) * math.cos(y))


BOARDS = {
    'col': ([150, -60, -1500], 0, 1080, 1920),
    'dana': ([1500, -700, -2500], -28, 1080, 1920),
    'phone': ([2350, -1250, -3600], -42, 680, 1420),
    'quote': ([3100, -1900, -4800], -52, 1080, 1920),
}


def corners(b):
    (cx, cy, cz), rot, w, h = b
    out = []
    for lx, ly in [(-w / 2, -h / 2), (w / 2, -h / 2), (w / 2, h / 2), (-w / 2, h / 2)]:
        out.append([cx + lx * math.cos(r(rot)), cy + ly, cz - lx * math.sin(r(rot))])
    return out


PINS = {'dana': (83, 22), 'liat': (17, 19), 'noga': (50, 12), 'barber': (20, 51), 'carmel': (53, 45), 'hadar': (79, 57), 'batgalim': (16, 84), 'shiri': (46, 80), 'mor': (81, 88)}
pin = lambda p: [(p[0] - 50) * 18, YF, (p[1] - 50) * 18]


def frame_cam(name, rot, off, d, pitch=-3, dy=0):
    (cx, cy, cz), _, _, _ = BOARDS[name]
    return {'t': [cx, cy + dy, cz], 'd': d, 'yaw': -rot + off, 'pitch': pitch}


KEYS = {
    'hook0': frame_cam('quote', -52, 6, 1500),
    'scan0': {'t': [0, YF, -100], 'd': 2400, 'yaw': -10, 'pitch': -55},
    'scan1': {'t': [0, YF, -100], 'd': 2250, 'yaw': 4, 'pitch': -52},
    'fresh0': {'t': [100, 700, -700], 'd': 2300, 'yaw': 6, 'pitch': -40},
    'fresh1': frame_cam('col', 0, 4, 1900, -16),
    'fresh2': frame_cam('col', 0, 2, 1550, -8),
    'call0': frame_cam('dana', -28, 8, 1450, -4, -120),
    'after0': frame_cam('dana', -28, -8, 1400, -8, 160),
    'today0': frame_cam('phone', -42, 10, 1650, -4, 40),
    'tele0': frame_cam('phone', -42, -12, 1500, -10, 40),
    'quote0': frame_cam('quote', -52, 10, 1520),
    'pay0': {'t': [1500, -500, -2300], 'd': 7000, 'yaw': 30, 'pitch': -22},
}
for k, c in KEYS.items():
    print(f'== {k}  eye {tuple(round(v) for v in eye(c))}')
    for n, b in BOARDS.items():
        pts = [proj(p, c) for p in corners(b)]
        xs = [p[0] for p in pts]
        ys = [p[1] for p in pts]
        print(f'   {n:6s} x {min(xs):6d}..{max(xs):6d}  y {min(ys):6d}..{max(ys):6d}  s {proj(b[0], c)[2]}')
    if k.startswith(('scan', 'fresh0', 'pay')):
        print('   pins', {n: proj(pin(p), c)[:2] for n, p in PINS.items()})
