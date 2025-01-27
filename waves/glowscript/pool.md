```python
Web VPython 3.2

from vpython import *

title = """
&#x2022; Original idea (and <a href="https://jexpearce.github.io/jex/Wavepropagation.html">code</a>) by <a href="https://jexpearce.github.io/jex/">Jex Pearce</a>
&#x2022; Refactored and extended by <a href="https://www.hendrikse.name/">Zeger Hendrikse</a>
&#x2022; Based on a <a href=""https://en.wikipedia.org/wiki/Finite_difference_method">finite difference mehtod</a>

"""

Lx, Ly = 3, 2
dx, dy = 0.05, 0.05
animation = canvas(forward=vector(-3.25, 0, -2.0), center=vector(Lx / 2, Ly / 2, 0),
                   up=vector(0, 0, 1), title=title,
                   background=color.gray(0.075), range=2.0)

class Wave:
    def __init__(self, x, y):
        self._x = x
        self._y = y
        self._time = 0
        self._disturbance_magnitude = 0.5
        self._initialize_wave_data()
        self._old, self._new, self._now = [], [], []

    def _initialize_wave_data(self):
        self._old = [[0 for j in range(len(self._y))] for i in range(len(self._x))]
        self._now = [[0 for j in range(len(self._y))] for i in range(len(self._x))]
        self._new = [[0 for j in range(len(self._y))] for i in range(len(self._x))]

    def reset(self):
        self._initialize_wave_data()
        self._time = 0
        
    def _update_water_height(self, dt): 
        c = 1.5
        r = (c * dt / dx) * (c * dt / dx)
        for x in range(1, len(self._x) - 1):
            for y in range(1, len(self._y) - 1):
                self._new[x][y] = (2 * self._now[x][y] - self._old[x][y] +
                                   r * (self._now[x + 1][y] + self._now[x - 1][y] + self._now[x][y + 1] + self._now[x][
                            y - 1] - 4 * self._now[x][y]))
                self._old[x][y] = self._now[x][y]

    def update_by(self, dt):
        self._update_water_height(dt)
        for i in range(1, len(self._x) - 1):
            for j in range(1, len(self._y) - 1):
                self._now[i][j] = self._new[i][j]

        if abs(self._time - 0.25) < dt:  # introducing a disturbance
            self._now[len(self._x) // 2][len(self._y) // 2] += self._disturbance_magnitude

        self._time += dt
        
    def set_disturbance_magnitude_to(self, new_value):
      self._disturbance_magnitude = new_value

    def current_values(self):
        return self._now

    def get_time(self):
        return self._time

class Pool:
    def __init__(self, x, y):
        self._x, self._y = x, y
        self._surface = []
        self._hue = 1.5
        self._init_pool()
        self._init_droplets()

    def _init_droplets(self):
        positions = []
        self._surface = []
        for i in range(len(self._x)):
            droplets_row = []
            for j in range(len(self._y)):
                position = vector(self._x[i], self._y[j], 0)
                droplets_row.append(sphere(pos=position, radius=.015, visible=True,
                                  color=color.hsv_to_rgb(vec(self._hue, 1, 1))))
            self._surface.append(droplets_row)

    def _init_pool(self):
        water = box(pos=vec(Lx / 2, Ly / 2, -.1), width=.15, length=Lx, height=Ly, color=vec(0, .6, 1), opacity=0.6)
        back = box(pos=vec(-dx, Ly / 2, 0), width=.4, length=.04, height=Ly+2*dy, color=color.yellow)
        left = box(pos=vec(Lx / 2, -dy, 0), width=.4, length=.04, height=Lx + dx, color=color.yellow)
        left.rotate(angle=radians(90), axis=vec(0, 0, 1))
        right = box(pos=vec(Lx / 2, Ly+dy, 0), width=.4, length=.04, height=Lx + dx, color=color.yellow)
        right.rotate(angle=radians(90), axis=vec(0, 0, 1))
        bottom = box(pos=vec(Lx / 2, Ly / 2, -.2), width=0.04, length=Lx + dx, height=Ly + dy, color=color.yellow)

    def reset(self):
        for i in range(len(self._x)):
            for j in range(len(self._y)):
                self._surface[i][j].visible = False
        self._init_droplets()

    def update_by(self, dt):
        new_values = wave.current_values()
        for i in range(1, len(self._x) - 1):
            for j in range(1, len(self._y) - 1):
                self._surface[i][j].pos.z = new_values[i][j]  # Updating the z position of the surface points
                self._surface[i][j].color = color.hsv_to_rgb(vec(new_values[i][j] + self._hue, 1, 1))

    def set_hue_value_to(self, new_hue_value):
        self._hue = 1.5 + new_hue_value
        
    def set_droplet_radius_to(self, new_radius):
        for i in range(len(self._x)):
            for j in range(len(self._y)):
                self._surface[i][j].radius = new_radius * .01


def adjust_offset():
    pool.set_hue_value_to(offset_slider.value)
    hue_offset_text.text = "{:1.2f}".format(offset_slider.value, 2)

def adjust_disturbance():
    wave.set_disturbance_magnitude_to(disturbance_slider.value)
    disturbance_text.text = "{:1.2f}".format(disturbance_slider.value, 2)

def adjust_droplet_radius():
    pool.set_droplet_radius_to(radius_slider.value)
    droplet_radius_text.text = "{:1.2f}".format(radius_slider.value, 2)

animation.append_to_caption("\n")
radius_slider = slider(min=1, max=4, value=1.5, step=.1, bind=adjust_droplet_radius)
animation.append_to_caption("droplet radius = ")
droplet_radius_text = wtext(text="2.0")

animation.append_to_caption("\n\n")
offset_slider = slider(min=0, max=1, value=0, bind=adjust_offset)
animation.append_to_caption("hue offset = ")
hue_offset_text = wtext(text="0.0")

animation.append_to_caption("\n\n")
disturbance_slider = slider(min=0.1, max=1, value=.5, bind=adjust_disturbance)
animation.append_to_caption("disturbance magnitude = ")
disturbance_text = wtext(text="0.5")


popup = text(text="Click mouse to start", pos=vec(-Lx / 2, 0, Ly / 3), billboard=True, color=color.yellow, height=.3)
animation_duration = 4  # seconds

animation.append_to_caption("\n\n  Remaining animation time = ")
clock = wtext(text="{:1.2f}".format(animation_duration, 2))

x_range = arange(0, Lx + dx, dx)
y_range = arange(0, Ly + dy, dy)
wave = Wave(x_range, y_range)
pool = Pool(x_range, y_range)

# The Time-loop
dt = 0.01
while True:
    popup.visible = True
    animation.waitfor("click")
    popup.visible = False
    wave.reset()
    pool.reset()
    for _ in range(int(animation_duration / dt)):
        rate(1 / (5 * dt))
        wave.update_by(dt)
        pool.update_by(dt)
        clock.text = "{:1.2f}".format(animation_duration - wave.get_time(), 2)

```