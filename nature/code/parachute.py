#GlowScript 3.2 VPython

# https://sciencesamurai.trinket.io/a-level-physics-programming#/dynamics-understanding-motion/free-fall-with-parachute
##############################
# implementation of background graphic adapted from Let's Code Physics
#   https://www.youtube.com/watch?v=3PS7PjZ2vzY
# panorama image from https://unsplash.com/photos/dLkyhhC-e6Y
###########################
# note: no air resistance without parachute
# parachute deployment of various sizes
# upon collision with ground, parachute collapses (and ball bounces)
##############################

from vpython import canvas, rate, box, vec, vector, color, cylinder, sphere, cone, slider, graph, gcurve, arrow, label, pi, mag

display = canvas(width = 400, height = 350, autoscale = False, range = 2)


class Person:
    def __init__(self, position, mass=1, velocity=vec(0, 0, 0), colour=color.green):
        self._head = sphere(radius=0.07, color=color.yellow)
        self._body = cylinder(axis=vector(0, -0.3, 0), radius=0.03, color=colour)
        self._arm_a = cylinder(axis=vector(-0.15, -0.15, 0), radius=0.02, color=colour)
        self._arm_b = cylinder(axis=vector(0.15, -0.15, 0), radius=0.02, color=colour)
        self._leg_a = cylinder(axis=vector(0.1, -0.15, 0), radius=0.02, color=colour)
        self._leg_b = cylinder(axis=vector(-0.1, -0.15, 0), radius=0.02, color=colour)
        self._height = position
        self._set_positions()
        self._mass = mass # includes parachute
        self._momentum = velocity * mass

    def _set_positions(self):
        position = self._height + vec(0.1, 0, 0)
        self._head.pos = position + vector(-0.1, 0.5, 0.0)
        self._body.pos = self._head.pos
        self._arm_a.pos=self._head.pos + vector(0, -0.1, 0)
        self._arm_b.pos=self._head.pos + vector(0, -0.1, 0)
        self._leg_a.pos=self._head.pos + self._body.axis
        self._leg_b.pos=self._head.pos + self._body.axis

    def update(self, position):
        self._height = position
        self._set_positions()

    def body_pos(self):
        return self._body.pos - vector(0, self._head.radius * 2, 0)

    def height(self):
        return self._height


# scene.caption = """Ball is modelled as point object; finite size is for visualisation."""+'\n\n'
display.caption = '\n\n'

# maximum graph range (integration time?)
tmax = 40

## physics constants
cres = 0.5  # coefficient of restitution
g = vec(0, -1, 0)  # use natural units
k = 2  # coefficient of air resistance, assume F = -k*A*v

## setup the "world"
h0 = vec(0, 0, 0)  # origin of zero height
world_height = 25
world_radius = 5
world = cylinder(pos=h0, axis=vec(0, world_height, 0), radius=world_radius, opacity=0, shininess=0,
                 texture={
                     'file': 'https://images.unsplash.com/photo-1533002832-1721d16b4bb9?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1578&q=80',
                     'place': ['sides'], 'turn': -1})

# # label the parameters
# textbox = label(pos=h0+vec(0,-0.2,0))
# textbox.text = '<i>C</i><sub>restitution</sub> = '+cres

# ground for collisions
ground = box(pos=h0, size=0.4 * vec(0.5 * world_radius, 0.1, 0.5 * world_radius), color=color.white, opacity=0.5)

height = h0 + 0.9 * vec(0, world_height, 0)
ball = sphere(pos=height, radius=0.04, color=color.blue, opacity=1)
person = Person(height)


v = vec(0, 0, 0)
m = 1  # mass of ball (and parachute)
ball.pvec = m * v  # momentum


# chute
R = 0
chuteoffset = vec(0, 1, 0)  # appear above the ball
chute = cylinder(pos=person.body_pos() + chuteoffset, axis=vec(0, 0.02, 0), radius=R, color=color.red, opacity=0.8)
strings = cone(pos=chute.pos, axis=-chuteoffset, radius=R, color=color.gray(0.5), opacity=0.2)


def deploy(event):
    # print(R.value)
    chute.radius = event.value
    strings.radius = event.value


ctrl = slider(pos=display.title_anchor, top=15, length=300, min=0, max=0.9, step=0.1, bind=deploy)
display.append_to_title('chute size' + '\n\n')

