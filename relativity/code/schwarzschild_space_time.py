# Web VPython 3.2
from vpython import curve, vec, cos, pi, sqrt, sin, color, rate, sphere, slider, canvas

title = """&#x2022; Original <a href="https://www.glowscript.org/#/user/Luinthoron/folder/English/program/embedding-diagram">code.py</a> by M. Ryston (Department of Physics Education)
&#x2022; Faculty of Mathematics and Physics, Charles University,Prague, Czech Republic
&#x2022; Described in <a href="https://iopscience.iop.org/article/10.1088/1742-6596/1286/1/012049">Interactive animations as a tool in teaching general relativity [...]</a>
&#x2022; Refactored by <a href="https://www.hendrikse.name/">Zeger Hendrikse</a> in <a href="https://github.com/zhendrikse/science/blob/main/relativity/code/schwarzschild_space_time.py">schwarzschild_space_time.py</a>

"""

display = canvas(title=title, width=600, height=450, background=color.gray(0.075), forward=vec(0, -.45, -.85), range=62)


# display.range = 1.3 * r_max # r_max from SchwarzschildSpaceTime
# display.forward = vec(-0.64, -0.77, 0.0)
# display.center = vec(-10,0,0.2)

class Sun:
    def __init__(self, position, radius=0.8):
        self._sun = sphere(pos=position, radius=radius,
                           texture="https://www.hendrikse.name/science/astrophysics/images/textures/sun.jpg",
                           visible=True)


class Comet:
    def __init__(self, start_position, particle_radius, colour, sour):
        self._sphere = sphere(pos=start_position, radius=particle_radius, color=colour, visible=True, make_trail=True)
        self._sour = sour
        self._start_sour = [sour[0], sour[1], sour[2], sour[3]]
        self._start_position = start_position

    def update_by(self, M, dt):
        buff = [0, 0, 0, 0]
        buff[0] = self._sour[0] + 0.5 * dt * self._sour[2]
        buff[1] = self._sour[1] + 0.5 * dt * self._sour[3]
        buff[2] = self._sour[2] + 0.5 * dt * (
                    M / self._sour[0] / (self._sour[0] - 2.0 * M) * self._sour[2] ** 2 + (self._sour[0] - 2.0 * M) *
                    self._sour[3] ** 2)
        buff[3] = self._sour[3] - 0.5 * dt * 2 / self._sour[0] * self._sour[2] * self._sour[3]

        self._sour[0] += dt * buff[2]
        self._sour[1] += dt * buff[3]
        self._sour[2] += dt * (M / buff[0] / (buff[0] - 2.0 * M) * buff[2] ** 2 + (buff[0] - 2.0 * M) * buff[3] ** 2)
        self._sour[3] += -dt * 2 / buff[0] * buff[2] * buff[3]
        self._sphere.pos = vec(self._sour[0] * cos(self._sour[1]), sqrt(8 * M * self._sour[0] - 16 * M ** 2),
                               self._sour[0] * sin(self._sour[1]))

    def r(self):
        return sqrt(self._sphere.pos.x * self._sphere.pos.x + self._sphere.pos.z * self._sphere.pos.z)

    def reset(self):
        self._sphere.clear_trail()
        self._sphere.pos = self._start_position
        self._sour = [self._start_sour[0], self._start_sour[1], self._start_sour[2], self._start_sour[3]]


class SchwarzschildSpaceTime:
    def __init__(self, mass, grid_y_offset=-10):
        self._mass = mass
        self._grid_y_offset = grid_y_offset
        self._surface = []
        self._grid = []

    def r_min_r_max(self):
        r_min = 2 * self._mass + 0.1
        r_max = 10 * self._mass
        return r_min, r_max

    def draw_grid(self):
        _, r_max = self.r_min_r_max()
        for i in range(20):
            self._grid += [curve(
                pos=[vec(-r_max + i * 2 * r_max / 19, self._grid_y_offset, -r_max),
                     vec(-r_max + i * 2 * r_max / 19, self._grid_y_offset, r_max)],
                color=color.white, radius=0.2)]
            self._grid += [curve(
                pos=[vec(-r_max, self._grid_y_offset, -r_max + i * 2 * r_max / 19),
                     vec(r_max, self._grid_y_offset, -r_max + i * 2 * r_max / 19)],
                color=color.white, radius=0.2)]

    def mass(self):
        return self._mass

    def z_as_function_of(self, r):
        return sqrt(8 * self._mass * r - 16 * self._mass * self._mass)

    # def radius(self, t):
    #     return (t ** 2 + 4 * self._M ** 2) / (8 * self._M)

    def draw(self):
        r_min, r_max = self.r_min_r_max()
        for i in range(15):
            r = r_min + i * (r_max - r_min) / 14
            t = 0
            c = curve(pos=vec(r * cos(t), self.z_as_function_of(r), r * sin(t)), color=color.green, radius=0.2)
            for j in range(200):
                t += 2 * pi / 200
                c.append(vec(r * cos(t), self.z_as_function_of(r), r * sin(t)))
            self._surface.append(c)

        for i in range(12):
            phi = i * 2 * pi / 12
            r = r_min
            c = curve(pos=vec(r * cos(phi), self.z_as_function_of(r), r * sin(phi)), color=color.green, radius=0.2)
            for j in range(100):
                r += (r_max - r_min) / 100
                c.append(vec(r * cos(phi), self.z_as_function_of(r), r * sin(phi)))
            self._surface.append(c)

    def modify_grid(self, thickness):
        for element in self._surface:
            element.radius = thickness
        for element in self._grid:
            element.radius = thickness


schwarzschild = SchwarzschildSpaceTime(mass=5.0)
schwarzschild.draw()
schwarzschild.draw_grid()
sun = Sun(position=vec(0, 2, 0), radius=2 * schwarzschild.mass())

r_min, r_max = schwarzschild.r_min_r_max()
start_r = r_max - 0.1
comet = Comet(start_position=vec(start_r, schwarzschild.z_as_function_of(start_r), 0), particle_radius=0.8,
              colour=color.cyan, sour=[start_r, 0, -25.2, 0.49])


def modify_grid_thickness(event):
    schwarzschild.modify_grid(event.value)


display.append_to_caption('\nGrid thickness')
slider(min=0.1, max=0.5, value=0.2, bind=modify_grid_thickness)


def restart(event):
    comet.reset()


display.bind('click', restart)

delta_t = 0.01
while True:
    rate(1 / delta_t)
    r = comet.r()
    if r_min < r < r_max:
        comet.update_by(schwarzschild.mass(), delta_t)
