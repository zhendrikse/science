#Web VPython 3.2

from vpython import simple_sphere, canvas, curve, vec, color, sqrt, rate, arange, cylinder, label, box, pi, arrow, checkbox

title = """&#x2022; Based on <a href="https://prettymathpics.com/lorenz-attractor/">Lorenz Attractor</a> blog and code contained therein
&#x2022; Refactored and extended to <a href="https://github.com/zhendrikse/science/blob/main/mathematics/code/lorenz_attractor.py">lorenz_attractor.py</a> by <a href="https://www.hendrikse.name/">Zeger Hendrikse</a>

"""

display = canvas(range=47, title=title, width=600, height=600, background=color.gray(0.075), forward=vec(-.14, -.2, -1))

x_hat = vec(1, 0, 0)
y_hat = vec(0, 1, 0)
z_hat = vec(0, 0, 1)
label_text = ("x", "y", "z")

class Space:
    def __init__(self, linspace_x, linspace_y, linspace_z):
        self.linspace_x, self.linspace_y, self.linspace_z = linspace_x, linspace_y, linspace_z


class Base:
    def __init__(self, space, position=vec(0, 0, 0), axis_color=color.yellow, tick_marks_color=color.red, axis_labels=label_text):
        x_, y_, z_ = space.linspace_x, space.linspace_y, space.linspace_z
        self._xy_mesh, self._xz_mesh, self._yz_mesh, self._tick_marks, self._axis = [], [], [], [], []
        scale = 2e-3 * (x_[-1] - x_[0])
        delta_x, delta_y, delta_z = x_[1] - x_[0], y_[1] - y_[0], z_[1] - z_[0]
        range_x, range_y, range_z = x_[-1] - x_[0], y_[-1] - y_[0], z_[-1] - z_[0]
        self._make_axis(x_, y_, z_, delta_x, delta_y, delta_z, axis_color, axis_labels, scale)
        self._make_tick_marks(x_, y_, z_, tick_marks_color, scale)

        for j in range(len(x_)):
            pos_x_y = x_hat * x_[0] + y_hat * y_[0]
            pos_x_z = x_hat * x_[0] + z_hat * z_[0]
            pos_y_z = y_hat * y_[0] + z_hat * z_[0]
            self._xy_mesh += [cylinder(pos=position + pos_x_y + x_hat * j * delta_x, axis=y_hat * range_y, color=color.gray(.5), radius=scale * .75, visible=False)]
            self._xy_mesh += [cylinder(pos=position + pos_x_y + y_hat * j * delta_y, axis=x_hat * range_x, color=color.gray(.5), radius=scale * .75, visible=False)]
            self._xz_mesh += [cylinder(pos=position + pos_x_z + x_hat * j * delta_x, axis=z_hat * range_z, color=color.gray(.5), radius=scale * .75, visible=False)]
            self._xz_mesh += [cylinder(pos=position + pos_x_z + z_hat * j * delta_z, axis=x_hat * range_x, color=color.gray(.5), radius=scale * .75, visible=False)]
            self._yz_mesh += [cylinder(pos=position + pos_y_z + y_hat * j * delta_y, axis=z_hat * range_z, color=color.gray(.5), radius=scale * .75, visible=False)]
            self._yz_mesh += [cylinder(pos=position + pos_y_z + z_hat * j * delta_z, axis=y_hat * range_y, color=color.gray(.5), radius=scale * .75, visible=False)]

    def _make_axis(self, x_, y_, z_, delta_x, delta_y, delta_z, axis_color, axis_labels, scale):
        c1 = cylinder(pos=x_hat * x_[0], axis=x_hat * (x_[-1] - x_[0]), color=axis_color, radius=scale)
        c2 = cylinder(pos=y_hat * y_[0], axis=y_hat * (y_[-1] - y_[0]), color=axis_color, radius=scale)
        c3 = cylinder(pos=z_hat * z_[0], axis=z_hat * (z_[-1] - z_[0]), color=axis_color, radius=scale)
        a1 = arrow(pos=x_hat * x_[-1], color=axis_color, shaftwidth=scale * 2, axis=delta_x * x_hat, round=True)
        a2 = arrow(pos=y_hat * y_[-1], color=axis_color, shaftwidth=scale * 2, axis=delta_y * y_hat, round=True)
        a3 = arrow(pos=z_hat * z_[-1], color=axis_color, shaftwidth=scale * 2, axis=delta_z * z_hat, round=True)
        l1 = label(pos=x_hat * (x_[-1] + 1.5 * delta_x) - vec(0, scale, 0), text=axis_labels[0], color=axis_color, height=scale * 200, box=False)
        l2 = label(pos=y_hat * (y_[-1] + 1.5 * delta_y) - vec(0, scale, 0), text=axis_labels[1], color=axis_color, height=scale * 200, box=False)
        l3 = label(pos=z_hat * (z_[-1] + 1.5 * delta_z) - vec(0, scale, 0), text=axis_labels[2], color=axis_color, height=scale * 200, box=False)
        self._axis += [c1, c2, c3, a1, a2, a3, l1, l2, l3]

    def _make_tick_marks(self, x_dim, y_dim, z_dim, tick_marks_color, scale):
        for i in range(len(x_dim)):
            self._tick_marks.append(box(pos=x_hat * x_dim[i], width=scale * 2, height=scale * 5, length=scale * 2, color=tick_marks_color, visible=False))

        for i in range(len(z_dim)):
            self._tick_marks.append(box(pos=z_hat * z_dim[i], width=scale * 2, height=scale * 5, length=scale * 2, color=tick_marks_color, visible=False))

        for i in range(len(y_dim)):
            self._tick_marks.append(box(pos=y_hat * y_dim[i], width=scale * 2, height=scale * 5, length=scale * 2, color=tick_marks_color, visible=False))
            self._tick_marks[-1].rotate(angle=0.5 * pi, axis=vec(0, 0, 1))

    def axis_visibility_is(self, visible):
        for i in range(len(self._axis)):
            self._axis[i].visible = visible

    def tick_marks_visibility_is(self, visible):
        for tick_mark in self._tick_marks:
            tick_mark.visible = visible

    def xy_mesh_visibility_is(self, visible):
        for i in range(len(self._xy_mesh)):
            self._xy_mesh[i].visible = visible

    def xz_mesh_visibility_is(self, visible):
        for i in range(len(self._xz_mesh)):
            self._xz_mesh[i].visible = visible

    def yz_mesh_visibility_is(self, visible):
        for i in range(len(self._xz_mesh)):
            self._yz_mesh[i].visible = visible


