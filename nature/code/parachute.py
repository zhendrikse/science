#Web VPython 3.2

title="""&#x2022; Based on <a href="https://sciencesamurai.trinket.io/a-level-physics-programming#/dynamics-understanding-motion/free-fall-with-parachute">Original code</a> by <a href="https://sciencesamurai.trinket.io/">sciencesamurai.trinket.io</a>
&#x2022; Implementation of background graphic adapted from <a href="https://www.youtube.com/@LetsCodePhysics">Let&apos;s code physics</a> (<a href="https://www.youtube.com/watch?v=3PS7PjZ2vzY">video</a>)
&#x2022; Refactored by <a href="https://www.hendrikse.name/">Zeger Hendrikse</a> to <a href="https://github.com/zhendrikse/science/blob/main/nature/code/parachute.py">parachute.py</a>
&#x2022; Panorama image from <a href="https://unsplash.com/photos/dLkyhhC-e6Y">unsplash.com</a>

&#x2022; Move slider to deploy parachute 
&#x2022; There is no air resistance without parachute
&#x2022; Upon collision with ground, parachute collapses (and person bounces) 

"""

from vpython import canvas, rate, box, vec, vector, color, cylinder, sphere, cone, slider, graph, gcurve, arrow, label, pi, mag

display = canvas(title=title, width = 400, height = 350, autoscale = False, range = 2)

g = vec(0, -1, 0)  # use natural units
k = 2  # coefficient of air resistance, assume F = -k*A*v

class Person:
    def __init__(self, position, mass=1, velocity=vec(0, 0, 0), colour=color.green):
        self._head = sphere(radius=0.07, color=color.yellow)
        self._body = cylinder(axis=vector(0, -0.3, 0), radius=0.03, color=colour)
        self._arm_a = cylinder(axis=vector(-0.15, -0.15, 0), radius=0.02, color=colour)
        self._arm_b = cylinder(axis=vector(0.15, -0.15, 0), radius=0.02, color=colour)
        self._leg_a = cylinder(axis=vector(0.1, -0.15, 0), radius=0.02, color=colour)
        self._leg_b = cylinder(axis=vector(-0.1, -0.15, 0), radius=0.02, color=colour)

        self._mass = mass # includes parachute
        self._momentum = velocity * mass
        self._position = position
        self._update_body_parts()

    def _update_body_parts(self):
        position = self._position + vec(0.1, 0, 0)
        self._head.pos = position + vector(-0.1, 0.5, 0.0)
        self._body.pos = self._head.pos
        self._arm_a.pos=self._head.pos + vector(0, -0.1, 0)
        self._arm_b.pos=self._head.pos + vector(0, -0.1, 0)
        self._leg_a.pos=self._head.pos + self._body.axis
        self._leg_b.pos=self._head.pos + self._body.axis

    def update(self, force, dt):
        self._momentum += force * dt
        self._position += self._momentum / self._mass * dt
        self._update_body_parts()

    def body_pos(self):
        return self._body.pos - vector(0, self._head.radius * 2, 0)

    def position(self):
        return self._position

    def velocity(self):
        return self._momentum / self._mass

    def land(self, cres):
        self._momentum = cres * vec(0, mag(self._momentum), 0)  # momentum upwards

    def mass(self):
        return self._mass

class Parachute:
    def __init__(self, position, chuteoffset=vec(0, 1, 0)):
        self._chute = cylinder(pos=position + chuteoffset, axis=vec(0, 0.02, 0), radius=0, color=color.red, opacity=0.8)
        self._chute_strings = cone(pos=self._chute.pos, axis=-chuteoffset, radius=0, color=color.gray(0.5), opacity=0.2)
        self._chuteoffset = chuteoffset

    def modify(self, event):
        self._chute.radius = event.value
        self._chute_strings.radius = event.value

    def update(self, position):
        self._chute.pos = position + self._chuteoffset
        self._chute_strings.pos = self._chute.pos

    def reset(self):
        self._chute.radius = 0
        self._chute_strings.radius = 0

    def area(self):
        return pi * self._chute.radius * self._chute.radius

# # label the parameters
# textbox = label(pos=h0+vec(0,-0.2,0))
# textbox.text = '<i>C</i><sub>restitution</sub> = '+cres
## setup the "world"
h0 = vec(0, 0, 0)  # origin of zero height
world_height = 25
world_radius = 5
world = cylinder(pos=h0, axis=vec(0, world_height, 0), radius=world_radius, opacity=0, shininess=0,
                 texture={
                     'file': 'https://images.unsplash.com/photo-1533002832-1721d16b4bb9?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1578&q=80',
                     'place': ['sides'], 'turn': -1})


