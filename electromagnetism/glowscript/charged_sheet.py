# Web VPython 3.2

from vpython import canvas, vec, color, sphere, vector, box, mag, arrow, rate, arange

title = """
&#x2022; Original <a href="https://trinket.io/glowscript/38fbc7b2d01d">code</a> by Byron Philhour
&#x2022; Refactored by <a href="https://www.hendrikse.name/">Zeger Hendrikse</a>

If it isn't doing anything interesting, either wait or run again to randomize start position. 
Two-finger drag to change perspective.

"""

animation = canvas(title=title, forward=vector(0.34, 0.7, -0.6), background=color.gray(0.075))

R = 0.5e-10  # size of sheet
Q = 1.6e-19  # charge magnitude of electron / nucleus
k = 9e9  # Coulomb's law constant
fieldScale = 5e23  # arbitrary field size reduction for aesthetics

N = 60  # number of sheet segments (across)

dx = R / N  # width of ring segment
dx_squared = dx * dx
dq = Q / (N * N)  # charge of ring segment
dt = 1e-18  # time step


class ChargedSheet:
    def __init__(self):
        self._sheet_segments = []
        index = 0
        for i in range(N):
            for j in range(N):
                x, y = -.5 * R + i * dx, -.5 * R + j * dx
                self._sheet_segments += [box(pos=vec(x, y, 0), size=vec(dx, dx, dx), color=color.red)]

    def field_at(self, position):
        E = vec(0, 0, 0)
        for sheet_segment in self._sheet_segments:
            r = sheet_segment.pos - position
            E += k * dq * r.norm() / r.mag2  # Coulomb's Law

        return E

    def display_field(self):
        for x in arange(-R, R, R / 8):
            for y in arange(-R, R, R / 8):
                for z in arange(-R, R, R / 12):
                    position = vec(x, y, z)
                    # don't move forward if we are embedded in the shell itself
                    if z * z <= dx_squared: continue  # avoid infinities

                    electric_field = charged_sheet.field_at(position)
                    arrow(axis=-electric_field / fieldScale, pos=position)


class Electron:
    def __init__(self, mass=9.11e-31):
        self._ball = sphere(pos=vec(0, 0, R) + (R / 2) * vector.random(), radius=R / 40, color=color.yellow,
                            make_trail=True, retain=150)
        self._velocity = vec(0, 0, 0)
        self._mass = mass

    def increment_by(self, force, dt):
        self._velocity += (force * dt) / self._mass
        self._ball.pos += self._velocity * dt

    def position(self):
        return self._ball.pos


charged_sheet = ChargedSheet()
charged_sheet.display_field()
electron = Electron()

while True:
    rate(100)

    force_on_electron = Q * charged_sheet.field_at(electron.position())
    electron.increment_by(force_on_electron, dt)
