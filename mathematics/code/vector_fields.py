#Web VPython 3.2
from vpython import arange, arrow, vec, sin, cos, pi, sqrt, color, rate, canvas, cylinder, label, checkbox, button

title="""&#x2022; <a href="https://github.com/zhendrikse/science/blob/main/mathematics/code/vector_fields.py">vector_fields.py</a> by <a href="https://www.hendrikse.name/">Zeger Hendrikse</a>

&#x2022; Shown below is the <a href="https://krajit.github.io/sympy/vectorFields/vectorFields.html">vector field</a>:

$\\begin{pmatrix} x \\\\ y \\\\ z \\end{pmatrix} = \\begin{pmatrix} \\sin(\\pi x)\\cos(\\pi y)\\cos(\\pi z) \\\\ -\\cos(\\pi  x)\\sin(\\pi y)\\cos(\\pi z) \\\\ (\\sqrt{(2 / 3)} \\cos(\\pi x)\\cos(\\pi y)\\sin(\\pi z)) \\end{pmatrix}$

"""

animation = canvas(height=500, forward=vec(-2.5, -2.2, -2.2), center=vec(0, 0, -.5), up=vec(0, 0, 1), title=title, background=color.gray(0.075), range=2.0)

x_hat = vec(0, 1, 0)
y_hat = vec(0, 0, 1)
z_hat = vec(1, 0, 0)
base = [x_hat, y_hat, z_hat]

class Base:
    def __init__(self, xx, yy, zz, axis_color, tick_marks_color, num_tick_marks):
        x_min, x_max = min(xx), max(xx)
        y_min, y_max = min(yy), max(yy)
        z_min, z_max = min(zz), max(zz)
        range_x, range_y, range_z = x_max - x_min, y_max - y_min, z_max - z_min
        max_of_base = max(range_x, range_y, range_z)
        delta = max_of_base / num_tick_marks
        position = vec(x_min, z_min, y_min)
        radius = max_of_base / 200

        self._mesh = []
        self._create_mesh(delta, max_of_base, num_tick_marks, position, radius)

        self._tick_marks = []
        self._create_tick_marks(delta, max_of_base, num_tick_marks, position, tick_marks_color, x_min, y_min, z_min)

        self._axis_labels = []
        pos = position + x_hat * (max_of_base + 2.5 * delta) + .5 * max_of_base * z_hat
        self._axis_labels += [label(pos=pos, text="Y-axis", color=axis_color, box=False)]
        pos = position + z_hat * (max_of_base + 2.5 * delta) + .5 * max_of_base * y_hat
        self._axis_labels += [label(pos=pos, text="Z-axis", color=axis_color, box=False)]
        pos = position + z_hat * (max_of_base + 2.5 * delta) + .5 * max_of_base * x_hat
        self._axis_labels += [label(pos=pos, text="X-axis", color=axis_color, box=False)]

    def _create_tick_marks(self, delta, max_of_base, num_tick_marks, position, tick_marks_color, x_min, y_min, z_min):
        increment = max_of_base / num_tick_marks
        for i in range(1, num_tick_marks, 2):
            # Tick marks X
            label_text = '{:1.2f}'.format(x_min + i * increment, 2)
            pos = position + x_hat * i * delta + z_hat * (max_of_base + .75 * delta)
            self._tick_marks.append(label(pos=pos, text=label_text, color=tick_marks_color, box=False))
            # Tick marks Y
            label_text = '{:1.2f}'.format(y_min + i * increment, 2)
            pos = position + z_hat * i * delta + x_hat * (max_of_base + .75 * delta)
            self._tick_marks.append(label(pos=pos, text=label_text, color=tick_marks_color, box=False))
            # Tick marks Z
            label_text = '{:1.2f}'.format(z_min + i * increment, 2)
            pos = position + y_hat * i * delta + z_hat * (max_of_base + .75 * delta)
            self._tick_marks.append(label(pos=pos, text=label_text, color=tick_marks_color, box=False))

    def _create_mesh(self, delta, max_of_base, num_tick_marks, position, radius):
        for i in range(num_tick_marks + 1):
            # XY-mesh (lies in VPython xz-plane)
            self._mesh += [cylinder(pos=position + z_hat * delta * i, axis=max_of_base * x_hat)]
            self._mesh += [cylinder(pos=position + x_hat * delta * i, axis=max_of_base * z_hat)]
            # YZ-mesh (lies in VPython zy-plane)
            self._mesh += [cylinder(pos=position + z_hat * delta * i, axis=max_of_base * y_hat)]
            self._mesh += [cylinder(pos=position + y_hat * delta * i, axis=max_of_base * z_hat)]
            # XZ-mesh (lies in VPython xy-plane)
            self._mesh += [cylinder(pos=position + x_hat * delta * i, axis=max_of_base * y_hat)]
            self._mesh += [cylinder(pos=position + y_hat * delta * i, axis=max_of_base * x_hat)]
        for item in self._mesh:
            item.color = color.gray(.25)
            item.radius = radius


    def tick_marks_visibility_is(self, visible):
        for tick_mark in self._tick_marks:
            tick_mark.visible = visible

    def mesh_visibility_is(self, visible):
        for i in range(len(self._mesh)):
            self._mesh[i].visible = visible

    def axis_labels_visibility_is(self, visible):
        for i in range(len(self._axis_labels)):
            self._axis_labels[i].visible = visible

