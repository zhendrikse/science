#Web VPython 3.2

from vpython import rate, vec, canvas, helix, color, cylinder, textures, box, button, slider

title = """
&#x2022; Spring implementation based on <a href="https://bphilhour.trinket.io/physics-through-glowscript-an-introductory-course#/1-introduction-objects-parameters-and-the-3d-environment/optional-compound-objects">this example</a> from tutorial by B. Philhour
&#x2022; Refactored and modified by <a href="https://www.hendrikse.name/">Zeger Hendrikse</a> to <a href="https://github.com/zhendrikse/science/blob/main/waves/code/hanging_spring.py">hanging_spring.py</a>

"""

display = canvas(title=title, background=color.gray(0.075), width=600, height=500, forward=vec(0, -.35, -1), range=.2, center=vec(0, -.14, 0))

g = 9.8
frame_rate = 100

class SpringElement:
    def __init__(self, position, axis, radius, mass, length):
        self._element = helix(pos=position, axis=axis, radius=radius, coils=3, color=color.yellow)
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
            self._elements.append(SpringElement(topPos + (i / N) * line, element_length * line.norm(), width / 2, mass / N, element_length))

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

    def set_k_to(self, event):
        self._k = event.value

    def set_drag_to(self, event):
        self._drag = event.value

def set_scene():
    cylinder(pos=vec(-.17, 0.02, 0), radius=0.005, texture=textures.wood, axis=vec(0, -.25, 0))
    cylinder(pos=vec(+.17, 0.02, 0), radius=0.005, texture=textures.wood, axis=vec(0, -.25, 0))
    cylinder(pos=vec(+.17, 0.0025, 0), radius=0.0025, texture=textures.wood, axis=vec(-0.02, 0, 0))
    cylinder(pos=vec(-.17, 0.0025, 0), radius=0.0025, texture=textures.wood, axis=vec(+0.02, 0, 0))
    box(pos=vec(0, -0.23, 0), size=vec(0.4, 0.005, 0.2), texture=textures.rug)

def reset(event):
    global spring
    for obj in display.objects:
        obj.visible = False
        del obj
    set_scene()
    spring = Spring(25, 0.1, 100, 0.025, vec(-.15, 0, 0), vec(.15, 0, 0), 0.025)

def set_frame_rate(event):
    global frame_rate
    frame_rate = event.value

spring = Spring(25, 0.1, 100, 0.025, vec(-.15, 0, 0), vec(.15, 0, 0), 0.025)

display.append_to_caption("\n")
_ = button(text="reset", bind=reset)

display.append_to_caption("\n\nSpring constant")
_ = slider(min=100, max=1000, value=100, bind=spring.set_k_to)

display.append_to_caption("\n\nDrag")
_ = slider(min=0, max=0.05, value=0.025, bind=spring.set_drag_to)

display.append_to_caption("\n\nFrame rate")
_ = slider(min=0, max=200, value=frame_rate, bind=set_frame_rate)

delta_t = 0.001
set_scene()
while True:
    rate(frame_rate)
    spring.update_by(delta_t)
