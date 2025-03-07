#Web VPython 3.2


from vpython import sphere, vector, cross, arange, arrow, sqrt, color, rate, canvas

title="""&#x2022; <a href="https://www.glowscript.org/#/user/wlane/folder/PHYS152/program/magnetic-field">Original code</a> by <a href="https://www.youtube.com/@LetsCodePhysics">Let&apos;s code physics</a>
&#x2022; Refactored by <a href="https://www.hendrikse.name/">Zeger Hendrikse</a> to <a href="https://github.com/zhendrikse/science/blob/main/electromagnetism/code/proton_in_magnetic_field.py">proton_in_magnetic_field.py</a>

"""
display = canvas(title=title, forward=vector(0, .9, -.45), background=color.gray(0.075))

class Proton:
    def __init__(self, position=vector(0, 2, 0), velocity=vector(1, 0, 0), colour=color.red, radius=.1):
        self._proton = sphere(position=position, radius=radius, color=colour, make_trail=True)
        self._velocity = velocity
        self._mass = 1
        self._charge = 1

    def update_with(self, magnetic_field, dt=1e-4):
        force = self._charge * cross(self._velocity, magnetic_field)
        self._velocity += force * dt / self._mass
        self._proton.pos += self._velocity * dt

    def position(self):
        return self._proton.pos


class MagneticField:
    def __init__(self, colour=color.cyan):
        dx, x_min, x_max, y_min, y_max = 0.5, -6, 6, -6, 6
        scale = 0.1

        for x in arange(x_min, x_max + dx, dx):
            for y in arange(y_min, y_max + dx, dx):
                arrow(pos=vector(x, y, -0.5), axis=self.field_vector_at(vector(x, y, 0)) * scale, color=colour)

    def field_vector_at(self, position):
        b_x, b_y, b_z = 0, 0, sqrt(position.x * position.x + position.y * position.y)
        # b_z = 5 if (abs(abs(position.x)-1) < 0.2 and abs(abs(position.y)-1) < 0.2) else 0

        return vector(b_x, b_y, b_z)

proton = Proton()
field = MagneticField()

dt = 1e-4  # Decrease in case of misbehavior!
while True:
    rate(1 / dt)
    proton.update_with(field.field_vector_at(proton.position()))