# ground for collisions
ground = box(pos=h0, size=0.4 * vec(0.5 * world_radius, 0.1, 0.5 * world_radius), color=color.white, opacity=0.5)
person = Person(h0 + 0.9 * vec(0, world_height, 0))
parachute = Parachute(person.body_pos())

display.append_to_title('<b>Chute size</b>')
_ = slider(pos=display.title_anchor, top=15, length=300, min=0, max=0.9, step=0.05, bind=parachute.modify)
display.append_to_title('\n\n')

# graphs
time_max = 40
g1 = graph(scroll=True, width=400, height=150, ytitle="position", xmin=0,
           xmax=time_max, xtitle="time", title='Height against time', background=color.black)
height_curve = gcurve(graph=g1, interval=10, color=color.red)
g2 = graph(scroll=True, width=400, height=150, ytitle="velocity", xmin=0,
           xmax=time_max, xtitle="time", title='Velocity against time', background=color.black)
velocity_curve = gcurve(graph=g2, interval=10, color=color.green)
g3 = graph(scroll=True, width=400, height=150, ytitle="acceleration", xmin=0,
           xmax=time_max, xtitle="time", title='Acceleration against time', background=color.black)
acceleration_curve = gcurve(graph=g3, interval=10, color=color.purple)

g0 = graph(scroll=True, width=400, height=250, xtitle="time", ytitle="energy", xmin=0,
           xmax=time_max, background=color.black, title='Energy against time')
potential_energy_curve = gcurve(graph=g0, interval=10, color=color.red, label="PE")
kinetic_energy_curve = gcurve(graph=g0, interval=10, color=color.green, label="KE")
total_energy_curve = gcurve(graph=g0, interval=10, color=color.black, label="Total")

## arrows
# velocity arrow on the left
arrow_offset = vec(-1, 0, 0)
velocity_scale = 0.3
vel = arrow(pos=person.position() + arrow_offset - person.velocity() / 2, axis=person.velocity() * velocity_scale, color=color.green, shaftwidth=0.04, round=True)
label_offset = vec(-0.5, 0, 0)
label_speed = label(pos=vel.pos + label_offset + person.velocity() / 2, box=False, opacity=0.1, text='vel')
# acceleration arrow on the right
arrow_offset_right = vec(1, 0, 0)
acclnscale = 0.8
acceleration_arrow = arrow(pos=person.position() + arrow_offset_right, axis=g * acclnscale, color=color.purple, shaftwidth=0.06, round=False)
labeloffsetright = vec(0.5, 0, 0)
acceleration_label = label(pos=acceleration_arrow.pos + labeloffsetright, box=False, opacity=0.1, text='accel')

## dynamics
t = 0
dt = 0.001
while t < time_max:  # while True:
    rate(1 / dt)

    resistance_force = -k * parachute.area() * person.velocity()
    total_force = person.mass() * g + resistance_force
    person.update(total_force, dt)
    parachute.update(person.body_pos())


    vel.pos = person.position() + arrow_offset - person.velocity() / 2  # centre of arrow with the ball
    vel.axis = person.velocity()

    label_speed.pos = vel.pos + label_offset + person.velocity() / 2  # aligned with ball
    label_speed.text = '<i>v</i> = ' + str(round(100 * person.velocity().y) / 100)
    acceleration_arrow.pos = person.position() + arrow_offset_right
    acceleration_arrow.axis = total_force / person.mass()
    acceleration_label.pos = acceleration_arrow.pos + labeloffsetright
    acceleration_label.text = '<i>a</i> = ' + str(round(1000 * total_force.y / person.mass()) / 1000)

    # auto-scroll
    display.camera.follow(person._body)

    if person.position().y < ground.pos.y:
        cres = 0.5  # coefficient of restitution
        person.land(cres)
        parachute.reset()

    t += dt

    # graphs
    height_curve.plot(data=[t, person.position().y - ground.pos.y])
    velocity_curve.plot(data=[t, person.velocity().y])
    acceleration_curve.plot(data=[t, total_force.y / person.mass()])

    pe = person.mass() * (-g.y) * (person.position().y - ground.pos.y)
    ke = 0.5 * person.mass() * person.velocity().y * person.velocity().y

    potential_energy_curve.plot(data=[t, pe])
    kinetic_energy_curve.plot(data=[t, ke])
    total_energy_curve.plot(data=[t, pe + ke])
