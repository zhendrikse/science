#Web VPython 3.2

from vpython import *


title = """&#x2022; Based on <a href="https://nbviewer.org/url/sites.science.oregonstate.edu/~landaur/Books/Problems/Codes/JupyterNB/RoesslerAttractor.ipynb">RoesslerAttractor.ipynb</a>
&#x2022; Refactored and extended to <a href="https://github.com/zhendrikse/science/blob/main/mathematics/code/roessler_attractor.py">roessler_attractor.py</a> by <a href="https://www.hendrikse.name/">Zeger Hendrikse</a>

$\\begin{cases} \\dfrac{dx}{dt} = -y-z \\\\ \\dfrac{dy}{dt} = x + ay  \\\\ \\dfrac{dz}{dt} = b+z(x-c) \\end{cases}$

"""


display = canvas(forward=vec(-2.5, -2.2, -2.2), center=vec(-2.75, -6.4, 23),
                   up=vec(0, 0, 1), title=title, height=500,
                   background=color.gray(0.075), range=47)

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
            item.color = color.gray(.5)
            item.radius = radius

        pos = position + (x_hat + z_hat) * .5 * max_of_base
        self._mesh += [box(pos=pos, length=max_of_base, width=radius, height=max_of_base,opacity=0.05)]
        pos = position + (z_hat + y_hat) * .5 * max_of_base
        self._mesh += [box(pos=pos, length=max_of_base, width=max_of_base, height=radius, opacity=0.05)]
        pos = position + (y_hat + x_hat) * .5 * max_of_base
        self._mesh += [box(pos=pos, length=radius, width=max_of_base, height=max_of_base, opacity=0.05)]

    def tick_marks_visibility_is(self, event):
        for tick_mark in self._tick_marks:
            tick_mark.visible = event.checked

    def mesh_visibility_is(self, event):
        for i in range(len(self._mesh)):
            self._mesh[i].visible = event.checked

    def axis_labels_visibility_is(self, event):
        for i in range(len(self._axis_labels)):
            self._axis_labels[i].visible = event.checked


class RoesslerAttractor:
    def __init__(self, x_vs_t, y_vs_t, z_vs_t, x_vs_y, poincare, max_dist, a=.2, b=0.2, c=5.7):
        self._a = a
        self._b = b
        self._c = c
        self._x_versus_t = gcurve(color=color.red, graph=x_vs_t)
        self._y_versus_t = gcurve(color=color.green, graph=y_vs_t)
        self._z_versus_t = gcurve(color=color.blue, graph=z_vs_t)
        self._x_versus_y = gcurve(color=color.orange, graph=x_vs_y)
        self._poincare = gcurve(color=color.yellow, graph=poincare)
        self._max_distance = max_dist
        self._line = None
        self._dots = []

    def _roessler(self, t, y):
        x_dot = -y[1 ] -y[2]
        y_dot = y[0] + self._a * y[1]  #
        z_dot = self._b + y[0] * y[2] - self._c * y[2]
        return [x_dot, y_dot, z_dot]


    def runge_kutta_4(self, t, step, y, dimension):
        f_dot = self._roessler(t, y)  # function returns rhs
        k1 = [step * f_dot[i] for i in range(dimension)]

        value = [y[i] + k1[i] * .5 for i in range(dimension)]
        f_dot = self._roessler(t + step * .5, value)
        k2 = [step * f_dot[i] for i in range(dimension)]

        value = [y[i] + k2[i] *.5 for i in range(dimension)]
        f_dot = self._roessler(t + step * .5, value)
        k3 = [step * f_dot[i] for i in range(0, dimension)]

        value = [y[i] + k3[i] *.5 for i in range(dimension)]
        f_dot = self._roessler(t + step, value)
        k4 = [step * f_dot[i] for i in range(dimension)]

        return [y[i] + (k1[i] + 2. * (k2[i] + k3[i]) + k4[i]) / 6. for i in range(dimension)]

    def _color(self, skip, dist):
        hue = dist / self._max_distance if skip > 100 else 0
        return color.hsv_to_rgb(vec(hue, 1, 1))

    def generate(self, dt=0.01):
        old_pos = [10, -2, 0.2]
        self._roessler(0, old_pos)

        skip = max_distance = dist = 0
        self._line = curve(pos=vec(old_pos[0], old_pos[1], old_pos[2]), color=self._color(skip, dist), radius=.2, visible=False)
        for t in arange(0, 200, dt):
            xx, yy, zz = self.runge_kutta_4(t, dt, old_pos, 3)  # call runge kutta
            new_pos = vec(xx, yy, zz)
            self._dots.append(simple_sphere(pos=new_pos, color=self._color(skip, dist), radius=0.25, visible=False))
            self._line.append(pos=new_pos, color=self._color(skip, dist))
            self._x_versus_t.plot(t, xx)
            self._y_versus_t.plot(t, yy)
            self._z_versus_t.plot(t, zz)
            self._x_versus_y.plot(xx, yy)
            xd = -yy - zz
            if -0.1 < xd < 0.1:  # for Poincare map
                self._poincare.plot(xx, yy)
                # xexp.append(xx)  # to plot xk+1 vs xk
                # xexm.append(old_pos[0])
            dist = (vec(xx, yy, zz) - vec(old_pos[0], old_pos[1], old_pos[2])).mag
            if dist > max_distance: max_distance = dist
            old_pos = [xx, yy, zz]
            skip += 1

    def hide_lines(self):
        self._line.visible = False

    def hide_dots(self):
        for dot_ in self._dots:
            dot_.visible = False

    def show_lines(self):
        self._line.visible = True

    def show_dots(self):
        for dot_ in self._dots:
            dot_.visible = True