class Plot:
    def __init__(self, x, y, z, f_x_y_z):
        self._x, self._y, self._z, self._f_x_y_z = x, y, z, f_x_y_z
        self._arrows = []
        for x in self._x:
            for y in self._y:
                for z in self._z:
                    arrow_ = arrow(axis=self._f_x_y_z(x, y, z) * .25, pos=vec(x, y, z), make_trail=True, color=color.gray(0.85))
                    arrow_.color = color.yellow
                    self._arrows.append(arrow_)

    def reset(self):
        index = 0
        for x in self._x:
            for y in self._y:
                for z in self._z:
                    self._arrows[index].pos=vec(x, y, z)
                    self._arrows[index].axis = self._f_x_y_z(x, y, z) * .25
                    self._arrows[index].clear_trail()
                    index += 1

    def update(self, dt=0.):
        index = 0
        for _ in range(len(self._arrows)):
            position = self._arrows[index].pos
            axis = self._arrows[index].axis
            new_position = position + axis * dt
            self._arrows[index].pos = new_position
            self._arrows[index].axis = self._f_x_y_z(position.x, position.y, position.z) * .25
            index += 1

    def make_trail(self, boolean_value):
        for arrow_ in self._arrows:
            arrow_.make_trail = boolean_value

def vector_field(x, y, z):
    u = sin(pi * x) * cos(pi * y) * cos(pi * z)
    v = -cos(pi * x) * sin(pi * y) * cos(pi * z)
    w = (sqrt(2.0 / 3.0) * cos(pi * x) * cos(pi * y) * sin(pi * z))
    return vec(u, v, w)

def toggle_tick_marks(event):
    plot_base.tick_marks_visibility_is(event.checked)


def toggle_axis_labels(event):
    plot_base.axis_labels_visibility_is(event.checked)


def toggle_mesh(event):
    plot_base.mesh_visibility_is(event.checked)

def toggle_trail(event):
    plot.make_trail(event.checked)


def toggle_animate(event):
    global dt
    dt = 0.01 if event.checked else 0

def reset():
    plot.reset()

_ = checkbox(text='Mesh ', bind=toggle_mesh, checked=True)
_ = checkbox(text='Axis labels ', bind=toggle_axis_labels, checked=True)
_ = checkbox(text='Tick marks ', bind=toggle_tick_marks, checked=True)
_ = checkbox(text='Animate ', bind=toggle_animate, checked=False)
_ = checkbox(text='Leave trail  ', bind=toggle_trail, checked=True)
_ = button(text="Reset", bind=reset)

animation.append_to_caption("\n")

MathJax.Hub.Queue(["Typeset", MathJax.Hub])

plot = Plot(arange(-0.8, 1, 0.2), arange(-0.8, 1, 0.2), arange(-0.8, 1, 0.8), vector_field)
plot_base = Base(arange(-1, 1.2, 0.2), arange(-1, 1.2, 0.2), arange(-1, 1.2, 0.8), color.yellow, color.green, 10)

dt =.0
t = 0.0
while True:
    rate(30)
    plot.update(dt)
    t += dt
    if t >=2:
        plot.reset()
        t = 0.0