def toggle_tick_marks(event):
    axis.tick_marks_visibility_is(event.checked)


def toggle_xz_mesh(event):
    axis.xz_mesh_visibility_is(event.checked)


def toggle_xy_mesh(event):
    axis.xy_mesh_visibility_is(event.checked)


def toggle_yz_mesh(event):
    axis.yz_mesh_visibility_is(event.checked)


def toggle_axis(event):
    axis.axis_visibility_is(event.checked)


display.append_to_caption("\n")
_ = checkbox(text='Tick marks', bind=toggle_tick_marks, checked=False)
_ = checkbox(text='YZ mesh', bind=toggle_yz_mesh, checked=False)
_ = checkbox(text='XZ mesh', bind=toggle_xz_mesh, checked=False)
_ = checkbox(text='XY mesh', bind=toggle_xy_mesh, checked=False)
_ = checkbox(text='Axis', bind=toggle_axis, checked=True)


def linspace(start, stop, num):
    return [x for x in arange(start, stop, (stop - start) / (num - 1))] + [stop]


space = Space(linspace(-30, 30, 11), linspace(-30, 30, 11), linspace(0, 50, 11))
axis = Base(space, axis_color=vec(0.8, 0.8, 0))


hue_increment = .00005  # hue increment
dmaxx = 1.90274198766  # get this from print max_distance
N = 150
h = 0.004

a, b, c = 10.0, 28.0, 8.0 / 3.0
#a, b, c = 28, 46.92, 4.

x0 = 0.1
y0 = 0.0
z0 = 0.0
H = S = V = 0
max_distance = 0
skip = 0
for i in range(N):
    line = curve(pos=vec(x0, y0, z0), color=color.hsv_to_rgb(vec(H, S, V)), radius=0.1)
    for j in range(N):
        x1 = x0 + h * a * (y0 - x0)
        y1 = y0 + h * (x0 * (b - z0) - y0)
        z1 = z0 + h * (x0 * y0 - c * z0)
        dist = sqrt((x1 - x0) * (x1 - x0) + (y1 - y0) * (y1 - y0) + (z1 - z0) * (z1 - z0))
        if dist > max_distance: max_distance = dist
        x0 = x1
        y0 = y1
        z0 = z1
        if skip > 100:
            H = dist / dmaxx
            S = V = 1
        line.append( pos=vec(x0,y0,z0), color=color.hsv_to_rgb(vec(H,S,V)))
        #simple_sphere(pos=vec(x0, y0, z0), color=color.hsv_to_rgb(vec(H, S, V)), radius=0.3)
        skip += 1

#print(max_distance)
while True:
    rate(10)
