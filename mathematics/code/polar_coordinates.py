# Web VPython 3.2

title = """
&#x2022; Written by <a href="https://www.hendrikse.name/">Zeger Hendrikse</a> 

"""

from vpython import cylinder, box, text, checkbox, pi, arange, sphere, vec, arrow, color, sin, cos, ring, curve, cross, label, canvas, norm, slider, radians, rate, get_library

animation = canvas(forward=vec(0.37, -0.55, -0.75), background=color.gray(0.14), title=title)

theta = 45
phi = 45
radius = 4

# https://github.com/nicolaspanel/numjs
get_library('https://cdn.jsdelivr.net/gh/nicolaspanel/numjs@0.15.1/dist/numjs.min.js')

class Numpy:
    def __init__(self):
        self.array = self._array
        self.linspace = self._linspace
        self.len = self._len

    def _array(self, an_array):
        return nj.array(an_array)

    def _linspace(self, start, stop, num):
        return self._array([x for x in arange(start, stop, (stop - start) / (num - 1))] + [stop])

    def _len(self, numpy_array): return numpy_array.shape[0]


np = Numpy()

x_hat = vec(1, 0, 0)
y_hat = vec(0, 1, 0)
z_hat = vec(0, 0, 1)
label_text = ("x", "y", "z")

class Space:
    def __init__(self, linspace_x, linspace_y, linspace_z):
        self.linspace_x = linspace_x
        self.linspace_y = linspace_y
        self.linspace_z = linspace_z


class Base:
    def __init__(self, space, position=vec(0, 0, 0), axis_color=color.yellow, tick_marks_color=color.red, axis_labels=label_text):
        x_ = space.linspace_x
        y_ = space.linspace_y
        z_ = space.linspace_z
        scale = .01 * (x_.get(-1) - x_.get(0))
        delta_x = x_.get(1) - x_.get(0)
        delta_y = y_.get(1) - y_.get(0)
        delta_z = z_.get(1) - z_.get(0)
        range_x = x_.get(-1) - x_.get(0)
        range_y = y_.get(-1) - y_.get(0)
        range_z = z_.get(-1) - z_.get(0)
        self._axis = self._make_axis(x_, y_, z_, delta_x, delta_y, delta_z, axis_color, axis_labels, scale)
        self._tick_marks = self._make_tick_marks(x_, y_, z_, tick_marks_color, scale)

        self._xy_mesh, self._xz_mesh, self._yz_mesh = [], [], []
        for j in range(np.len(x_)):
            pos_x_y = x_hat * x_.get(0) + y_hat * y_.get(0)
            pos_x_z = x_hat * x_.get(0) + z_hat * z_.get(0)
            pos_y_z = y_hat * y_.get(0) + z_hat * z_.get(0)
            self._xy_mesh += [cylinder(pos=position + pos_x_y + x_hat * j * delta_x, axis=y_hat * range_y, color=color.gray(.5), radius=scale*.5, visible=False)]
            self._xy_mesh += [cylinder(pos=position + pos_x_y + y_hat * j * delta_y, axis=x_hat * range_x, color=color.gray(.5), radius=scale*.5, visible=False)]
            pos = position + (x_.get(0)  + .5 * range_x) * x_hat + (y_.get(0)  + .5 * range_y) * y_hat
            self._xy_mesh += [box(pos=pos, length=range_x, width=scale, height=range_y, opacity=0.15, visible=False)]
            self._xz_mesh += [cylinder(pos=position + pos_x_z + x_hat * j * delta_x, axis=z_hat * range_z, color=color.gray(.5), radius=scale*.5, visible=False)]
            self._xz_mesh += [cylinder(pos=position + pos_x_z + z_hat * j * delta_z, axis=x_hat * range_x, color=color.gray(.5), radius=scale*.5, visible=False)]
            pos = position + (x_.get(0)  + .5 * range_x) * x_hat + (z_.get(0)  + .5 * range_z) * z_hat
            self._xz_mesh += [box(pos=pos, length=range_x, width=range_z, height=scale, opacity=0.15, visible=False)]
            self._yz_mesh += [cylinder(pos=position + pos_y_z + y_hat * j * delta_y, axis=z_hat * range_z, color=color.gray(.5), radius=scale*.5, visible=False)]
            self._yz_mesh += [cylinder(pos=position + pos_y_z + z_hat * j * delta_z, axis=y_hat * range_y, color=color.gray(.5), radius=scale*.5, visible=False)]
            pos = position + (y_.get(0)  + .5 * range_y) * y_hat + (z_.get(0)  + .5 * range_z) * z_hat
            self._yz_mesh += [box(pos=pos, length=scale, width=range_z, height=range_y, opacity=0.15, visible=False)]
    
    def _make_axis(self, x_, y_, z_, delta_x, delta_y, delta_z, axis_color, axis_labels, scale):
        c1 = cylinder(pos=x_hat * x_.get(0), axis=x_hat * (x_.get(-1) - x_.get(0)), color=axis_color, radius=scale)
        c2 = cylinder(pos=y_hat * y_.get(0), axis=y_hat * (y_.get(-1) - y_.get(0)), color=axis_color, radius=scale)
        c3 = cylinder(pos=z_hat * z_.get(0), axis=z_hat * (z_.get(-1) - z_.get(0)), color=axis_color, radius=scale)
        a1 = arrow(pos=x_hat * x_.get(-1), color=axis_color, shaftwidth=scale*2, axis=2 * delta_x * x_hat, round=True)
        a2 = arrow(pos=y_hat * y_.get(-1), color=axis_color, shaftwidth=scale*2, axis=2 * delta_y * y_hat, round=True)
        a3 = arrow(pos=z_hat * z_.get(-1), color=axis_color, shaftwidth=scale*2, axis=2 * delta_z * z_hat, round=True)
        l1 = text(pos=x_hat * (x_.get(-1) + 2 * delta_x) - vec(0, scale, 0), text=axis_labels[0],
                  color=axis_color, height=scale*7, billboard=True, emissive=True)
        l2 = text(pos=y_hat * (y_.get(-1) + 2 * delta_y) - vec(0, scale, 0), text=axis_labels[1],
                  color=axis_color, height=scale*7, billboard=True, emissive=True)
        l3 = text(pos=z_hat * (z_.get(-1) + 2 * delta_z) - vec(0, scale, 0), text=axis_labels[2],
                  color=axis_color, height=scale*7, billboard=True, emissive=True)
        return [c1, c2, c3, a1, a2, a3, l1, l2, l3]

    def _make_tick_marks(self, x_dim, y_dim, z_dim, tick_marks_color, scale):
        tick_marks = []
        for i in range(np.len(x_dim)):
            a_box = box(pos=x_hat * x_dim.get(i), width=scale*2, height=scale*5, length=scale*2, color=tick_marks_color)
            tick_marks.append(a_box)
        for i in range(np.len(z_dim)):
            a_box = box(pos=z_hat * z_dim.get(i), width=scale*2, height=scale*5, length=scale*2, color=tick_marks_color)
            tick_marks.append(a_box)
        for i in range(np.len(y_dim)):
            a_box = box(pos=y_hat * y_dim.get(i), width=scale*2, height=scale*5, length=scale*2, color=tick_marks_color)
            a_box.rotate(angle=0.5 * pi, axis=vec(0, 0, 1))
            tick_marks.append(a_box)
        return tick_marks
        
    def axis_visiblility_is(self, visible):
        for i in range(len(self._axis)):
            self._axis[i].visible = visible

    def tick_marks_visiblility_is(self, visible):
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



