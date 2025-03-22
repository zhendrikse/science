# Web VPython 3.2

from vpython import cylinder, canvas, vector, color, ring, pi, sin, cos, text, rate

title = """&#x2022; Clock as presented in <a href="https://www.youtube.com/watch?v=e9QxQZJRGLk&t=1490s">this video</a>
&#x2022; Copied over to <a href="https://github.com/zhendrikse/science/blob/main/fun/code/clock.py">clock.py</a> file

"""

display = canvas(title=title, range=1.5, width=600, height=600, background=color.gray(0.075))

r = 1.1
clock_base = cylinder(radius=r, axis=vector(0, 0, 1), length=0.01)
knob = cylinder(radius=0.06, axis=vector(0, 0, 1), length=0.05, color=color.black)
border = ring(radius=1.05 * r, axis=vector(0, 0, 1), thickness=0.06, color=color.yellow)


for i in range(1, 13):
    angle = pi / 3 - 30 * (i - 1) * pi / 180
    text(text=str(i), height=0.09, width=0.03, pos=vector(0.78 * r * cos(angle) - 0.035, 0.78 * r * sin(angle) - 0.035, 0.01), color=color.red)

for i in range(0, 360):
    angle = 6 * i * pi / 180
    if i % 5 == 0:
        l = 0.15
        p = vector(0.95 * cos(angle), 0.95 * sin(angle), 0.01)
    else:
        l = 0.075
        p = vector(cos(angle), sin(angle), 0.01)
    cylinder(radius=0.002, color=color.black, length=l, axis=vector(cos(angle), sin(angle), 0), pos=p)

second_hand = cylinder(radius=0.0035, color=color.black, length=0.75, pos=vector(0, 0, 0.06), axis=vector(0, 1, 0))
minute_hand = cylinder(radius=0.0038, color=color.black, length=0.65, pos=vector(0, 0, 0.07), axis=vector(0, 1, 0))
hour_hand = cylinder(radius=0.004, color=color.black, length=0.50, pos=vector(0, 0, 0.08), axis=vector(0, 1, 0))

angle_second_hand = 2 * pi / 60
angle_minute_hand = 2 * pi / (60 * 60)
angle_hour_hand = 2 * pi / (12 * 60 * 60)

while True:
    rate(1)
    second_hand.rotate(angle=angle_second_hand, origin=vector(0, 0, 0), axis=vector(0, 0, -1))
    minute_hand.rotate(angle=angle_minute_hand, origin=vector(0, 0, 0), axis=vector(0, 0, -1))
    hour_hand.rotate(angle=angle_hour_hand, origin=vector(0, 0, 0), axis=vector(0, 0, -1))
