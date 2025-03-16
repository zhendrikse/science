#Web VPython 3.2
from vpython import box, vector, color, gcurve, simple_sphere, pi, cos, sin, rate, canvas, slider
from random import uniform

title = """&#x2022; Original code by <a href="https://www.youtube.com/@LetsCodePhysics">Let&apos;s code physics</a>.
&#x2022; Refactored by <a href="https://www.hendrikse.name/">Zeger Hendrikse</a> to <a href="https://github.com/zhendrikse/science/blob/main/electronics/code/drude_model.py">drude_model.py</a>

"""

display = canvas(background=color.gray(0.075), width=600, title=title)

x_versus_time = []
x_versus_time.append(gcurve(color=color.red))
x_versus_time.append(gcurve(color=color.green))


class Wire:
    def __init__(self, position, length, width, direction, resistivity, electrons):
        self._electron_list = electrons
        self._size = vector(width, length, width) if direction == "up" or direction == "down" or direction == "vertical" else vector(length, width, width)
        self._object = box(size=self._size, pos=position, opacity=.5)
        self._top = position.y + .5 * self._object.size.y
        self._bottom = position.y - .5 * self._object.size.y
        self._right = position.x + .5 * self._object.size.x
        self._left = position.x - .5 * self._object.size.x
        self._resistivity = resistivity

        # Average time until an electron gets scattered
        # It is an intrinsic property of the wire (material it is made off, etc.)
        self._scattering_time = 1 / (1 * resistivity)

    def move_electrons(self, electric_field, dt):
        average_position = vector(0, 0, 0)
        for electron in self._electron_list:
            scattered = uniform(0, 1)
            scattered = scattered < dt / self._scattering_time
            electron.update_velocity(scattered, electric_field, dt)

            if (electron.pos().x > self._right and electron.velocity().x > 0) or (electron.pos().x < self._left and electron.velocity().x < 0):
                electron.reverse_x()
            if (electron.pos().y > self._top and electron.velocity().y > 0) or (electron.pos().y < self._bottom and electron.velocity().y < 0):
                electron.reverse_y()

            electron.update_position(dt)
            average_position += electron.pos()

        return average_position / len(self._electron_list)

class Electron:
    def __init__(self, position, colour=color.green, radius=0.05):
        self._particle = simple_sphere(pos=position, color=colour, radius=radius)
        self._speed = 1
        self._velocity = vector(.1, 0, 0)
        self._in_wire = 0

    def update_velocity(self, scattered, electric_field, dt):
        if scattered:
            angle = uniform(0, 2 * pi)
            self._velocity = self._speed * vector(cos(angle), sin(angle), 0)
        else:
            self._velocity += electric_field * dt

    def update_position(self, dt):
        self._particle.pos += self._velocity * dt

    def pos(self):
        return self._particle.pos

    def velocity(self):
        return self._velocity

    def reverse_x(self):
        self._velocity.x *= -1

    def reverse_y(self):
        self._velocity.y *= -1

field = vector(.5, 0, 0)
electrons = []
for _ in range(30):
    electrons += [Electron(vector(0, 0, 0))]
wire = Wire(vector(0, 0, 0), 10, 1, "horizontal", 1, electrons)

def modify_electric_field(event):
    global field
    field = vector(event.value, 0, 0)

display.append_to_caption("\nElectric field")
_ = slider(min=0, max=1, value=.5, bind=modify_electric_field)
display.append_to_caption("\n\n")

dt = .01
t = 0
while True:
    rate(1/dt)
    pos = wire.move_electrons(field, dt)
    x_versus_time[0].plot(t, pos.x)
    t += dt