def to_cartesian(r_, phi_, theta_):
    return vec(r_ * sin(radians(theta_)) * cos(radians(phi_)), r_ * sin(radians(theta_)) * sin(radians(phi_)), r_ * cos(radians(theta_)))


def toggle_tick_marks(event):
    axis.tick_marks_visiblility_is(event.checked)

def toggle_xz_mesh(event):
    axis.xz_mesh_visibility_is(event.checked)

def toggle_xy_mesh(event):
    axis.xy_mesh_visibility_is(event.checked)

def toggle_yz_mesh(event):
    axis.yz_mesh_visibility_is(event.checked)

def toggle_axis(event):
    axis.axis_visiblility_is(event.checked)

animation.append_to_caption("\n")
_ = checkbox(text = 'Tick marks', bind = toggle_tick_marks, checked=True)
_ = checkbox(text = 'YZ mesh', bind = toggle_yz_mesh, checked=False)
_ = checkbox(text = 'XZ mesh', bind = toggle_xz_mesh, checked=True)
_ = checkbox(text = 'XY mesh', bind = toggle_xy_mesh, checked=False)
_ = checkbox(text = 'Axis', bind = toggle_axis, checked=True)


space = Space(np.linspace(-5, 5, 11), np.linspace(-5, 5, 11), np.linspace(-5, 5, 11))
axis = Base(space)
axis.xz_mesh_visibility_is(True)


dome = sphere(radius=radius, opacity=0.5, color=color.orange)
intersection = ring(radius=radius, color=color.gray(0.5), axis=y_hat, thickness=1/(radius * 5))

point_on_sphere = to_cartesian(radius, phi, theta)
radial_arrow = arrow(pos=point_on_sphere, axis=norm(point_on_sphere), color=color.green)
radial_axis = curve(pos=[vec(0, 0, 0), point_on_sphere], color=color.green)
theta_arrow = arrow(pos=point_on_sphere, axis=norm(point_on_sphere - y_hat * radius), color=color.red)
phi_arrow = arrow(pos=point_on_sphere, axis=cross(theta_arrow.axis, radial_arrow.axis), color=color.cyan)
radial_label = text(pos=to_cartesian(radius * .5, phi, theta), text="r", height=radius / 5, color=color.green)

def set_tangent_vectors():
    theta_arrow.axis = norm(to_cartesian(radius, phi, theta) - y_hat * radius)
    theta_arrow.pos = to_cartesian(radius, phi, theta)
    radial_arrow.axis = norm(to_cartesian(radius, phi, theta))
    radial_arrow.pos = to_cartesian(radius, phi, theta)
    radial_axis.modify(1, pos=to_cartesian(radius, phi, theta))
    phi_arrow.pos = to_cartesian(radius, phi, theta)
    phi_arrow.axis = cross(theta_arrow.axis, radial_arrow.axis)
    radial_label.pos=to_cartesian(radius * .5, phi, theta)

def set_phi():
    global phi
    phi = phi_slider.value
    set_tangent_vectors()

def set_theta():
    global theta
    theta = theta_slider.value
    set_tangent_vectors()

animation.append_to_caption("\n\nAdjust theta using the slider\n")
theta_slider = slider(bind = set_theta, value = theta, min = 0, max = 360)
animation.append_to_caption("\n\nAdjust phi using the slider\n")
phi_slider = slider(bind = set_phi, value = phi, min = 0, max = 360)


animation.append_to_caption("\n\n")


while True:
    rate(60)
