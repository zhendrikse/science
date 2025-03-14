#Web VPython 3.2
from vpython import canvas, color, cross, vec, vector, cylinder, rate, sphere, cos, sin, sqrt, arrow, atan2, slider, wtext, label, ring, pi

title = """&#x2022; Motion of a charge in field of current coil as viewed in two different frames with Vpython.
&#x2022; Based on <a href="http://sites.science.oregonstate.edu/~landaur/Books/Problems/Codes/VPythonCodes/EMrelativisticVp.py">EMrelativisticVp.py</a>
&#x2022; From the book <a href="https://books.google.nl/books/about/Computational_Problems_for_Physics.html?id=g9tdDwAAQBAJ">Computational Problems for Physics</a> by RH Landau, MJ Paez, and CC Bordeianu.
&#x2022; Refactored by <a href="https://www.hendrikse.name/">Zeger Hendrikse</a> in <a href="https://github.com/zhendrikse/science/blob/main/relativity/code/field_transform.py">field_transform.py</a>

$\\begin{eqnarray} E'_x &=& E_x, \\ \\ E'_y = \\gamma (E_y - v B_z), \\ \\ E'_z = \\gamma(E_z+v B_y),\\\\  B'_x &=& B_x,\\ \\  B'_y = \\gamma (B_y + vE_z/c^2), \\ \\  B'_z = \\gamma (B_z - vE_y/c^2) \\end{eqnarray}$

"""

display_1 = canvas(background = color.gray(0.075), width=600, height=300, range=75, title=title+"System S\n\n")
display_2 = canvas(background = color.gray(0.075), width=600, height=300, range=75, title=" System S'\n\n")

#graf = curve(color=color.red)

class ChargedParticle:
    def __init__(self, display, pos, velocity, mass, q=1, colour=color.red, radius=2):
        self._charge = sphere(pos=pos, color=colour, radius=radius, make_trail=True, canvas=display)
        self._mass = mass
        self._velocity = velocity
        self._q = q

    def update_with(self, magnetic_field, electric_field, dt):
        force = self._q * (cross(self._velocity, magnetic_field) + electric_field)
        acceleration = force / self._mass
        self._velocity += acceleration * dt
        self._charge.pos += self._velocity * dt

    def reset(self, pos, velocity):
        self._velocity = velocity
        self._charge.pos = pos
        self._charge.clear_trail()

class MagneticField:
    def __init__(self, current_in_wire, display, offset=-100):
        self._current = current_in_wire
        tube = cylinder(radius=5, pos=vec(-100, 0, 0), axis=vec(200, 0, 0), opacity=0.7, color=color.white, canvas=display)
        for i in range(1, 5):
            oring = ring(pos=vec(offset + 40 * i, 0, 0), axis=vec(1, 0, 0), radius=30, thickness=0.5, canvas=display, color=color.yellow)
            arrow_up = arrow(pos=vec(offset + 40 * i, 30, 0), axis=vec(0, 0, 20), color=color.orange, canvas=display)
            arrow_down = arrow(pos=vec(offset + 40 * i, -30, 0), axis=vec(0, 0, -20), color=color.orange, canvas=display)
            arrow_front = arrow(pos=vec(offset + 40 * i, 0, 30), axis=vec(0, -20, 0), color=color.orange, canvas=display)
            arrow_back = arrow(pos=vec(offset + 40 * i, 0, -30), axis=vec(0, 20, 0), color=color.orange, canvas=display)

    def field_at(self, position):
        distance_to_wire = sqrt(position.y * position.y + position.z * position.z)
        magnitude_magnetic_field = self._current / (2 * pi * distance_to_wire)  # B field, mu0 = 1
        theta = atan2(position.y, position.z)
        return magnitude_magnetic_field * vector(0, -cos(theta), sin(theta))


magnetic_field_1 = MagneticField(8, display_1)
magnetic_field_2 = MagneticField(8, display_2)

m0 = 1
start_position = vec(40, 25, 0)
start_velocity = vec(0, -0.9, 0)
charge_1 = ChargedParticle(display_1, start_position, start_velocity, m0)

beta = 0.3  # beta  =  v/c, take c = 1
gamma = 1 / sqrt(1 - beta ** 2)
denv = (1 - start_velocity.x * beta)
start_velocity_2 = vector(start_velocity.x - beta, start_velocity.y / gamma, start_velocity.z / gamma) / denv
charge_2 = ChargedParticle(display_2, start_position, start_velocity_2, m0 * gamma)


def run(initial_position, dt):  # Euler's method to find positions in both systems
    for i in range(0, 3000):
        rate(100)
        field = magnetic_field_1.field_at(initial_position)
        charge_1.update_with(field, vector(0, 0, 0), dt)
        charge_2.update_with(gamma * field, gamma * beta * vector(0, -field.z, field.y), dt)

def change_velocity(event):
    global beta
    beta = event.value
    slider_text.text = "{:1.2f}' * c".format(event.value)

popup = label(text="Click to start animation", pos=vec(0, 60, 0), canvas=display_1)
display_2.append_to_caption("\nVelocity frame S'")
_ = slider(value=.3, min=0, max=.9, bind=change_velocity)
slider_text = wtext(text=".3 * c")


MathJax.Hub.Queue(["Typeset", MathJax.Hub])
t = 0
while True:
    popup.visible = True
    display_1.waitfor("click")

    charge_1.reset(start_position, start_velocity)
    start_velocity_2 = vector(start_velocity.x - beta, start_velocity.y / gamma, start_velocity.z / gamma) / denv
    charge_2.reset(start_position, start_velocity_2)
    popup.visible = False
    run(start_position, dt=.1)
