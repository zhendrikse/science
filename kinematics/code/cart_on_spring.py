# Web VPython 3.2

from vpython import canvas, vec, cylinder, box, color, textures, compound, helix, rate, arrow

title = """
&#x2022; Based on <a href="https://bphilhour.trinket.io/physics-through-glowscript-an-introductory-course#/1-introduction-objects-parameters-and-the-3d-environment/optional-compound-objects">this example</a> from tutorial by B. Philhour
&#x2022; Refactored by <a href="https://www.hendrikse.name/">Zeger Hendrikse</a> to <a href="https://github.com/zhendrikse/science/blob/main/kinematics/code/cart_on_spring.py">cart_on_spring.py</a>
&#x2022; Pull on cart with your mouse!

"""

animation = canvas(width=600, height=400, title=title, background=color.gray(0.075), forward=vec(-.5, -.3, -.7),
                   center=vec(.07, -.025, 0), range=.175)

g = 9.8


class Cart:
    def __init__(self, body_color):
        self.L = 0.10
        self.W = 0.05
        self.H = 0.02
        self._mass = 1.5
        self._velocity = vec(1.5, 0, 0)

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

    def update_by(self, force, dt):
        self._velocity += (force / self._mass) * dt
        self.body.pos += self._velocity * dt

    def position(self):
        return self.body.pos + vec(-self.L / 2, self.H / 4, 0)

    def hits_wall(self, wall_position):
        return self.body.pos.x < wall_position.x + self.L / 2

    def bounce(self, wall_position):
        self._velocity.x *= -0.5
        self.body.pos.x = wall_position.x + self.L / 2


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

    def update_left_element(self, neighbor, k, top):
        self._force += k * (neighbor.axis() - self._length * neighbor.axis().norm())
        self._element.pos = top
        self._element.axis = neighbor.position() - self._element.pos

    def update_right_element(self, neighbor, k, bottom):
        self._force -= k * (neighbor.axis() - self._length * neighbor.axis().norm())
        self._element.pos = bottom
        self._element.axis = vec(0, 0, 0)

    def axis(self):
        return self._element.axis

    def position(self):
        return self._element.pos

    def force(self):
        return self._force

    def update_with(self, left_neighbor, right_neighbor, k, dt):
        self._force -= k * (left_neighbor.axis() - self._length * left_neighbor.axis().norm())
        self._force += k * (self.axis() - self._length * self.axis().norm())
        tension = k * (self.axis() - self._length * self.axis().norm()).mag
        self._velocity += (self._force / self._mass) * dt
        self._element.pos += self._velocity * dt
        self._element.axis = right_neighbor.position() - self._element.pos
        return tension


class Spring:
    def __init__(self, N, mass, k, drag, topPos, botPos, width):
        self._elements = []
        self._drag = drag
        self._k = k
        self._topPos = topPos
        self._botPos = botPos

        line = botPos - topPos
        element_length = (topPos - botPos).mag / N
        for i in range(N):
            self._elements.append(
                SpringElement(topPos + (i / N) * line, element_length * line.norm(), width / 2, mass / N, element_length))

    def update_by(self, dt):
        total_elements = len(self._elements)
        for i in range(total_elements):
            self._elements[i].update_gravitational_force(self._drag)

        self._elements[0].update_left_element(self._elements[1], self._k, self._topPos)
        tension = 0.0
        for i in range(1, total_elements - 1):
            tension += self._elements[i].update_with(self._elements[i - 1], self._elements[i + 1], self._k, dt)
        self._elements[-1].update_right_element(self._elements[-2], self._k, self._botPos)

        return tension / total_elements

    def force_on_last_element(self):
        return self._elements[-1].force()

    def update_with(self, cart_position):
        self._botPos = cart_position


cart = Cart(color.blue)
track = box(pos=vec(0, -0.025, 0), size=vec(0.5, 0.01, 0.08), texture=textures.wood)
stop = box(pos=vec(-0.245, 0.0, 0.0), size=vec(0.01, 0.04, 0.08), texture=textures.wood)
spring = Spring(20, 0.1, 2500, 0.5, stop.pos, cart.body.pos - vec(cart.L / 2, 0, 0), 0.01)

pull = False
chosenObject = None
force_arrow = arrow(axis=vec(0, 0, 0), color=color.red, opacity=0.5)


def down():
    global pull, chosenObject, cart
    chosenObject = animation.mouse.pick()
    if chosenObject == cart.body:
        pull = True


def move():
    global pull, chosenObject, force_arrow
    if pull:  # mouse button is down
        force_arrow.pos = chosenObject.pos
        force_arrow.axis.x = animation.mouse.pos.x - chosenObject.pos.x


def up():
    global pull, chosenObject, force_arrow
    pull = False
    offset = vec(0, 0, 0)
    force_arrow.axis = vec(0, 0, 0)


animation.bind("mousedown", down)
animation.bind("mousemove", move)
animation.bind("mouseup", up)

delta_t = 0.001
while True:
    rate(1 / delta_t)

    # Note: we add a small rightward force to compensate for weight of spring
    netForce = vec(0.1, 0, 0) + spring.force_on_last_element()

    if pull:
        netForce += 50 * force_arrow.axis
    netForce.y = 0  # deal with normal force later
    if cart.hits_wall(stop.pos):
        cart.bounce(stop.pos)
    cart.update_by(netForce, delta_t)
    spring.update_with(cart.position())
    spring.update_by(delta_t)
    force_arrow.pos = cart.body.pos