x_vs_t = graph(title="x versus t", background=color.black, height=300, width=600, xtitle="t", ytitle="x")
y_vs_t = graph(title="y versus t", background=color.black, height=300, width=600, xtitle="t", ytitle="y")
z_vs_t = graph(title="z versus t", background=color.black, height=300, width=600, xtitle="t", ytitle="z")
x_vs_y = graph(title="x versus y", background=color.black, height=300, width=600, xtitle="x", ytitle="y")
poincare = graph(title="Poincare section", background=color.black, height=300, width=600, xtitle="x", ytitle="y")

#roessler = RoesslerAttractor(x_vs_t, y_vs_t, z_vs_t, x_vs_y, poincare, max_dist=1.26154)
#roessler.generate()
#roessler.show_lines()

roessler_funnel = RoesslerAttractor(x_vs_t, y_vs_t, z_vs_t, x_vs_y, poincare, a = 0.343,b = 1.82, c = 9.75, max_dist= 3.703559453644148)

def toggle_line_type(event):
    if event.name == "dots":
        roessler_funnel.show_dots()
        roessler_funnel.hide_lines()
        radio_1.checked = False
    if event.name == "lines":
        roessler_funnel.show_lines()
        roessler_funnel.hide_dots()
        radio_2.checked = False

display.append_to_caption("\n")
radio_1 = radio(text="Lines ", checked=True, name="lines", bind=toggle_line_type)
radio_2 = radio(text="Dots ", checked=False, name="dots", bind=toggle_line_type)
display.append_to_caption("\n\n")

axis = Base(arange(-20, 20, 1), arange(0, 40, 1), arange(-20, 20, 1), color.yellow, color.green, 10)
_ = checkbox(text='Mesh ', bind=axis.mesh_visibility_is, checked=True)
_ = checkbox(text='Axis labels ', bind=axis.axis_labels_visibility_is, checked=True)
_ = checkbox(text='Tick marks ', bind=axis.tick_marks_visibility_is, checked=True)
display.append_to_caption("\n\n")

# display.append_to_caption("\n\n")
# radio_3 = radio(text="a, b, c = 10, 28, 8/3 ", checked=True, name="1", bind=toggle_a_b_c)
# display.append_to_caption("\n\n")
# radio_4 = radio(text="a, b, c = 28, 46.92, 4", checked=False, name="2", bind=toggle_a_b_c)


#################################
# COMMENT OUT IN LOCAL VPYTHON  #
# MathJax.Hub.Queue(["Typeset", MathJax.Hub])
roessler_funnel.generate()
roessler_funnel.show_lines()
while True:
    rate(10)
