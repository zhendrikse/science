# GlowScript 3.2 VPython

from vpython import canvas, vec, cylinder, box, color, textures, compound, helix, rate, arrow

title = """
https://bphilhour.trinket.io/physics-through-glowscript-an-introductory-course#/1-introduction-objects-parameters-and-the-3d-environment/optional-compound-objects
"""

animation = canvas(title=title, background=color.gray(0.075))

g = 9.8


class Cart:

    def __init__(self, body_color):
        self.L = 0.10
        self.W = 0.05
        self.H = 0.02
        self.mass = 1.5
        self.vel = vec(1.5, 0, 0)

        self.frame = box(pos=vec(0, 0, 0), size=vec(self.L, self.H, self.W), opacity=0.6, color=body_color)
        self.wheelFR = cylinder(pos=vec(0.4 * self.L, -0.5 * self.H, 0.4 * self.W), radius=0.5 * self.H,
                                axis=vec(0, 0, 0.15 * self.W))
        self.wheelFL = cylinder(pos=vec(0.4 * self.L, -0.5 * self.H, -0.6 * self.W), radius=0.5 * self.H,
                                axis=vec(0, 0, 0.15 * self.W))
        self.wheelRR = cylinder(pos=vec(-0.4 * self.L, -0.5 * self.H, 0.4 * self.W), radius=0.5 * self.H,
                                axis=vec(0, 0, 0.15 * self.W))
        self.wheelRL = cylinder(pos=vec(-0.4 * self.L, -0.5 * self.H, -0.6 * self.W), radius=0.5 * self.H,
                                axis=vec(0, 0, 0.15 * self.W))

        self.body = compound([self.frame, self.wheelFR, self.wheelFL, self.wheelRR, self.wheelRL])

    def process(self, netForce, dt):
        self.vel = self.vel + (netForce / self.mass) * dt
        self.body.pos = self.body.pos + self.vel * dt


myCart = Cart(color.blue)

track = box(pos=vec(0, -0.025, 0), size=vec(0.5, 0.01, 0.08), texture=textures.wood)
stop = box(pos=vec(-0.245, 0.0, 0.0), size=vec(0.01, 0.04, 0.08), texture=textures.wood)


class SpringElement:
    def __init__(self, position, axis, radius, mass, length):
        self._element = helix(pos=position, axis=axis, radius=radius, coils=3)
        self._velocity = vec(0, 0, 0)
        self._mass = mass
        self._length = length
        self._force = vec(0, 0, 0)

    def update_gravitational_force(self, drag):
        self._force = vec(0, - self._mass * g, 0)
        # then drag, which helps with things getting out of hand
        self._force -= drag * self._velocity

    def update_force_left_fixed(self, neighbor, k, top):
        self._force += k * (neighbor.axis() - self._length * neighbor.axis().norm())
        self._element.pos = top
        self._element.axis = neighbor.position() - self._element.pos

    def update_force_right_fixed(self, neighbor, k, bottom):
        self._force -= k * (neighbor.axis() - self._length * neighbor.axis().norm())
        self._element.pos = bottom
        self._element.axis = vec(0, 0, 0)

    def axis(self):
        return self._element.axis

    def position(self):
        return self._element.pos

class String:

    def __init__(self, N, M, k, drag, topPos, botPos, initial_width):

        self.L = (topPos - botPos).mag
        self.N = N
        self.elemLength = self.L / N
        self.elemMass = M / N
        self.width = initial_width
        self.element = []
        self.drag = drag
        self.k = k
        self.topPos = topPos
        self.botPos = botPos
        self.line = botPos - topPos
        self.tension = 0.0

        for i in range(self.N):
            self.element.append(SpringElement(topPos + (i / N) * self.line, self.elemLength *  self.line.norm(), self.width / 2, self.elemMass, self.elemLength))

    def process(self, dt):

        self.tension = 0.0

        self.element[0].update_gravitational_force(self.drag)
        self.element[self.N - 1].update_gravitational_force(self.drag)
        self.element[0].update_force_left_fixed(self.element[1], self.k, self.topPos)
        for i in range(1, self.N - 1):
            self.element[i].update_gravitational_force(self.drag)
            self.element[i]._force -= self.k * (self.element[i - 1]._element.axis - self.elemLength * self.element[i - 1]._element.axis.norm())
            self.element[i]._force += self.k * (self.element[i]._element.axis - self.elemLength * self.element[i]._element.axis.norm())
            self.tension += self.k * (self.element[i]._element.axis - self.elemLength * self.element[i]._element.axis.norm()).mag
            self.element[i]._velocity += (self.element[i]._force / self.element[i]._mass) * dt
            self.element[i]._element.pos += self.element[i]._velocity * dt
            self.element[i]._element.axis = self.element[i + 1]._element.pos - self.element[i]._element.pos

        self.element[self.N - 1].update_force_right_fixed(self.element[self.N - 2], self.k, self.botPos)
        self.tension /= self.N


# string parameters are N, M, k, drag, topPos, botPos):
A = String(20, 0.1, 2500, 0.5, stop.pos, myCart.body.pos - vec(myCart.L / 2, 0, 0), 0.01)

##########################################
# handle mouse interactions

pull = False
chosenObject = None
forceArrow = arrow(axis=vec(0, 0, 0), color=color.red, opacity=0.5)


def down():
    global pull, chosenObject, myCart
    chosenObject = animation.mouse.pick()
    if chosenObject == myCart.body:
        pull = True


def move():
    global pull, chosenObject, forceArrow
    if pull:  # mouse button is down
        forceArrow.pos = chosenObject.pos
        forceArrow.axis.x = animation.mouse.pos.x - chosenObject.pos.x


def up():
    global pull, chosenObject, forceArrow
    pull = False
    offset = vec(0, 0, 0)
    forceArrow.axis = vec(0, 0, 0)


animation.bind("mousedown", down)
animation.bind("mousemove", move)
animation.bind("mouseup", up)

dt = 0.001

while True:

    rate(1 / dt)
    netForce = vec(0.1, 0, 0) + A.element[A.N - 1]._force
    # note above: I added a small rightward force to compensate for weight of spring
    if pull:
        netForce = netForce + 50 * forceArrow.axis
    netForce.y = 0  # deal with normal force later
    if myCart.body.pos.x < stop.pos.x + myCart.L / 2:
        myCart.vel.x = -0.5 * myCart.vel.x
        myCart.body.pos.x = stop.pos.x + myCart.L / 2
    myCart.process(netForce, dt)
    A.botPos = myCart.body.pos + vec(-myCart.L / 2, myCart.H / 4, 0)
    A.process(dt)
    forceArrow.pos = myCart.body.pos