# graphs
g1 = graph(scroll=True, width=400, height=150, ytitle="position", xmin=0,
           xmax=tmax, xtitle="time",title='Height against time', background=color.black)
height_curve = gcurve(graph=g1, interval=10, color=color.red)
g2 = graph(scroll=True, width=400, height=150, ytitle="velocity", xmin=0,
           xmax=tmax, xtitle="time",title='Velocity against time', background=color.black)
velocity_curve = gcurve(graph=g2, interval=10, color=color.green)
g3 = graph(scroll=True, width=400, height=150, ytitle="acceleration", xmin=0,
           xmax=tmax ,xtitle="time",title='Acceleration against time', background=color.black)
acceleration_curve = gcurve(graph=g3, interval=10, color=color.purple)

g0 = graph(scroll=True, width=400, height=250, xtitle="time", ytitle="energy", xmin=0,
           xmax=tmax, background=color.black, title='Energy against time')
potential_energy_curve = gcurve(graph=g0, interval=10, color=color.red, label="PE")
kinetic_energy_curve = gcurve(graph=g0, interval=10, color=color.green, label="KE")
total_energy_curve = gcurve(graph=g0, interval=10, color=color.black, label="Total")

## arrows
# velocity arrow on the left
arrow_offset = vec(-1, 0, 0)
velocity_scale = 0.3
vel = arrow(pos=ball.pos + arrow_offset - v / 2, axis=v * velocity_scale, color=color.green, shaftwidth=0.04, round=True)
label_offset = vec(-0.5, 0, 0)
label_speed = label(pos=vel.pos + label_offset + v / 2, box=False, opacity=0.1, text='vel')
# acceleration arrow on the right
arrow_offset_right = vec(1, 0, 0)
acclnscale = 0.8
acceleration_arrow = arrow(pos=ball.pos + arrow_offset_right, axis=g * acclnscale, color=color.purple, shaftwidth=0.06, round=False)
labeloffsetright = vec(0.5, 0, 0)
acceleration_label = label(pos=acceleration_arrow.pos + labeloffsetright, box=False, opacity=0.1, text='accel')

## dynamics
t = 0
dt = 0.001
while t < tmax:  # while True:
    rate(1 / dt)

    # get value from slider
    R = ctrl.value
    parachute_area = pi * R * R  # area of parachute
    resistance_force = -k * parachute_area * v
    total_force = m * g + resistance_force

    ball.pvec += total_force * dt
    v = ball.pvec / m
    # v += g*dt
    height += v * dt

    # adjust all objects: ball -> chute/strings -> arrows
    ball.pos = height

    person.update(height)


    chute.pos = person.body_pos() + chuteoffset
    strings.pos = chute.pos
    vel.pos = ball.pos + arrow_offset - v / 2  # centre of arrow with the ball
    vel.axis = v

    label_speed.pos = vel.pos + label_offset + v / 2  # aligned with ball
    label_speed.text = '<i>v</i> = ' + str(round(100 * v.y) / 100)
    acceleration_arrow.pos = ball.pos + arrow_offset_right
    acceleration_arrow.axis = total_force / m
    acceleration_label.pos = acceleration_arrow.pos + labeloffsetright
    acceleration_label.text = '<i>a</i> = ' + str(round(1000 * total_force.y / m) / 1000)

    # auto-scroll
    display.camera.follow(ball)

    # collisions of block a with ground
    if ball.pos.y < ground.pos.y:
        ball.pvec = cres * vec(0, mag(ball.pvec), 0)  # momentum upwards
        # note that force (acceleration) is not modified by collision as it would be huge; momentum is directly changed
        # v = cres*vec(0,mag(v),0)
        ## vanish the chute
        ctrl.value = 0
        #deploy(0)  # since bind function not automatically called
        chute.radius = 0
        strings.radius = 0

    t += dt

    # graphs
    height_curve.plot(data=[t, height.y - ground.pos.y])
    velocity_curve.plot(data=[t, v.y])
    acceleration_curve.plot(data=[t, total_force.y / m])

    pe = m * (-g.y) * (height.y - ground.pos.y)
    ke = 0.5 * m * v.y * v.y

    potential_energy_curve.plot(data=[t, pe])
    kinetic_energy_curve.plot(data=[t, ke])
    total_energy_curve.plot(data=[t, pe + ke])
