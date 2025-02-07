# Web VPython 3.2

from vpython import sphere, rate, color, vec, arange, canvas, sqrt, sin, cos, slider, wtext, pi

title="""Written by <a href="https://www.hendrikse.name/">Zeger Hendrikse</a>
&#x2022; Visualization concept with spheres by <a href="https://jexpearce.github.io/jex/">Jex Pearce</a>

"""

Lx, Ly = 3 * pi, 3 * pi
dx, dy = 0.075, 0.075
animation = canvas(forward=vec(-2.5, -2.2, -2.2), center=vec(5.5, 5.3, -2.25),
                   up=vec(0, 0, 1), title=title,
                   background=color.gray(0.075), range=5)


class Membrane:
    def __init__(self, x, y, f_x_y_t):
        self._x, self._y, self._f_x_y_t = x, y, f_x_y_t

        self._hue = 0.5
        self._radius = 0.05
        self._amplitude = 1

        self._init_droplets()

    def _init_droplets(self):
        self._surface = []
        for i in range(len(self._x)):
            droplets_row = []
            for j in range(len(self._y)):
                colour = color.hsv_to_rgb(vec(self._hue, 1, 1))
                position = vec(self._x[i], self._y[j], 0)
                droplets_row.append(sphere(pos=position, radius=self._radius, color=colour))
            self._surface.append(droplets_row)

    def update(self, t):
        for i in range(0, len(self._x)):
            for j in range(0, len(self._y)):
                self._surface[i][j].pos.z = self._amplitude * self._f_x_y_t(self._x[i], self._y[j], t)
                self._surface[i][j].color = color.hsv_to_rgb(vec(.1 * abs(self._surface[i][j].pos.z) + self._hue, 1, 1))

    def set_hue_value_to(self, new_hue_value):
        self._hue = new_hue_value

    def set_amplitude_to(self, new_value):
        self._amplitude = new_value

    def set_droplet_radius_to(self, new_radius):
        self._radius = new_radius
        for i in range(len(self._x)):
            for j in range(len(self._y)):
                self._surface[i][j].radius = new_radius

def adjust_offset():
    membrane.set_hue_value_to(offset_slider.value)
    hue_offset_text.text = "{:1.2f}".format(offset_slider.value, 2)


def adjust_amplitude():
    membrane.set_amplitude_to(amplitude_slider.value)
    amplitude_text.text = "{:1.2f}".format(amplitude_slider.value, 2)


def adjust_droplet_radius():
    membrane.set_droplet_radius_to(radius_slider.value * .01)
    droplet_radius_text.text = "{:1.2f}".format(radius_slider.value, 2)


animation.append_to_caption("\n")
radius_slider = slider(min=1, max=10, value=5.0, step=.1, bind=adjust_droplet_radius)
animation.append_to_caption("droplet radius = ")
droplet_radius_text = wtext(text="3.0")

animation.append_to_caption("\n\n")
offset_slider = slider(min=0, max=1, value=0.5, bind=adjust_offset)
animation.append_to_caption("hue offset = ")
hue_offset_text = wtext(text="0.5")

animation.append_to_caption("\n\n")
amplitude_slider = slider(min=0.1, max=2, value=1, bind=adjust_amplitude)
animation.append_to_caption("Amplitude = ")
amplitude_text = wtext(text="1.0")


x_range = arange(0, Lx + dx, dx)
y_range = arange(0, Ly + dy, dy)

def f_x_y_t(x, y, t):
    return cos(1.5 * sqrt(5) * t) * sin(2 * x) * sin(y)

membrane = Membrane(x_range, y_range, f_x_y_t)

t = 0
dt = 0.1
while True:
    rate(10)
    membrane.update(t)
    t += dt
