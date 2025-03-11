#Web VPython 3.2
from vpython import canvas, vec, color, rate, points, radio, random, slider, sin, cos, pi

title = """&#x2022; <a href="https://github.com/zhendrikse/science/blob/main/mathematics/code/chaos_game.py">chaos_game.py</a> by <a href="https://github.com/zhendrikse/">Zeger Hendrikse</a>
&#x2022; Inspired by <a href="https://github.com/nnakul/chaos-game/tree/master">nnakul/chaos-game</a> by <a href="https://github.com/nnakul/">Nikhil Nakul</a>

"""

display = canvas(width=600, height=600, title=title, background=color.gray(0.075))

def clear_canvas(range_, center):
    for obj in display.objects:
        obj.visible = False
    display.range = range_
    display.center = center

def sierpinski_triangle(a1=-.5, b1=-.433, a2=.5, b2=-.433, a3=0, b3=.3):
    #          (a3, b3)
    #             /\
    #            /  \
    #           /    \
    #          /      \
    #         /________\
    # (a1, b1)           (a2, b2)

    clear_canvas(.5, vec(0, -0.1, 0))
    pixels = points(radius=1.5)
    x, y, colour = 0, 0.3, color.red

    jump_points = [(a1, b1), (a2, b2), (a3, b3)]
    colors = [color.green, color.cyan, color.red]
    for i in range(40000):
        rate(frame_rate)
        index = int(random() * 3)
        x = .5 * (x + jump_points[index][0])
        y = .5 * (y + jump_points[index][1])
        pixels.append(pos=vec(x, y, 0), color=colors[index])

def vicsek_fractal(a1=-1, b1=-1, a2=-1, b2=1, a3=1, b3=1, a4=1, b4=-1, a5=0, b5=0):
    clear_canvas(1.25, vec(0, 0, 0))
    pixels = points(radius=1.5)
    x, y, colour = 0, 0.3, color.red

    jump_points = [(a1, b1), (a2, b2), (a3, b3), (a4, b4), (a5, b5)]
    colors = [color.green, color.cyan, color.red, color.yellow, color.orange]
    for i in range(40000):
        rate(frame_rate)
        index = int(random() * 5)
        x = (x + 2 * jump_points[index][0]) / 3
        y = (y + 2 * jump_points[index][1]) / 3
        pixels.append(pos=vec(x, y, 0), color=colors[index])

def cantor_dust(a1=-1, b1=-1, a2=-1, b2=1, a3=1, b3=1, a4=1, b4=-1):
    # (a2, b2)   (a3, b3)
    #    +--------+
    #    |        |
    #    |        |
    #    +--------+
    # (a1, b1)   (a4, b4)

    clear_canvas(1.25, vec(0, 0, 0))
    pixels = points(radius=1.5)
    x, y, colour = 0, 0.3, color.red

    jump_points = [(a1, b1), (a2, b2), (a3, b3), (a4, b4)]
    colors = [color.green, color.cyan, color.red, color.yellow, color.orange]
    for i in range(40000):
        rate(frame_rate)
        index = int(random() * 4)
        x = .45 * (x + jump_points[index][0])
        y = .45 * (y + jump_points[index][1])
        pixels.append(pos=vec(x, y, 0), color=colors[index])

def fractal_1(a1=-1, b1=-1, a2=-1, b2=1, a3=1, b3=1, a4=1, b4=-1):
    clear_canvas(1.25, vec(0, 0, 0))
    pixels = points(radius=1.5)
    x, y, colour = 0, 0.3, color.red
    current_vertex = int(random() * 4)

    jump_points = [(a1, b1), (a2, b2), (a3, b3), (a4, b4)]
    colors = [color.green, color.cyan, color.red, color.yellow]
    for i in range(40000):
        rate(frame_rate)
        x = .5 * (x + jump_points[current_vertex][0])
        y = .5 * (y + jump_points[current_vertex][1])

        pixels.append(pos=vec(x, y, 0), color=colors[current_vertex])

        sample = [0, 1, 2, 3]
        sample.remove(current_vertex)
        current_vertex = sample[int(random() * 3)]

def fractal_2():
    clear_canvas(.45, vec(.5, .5, 0))
    pixels = points(radius=1.5)
    x, y, colour = 0, 0.3, color.red
    current_vertex = int(random() * 4)

    w = 1
    theta = 2 * pi / 5

    p1 = (w / 2, 0)
    p2 = (w * 0.5 * (1 + sin(theta)), w * 0.5 * (1 - cos(theta)))
    p3 = (w * 0.5 * (1 + sin(theta / 2)), w * 0.5 * (1 + cos(theta / 2)))
    p4 = (w * 0.5 * (1 - sin(theta / 2)), w * 0.5 * (1 + cos(theta / 2)))
    p5 = (w * 0.5 * (1 - sin(theta)), w * 0.5 * (1 - cos(theta)))
    jump_points = [p1, p2, p3, p4, p5]
    colors = [color.green, color.cyan, color.red, color.yellow, color.orange]
    for i in range(40000):
        rate(frame_rate)
        x = .5 * (x + jump_points[current_vertex][0])
        y = .5 * (y + jump_points[current_vertex][1])

        pixels.append(pos=vec(x, y, 0), color=colors[current_vertex])

        sample = [0, 1, 2, 3, 4]
        sample.remove(current_vertex)
        current_vertex = sample[int(random() * 4)]

def t_square(a1=-1, b1=-1, a2=-1, b2=1, a3=1, b3=1, a4=1, b4=-1):
    # (a2, b2)   (a3, b3)
    #    +--------+
    #    |        |
    #    |        |
    #    +--------+
    # (a1, b1)   (a4, b4)

    clear_canvas(1.25, vec(0, 0, 0))
    pixels = points(radius=1.5)
    x, y, colour = 0, 0.3, color.red
    current_vertex = int(random() * 4)

    jump_points = [(a1, b1), (a2, b2), (a3, b3), (a4, b4)]
    colors = [color.green, color.cyan, color.red, color.yellow]
    for i in range(40000):
        rate(frame_rate)
        index = int(random() * 4)
        x = .5 * (x + jump_points[current_vertex][0])
        y = .5 * (y + jump_points[current_vertex][1])

        pixels.append(pos=vec(x, y, 0), color=colors[current_vertex])

        sample = [0, 1, 2, 3]
        if current_vertex == 0:
            sample.remove(2)
        elif current_vertex == 1:
            sample.remove(3)
        elif current_vertex == 2:
            sample.remove(0)
        elif current_vertex == 3:
            sample.remove(1)
        current_vertex = sample[int(random() * 3)]

def sierpinski_carpet(a1=-1, b1=-1, a2=-1, b2=1, a3=1, b3=1, a4=1, b4=-1):
    # (a2, b2)   (a3, b3)
    #    +--------+
    #    |        |
    #    |        |
    #    +--------+
    # (a1, b1)   (a4, b4)

    clear_canvas(1.25, vec(0, 0, 0))
    pixels = points(radius=1.5)
    x, y, colour = 0, 0.3, color.red

    jump_points = [(a1, b1), (a2, b2), (a3, b3), (a4, b4), (a1, b1 + b2), (a4, b3 + b4), (a1 + a4, b1), (a2 + a3, b2)]
    colors = [color.green, color.white, color.yellow, color.red, color.purple, color.cyan, color.magenta, color.orange]
    for i in range(40000):
        rate(frame_rate)
        index = int(random() * 8)
        x = (x + 2 * jump_points[index][0]) / 3
        y = (y + 2 * jump_points[index][1]) / 3
        pixels.append(pos=vec(x, y, 0), color=colors[index])


def toggle_fractal(event):
    if event.name == "carpet":
        sierpinski_carpet()
        fractal_1_radio.checked = fractal_2_radio.checked = t_square_radio.checked = triangle_radio.checked = vicsek_radio.checked =  dust_radio.checked = False
    elif event.name == "triangle":
        sierpinski_triangle()
        fractal_1_radio.checked = fractal_2_radio.checked = t_square_radio.checked = carpet_radio.checked = vicsek_radio.checked =  dust_radio.checked = False
    elif event.name == "vicsek":
        vicsek_fractal()
        fractal_1_radio.checked = fractal_2_radio.checked = t_square_radio.checked = triangle_radio.checked = carpet_radio.checked = dust_radio.checked = False
    elif event.name == "dust":
        cantor_dust()
        fractal_1_radio.checked = fractal_2_radio.checked = t_square_radio.checked = vicsek_radio.checked = triangle_radio.checked = carpet_radio.checked = False
    elif event.name == "fractal_1":
        fractal_1()
        dust_radio.checked = fractal_2_radio.checked = t_square_radio.checked = vicsek_radio.checked = triangle_radio.checked = carpet_radio.checked = False
    elif event.name == "fractal_2":
        fractal_2()
        dust_radio.checked = fractal_1_radio.checked = t_square_radio.checked = vicsek_radio.checked = triangle_radio.checked = carpet_radio.checked = False
    else:
        t_square()
        fractal_1_radio.checked = fractal_2_radio.checked = dust_radio.checked = vicsek_radio.checked = triangle_radio.checked = carpet_radio.checked = False
    #MathJax.Hub.Queue(["Typeset", MathJax.Hub])

frame_rate = 15000
def change_speed(event):
    global frame_rate
    frame_rate = event.value

display.append_to_caption("\n")
carpet_radio = radio(text="Sierpinski gasket ", checked=True, name="carpet", bind=toggle_fractal)
vicsek_radio = radio(text="Vicsek fractal ", checked=False, name="vicsek", bind=toggle_fractal)
triangle_radio = radio(text="Sierpinski triangle ", checked=False, name="triangle", bind=toggle_fractal)
dust_radio = radio(text="Cantor dust ", checked=False, name="dust", bind=toggle_fractal)
display.append_to_caption("\n\n")

t_square_radio = radio(text="T-square ", checked=False, name="t_square", bind=toggle_fractal)
fractal_1_radio = radio(text="Star ", checked=False, name="fractal_1", bind=toggle_fractal)
fractal_2_radio = radio(text="Flower ", checked=False, name="fractal_2", bind=toggle_fractal)

display.append_to_caption("\n\nAnimation speed")
_ = slider(min=1000, max=15000, value=15000, bind=change_speed)

#MathJax.Hub.Queue(["Typeset", MathJax.Hub])
sierpinski_carpet()
while True:
    rate(10)
