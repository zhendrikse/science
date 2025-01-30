# Web VPython 3.2

from vpython import *

#####################################
# COMMENT OUT THIS CLASS IN VPYTHON #
#####################################
# https://github.com/nicolaspanel/numjs
get_library('https://cdn.jsdelivr.net/gh/nicolaspanel/numjs@0.15.1/dist/numjs.min.js')
# get_library("https://cdnjs.cloudflare.com/ajax/libs/mathjs/14.0.1/math.js")
class Numpy:
    def __init__(self):
        self.array = self._array
        self.linspace = self._linspace
        self.meshgrid = self._meshgrid

    def _array(self, an_array):
        return nj.array(an_array)

    def _linspace(self, start, stop, num):
        return self._array([x for x in arange(start, stop, (stop - start) / (num - 1))] + [stop])

    def _meshgrid(self, linspace_1, linspace_2):
        xx = nj.stack([linspace_1 for _ in range(linspace_1.shape)])
        temp = []
        for i in range(linspace_2.shape[0]):
            for j in range(linspace_2.shape[0]):
                temp.append(linspace_2.get(i))
        yy = nj.array(temp).reshape(linspace_2.shape[0], linspace_2.shape[0])
        return xx, yy

np = Numpy()
#############
# TILL HERE #
#############


ricker_title = "<h3><a href=\"https://en.wikipedia.org/wiki/Ricker_wavelet\">Ricker / Mexican hat / Marr wavelet</a></h3>&nbsp;&nbsp;$F(x,y) = \\dfrac{1}{\pi\sigma^4} \\bigg(1 - \dfrac{1}{2} \\bigg( \dfrac{x^2 + y^2}{\sigma^2} \\bigg) \\bigg) e^{-\\dfrac{x^2+y^2}{2\sigma^2}}$"
sine_cosine_title = "<h3>$F(x, y) = \\sin(\\pi x)\\cos(\\pi y)$</h3>"
sine_sqrt_title = "<h3>$F(x, y) = \\sqrt{x^2+y^2}$</h3>"
polynomial_title = "<h3>$F(x, y) =  (yx^3 - xy^3)$</h3>"
cosine_of_abs_title = "<h3>$F(x, y) = \\cos(|x| + |y|)$</h3>"
ripple_title = "<h3>$F(x, y) =  \\sin\\big(3 (x^2 + y^2)\\big)$</h3>"
exponential_title = "<h3>$F(x, y) = \\sin(x^2 + y^2) e^{ -x^2 - y^2}$</h3>"
mexican_hat_title = "<h3>Polar coordinates for Mexican hat</h3>$\\begin{pmatrix}x \\\\ y \\\\ z\\end{pmatrix}=\\begin{pmatrix} r\\cos(\\phi) \\\\ r\\sin(\\phi)) \\\\ z (r^2 - 1)^2 \\end{pmatrix}$"

animation = canvas(height=500, align="top", center=vec(0, -10, 0), background=color.gray(0.075),
                   forward=vec(-0.9, -0.85, -.8), title=sine_sqrt_title + "\n", range=75)


class NumpyWrapper:
    def __init__(self, start_1, stop_1, start_2, stop_2, resolution):
        self._resolution = resolution
        x = np.linspace(start_1, stop_1, resolution)
        y = np.linspace(start_2, stop_2, resolution)
        self._x, self._y = np.meshgrid(x, y)
        self._convert_back_to_python_arrays()

    def get_plot_data(self, f_x, f_y, f_z):
        x, y, z = [], [], []
        for i in range(len(self._x)):
            x_, y_, z_ = [], [], []
            for j in range(len(self._y[0])):
                x_ += [f_x(self._x, self._y, i, j)]
                y_ += [f_y(self._x, self._y, i, j)]
                z_ += [f_z(self._x, self._y, i, j)]
            x += [x_]
            y += [y_]
            z += [z_]

        return x, y, z

    def _convert_back_to_python_array(self, numpy_array):
        result = []
        for x in range(numpy_array.shape[0]):
            temp = []
            for y in range(numpy_array.shape[1]):
                #################################
                # REPLACE THIS IN LOCAL VPYTHON #
                # temp += [numpy_array[x, y]]   #
                temp += [numpy_array.get(x, y)]
            result += [temp]
        return result

    def _convert_back_to_python_arrays(self):
        self._x = self._convert_back_to_python_array(self._x)
        self._y = self._convert_back_to_python_array(self._y)


x_hat = vec(1, 0, 0)
y_hat = vec(0, 1, 0)
z_hat = vec(0, 0, 1)
base = [x_hat, y_hat, z_hat]


class Base:
    def __init__(self, xx, yy, zz, axis_color, tick_marks_color, num_tick_marks):
        base_ = [[x for x in arange(0, len(xx), len(xx) / num_tick_marks)] + [len(xx)],
                 [y for y in arange(0, len(yy[0]), len(yy[0]) / num_tick_marks)] + [len(yy[0])],
                 [z for z in arange(0, len(zz), len(zz) / num_tick_marks)] + [len(zz)]]
        scale = .01 * len(xx)
        delta_ = [len(xx) / num_tick_marks, len(yy[0]) / num_tick_marks, len(zz) / num_tick_marks]
        self._tick_marks, self._mesh, self._axis = [], [], []

        self._make_tick_marks(base_, xx, yy, zz, tick_marks_color, scale, num_tick_marks)
        self._make_mesh(base_, delta_, scale)
        self._make_axis(base_, delta_, axis_color, scale)

    def _make_axis(self, base_, delta_, axis_color, scale):
        pos = x_hat * (base_[0][-1] + 2 * delta_[0]) - vec(0, scale, -30)
        l_y = label(pos=pos, text="Y-axis", color=axis_color, box=False)
        pos = z_hat * (base_[2][-1] + 2 * delta_[2]) + y_hat * (.625 * base_[1][-1])
        l_z = label(pos=pos, text="Z-axis", color=axis_color, box=False)
        pos = x_hat * (base_[0][-1] / 2) + z_hat * (base_[2][-1] + 3 * delta_[2])
        l_x = label(pos=pos, text="X-axis", color=axis_color, box=False)
        c_x = cylinder(pos=x_hat * base_[0][0], axis=x_hat * (base_[0][-1] - base_[0][0]), color=axis_color,
                       radius=scale)
        c_y = cylinder(pos=z_hat * base_[2][0], axis=z_hat * (base_[2][-1] - base_[2][0]), color=axis_color,
                       radius=scale)
        c_z = cylinder(pos=y_hat * base_[1][0], axis=y_hat * (base_[1][-1] - base_[1][0]), color=axis_color,
                       radius=scale)
        self._axis += [c_x, c_y, c_z, l_x, l_y, l_z]

    def _make_mesh(self, base_, delta_, scale):
        range_ = [i[-1] - i[0] for i in base_]
        for j in range(len(base_[0])):
            pos_x_y = x_hat * base_[0][0] + y_hat * base_[1][0]
            pos_x_z = x_hat * base_[0][0] + z_hat * base_[2][0]
            pos_y_z = y_hat * base_[1][0] + z_hat * base_[2][0]
            # XY mesh
            self._mesh += [cylinder(pos=pos_x_y + x_hat * j * delta_[0], axis=y_hat * range_[1])]
            self._mesh += [cylinder(pos=pos_x_y + y_hat * j * delta_[1], axis=x_hat * range_[0])]
            pos = (base_[0][0] + .5 * range_[0]) * x_hat + (base_[1][0] + .5 * range_[1]) * y_hat
            self._mesh += [box(pos=pos, length=range_[0], width=scale, height=range_[1], opacity=0.1)]

            # XZ mesh
            self._mesh += [cylinder(pos=pos_x_z + x_hat * j * delta_[0], axis=z_hat * range_[2])]
            self._mesh += [cylinder(pos=pos_x_z + z_hat * j * delta_[2], axis=x_hat * range_[0])]
            pos = (base_[0][0] + .5 * range_[0]) * x_hat + (base_[2][0] + .5 * range_[2]) * z_hat
            self._mesh += [box(pos=pos, length=range_[0], width=range_[2], height=scale, opacity=0.1)]

            # YZ mesh
            self._mesh += [cylinder(pos=pos_y_z + y_hat * j * delta_[1], axis=z_hat * range_[2])]
            self._mesh += [cylinder(pos=pos_y_z + z_hat * j * delta_[2], axis=y_hat * range_[1])]
            pos = (base_[1][0] + .5 * range_[1]) * y_hat + (base_[2][0] + .5 * range_[2]) * z_hat
            self._mesh += [box(pos=pos, length=scale, width=range_[2], height=range_[1], opacity=0.1)]

        for item_ in self._mesh:
            item_.color = color.gray(.5)
            item_.radius = scale * .5
            item_.visible = False

    def _make_tick_marks(self, base_, xx, yy, zz, tick_marks_color, scale, num_tick_marks):
        x_min, x_max = min(map(min, xx)), max(map(max, xx))
        increment = (x_max - x_min) / num_tick_marks
        for i in range(1, len(base_[2]), 2):
            label_text = '{:1.2f}'.format(x_min + i * increment, 2)
            pos = z_hat * base_[2][i] + x_hat * (base_[0][-1] + 5 * scale)
            x_label = label(pos=pos, text=label_text, color=tick_marks_color, box=False)
            self._tick_marks.append(x_label)

        y_min, y_max = min(map(min, yy)), max(map(max, yy))
        increment = (y_max - y_min) / num_tick_marks
        for i in range(0, len(base_[0]), 2):
            label_text = '{:1.2f}'.format(y_min + i * increment, 2)
            pos = x_hat * base_[0][i] + z_hat * (base_[2][-1] + 5 * scale)
            y_label = label(pos=pos, text=label_text, color=tick_marks_color, box=False)
            self._tick_marks.append(y_label)

        z_min, z_max = min(map(min, zz)), max(map(max, zz))
        increment = (z_max - z_min) / num_tick_marks
        for i in range(1, len(base_[1]), 2):
            label_text = '{:1.2f}'.format(z_min + i * increment, 2)
            pos = y_hat * base_[1][i] + z_hat * (base_[2][-1] + 5 * scale)
            z_label = label(pos=pos, text=label_text, color=tick_marks_color, box=False)
            self._tick_marks.append(z_label)

    def tick_marks_visibility_is(self, visible):
        for tick_mark in self._tick_marks:
            tick_mark.visible = visible

    def mesh_visibility_is(self, visible):
        for i in range(len(self._mesh)):
            self._mesh[i].visible = visible

    def axis_visibility_is(self, visible):
        for i in range(len(self._axis)):
            self._axis[i].visible = visible


# This class is only meant to be used from within the Figure class.
class SubPlot:
    def __init__(self, xx, yy, zz):
        self._xx, self._yy, self._zz = xx, yy, zz
        self._hue_offset = .8
        self._opacity = 1
        self._shininess = 0.6
        self._hue_gradient = .5
        self._omega = pi / 2
        self._vertices, self._quads = [], []
        self._create_vertices()
        self._create_quads()

    def hide_plot(self):
        for quad_ in self._quads:
            quad_.visible = False
        for vertex_ in self._vertices:
            vertex_.visible = False

    def _create_vertices(self):
        x_min, x_max = min(map(min, self._xx)), max(map(max, self._xx))
        y_min, y_max = min(map(min, self._yy)), max(map(max, self._yy))
        range_x = x_max - x_min
        range_y = y_max - y_min

        for x in range(len(self._xx)):
            for y in range(len(self._yy[1])):
                x_ = (self._xx[x][y] - x_min) * len(self._xx) / range_x
                y_ = (self._yy[x][y] - y_min) * len(self._yy[0]) / range_y
                self._vertices.append(vertex(pos=vec(x_, 0, y_), normal=vec(0, 1, 0)))

    def _create_quad(self, x, y):
        _neighbor_increment_x, _neighbor_increment_y = 1, 1
        if x == (len(self._xx) - 1):
            _neighbor_increment_x = -x
        if y == (len(self._yy[0]) - 1):
            _neighbor_increment_y = -y

        v0 = self._get_vertex(x, y)
        v1 = self._get_vertex(x + _neighbor_increment_x, y)
        v2 = self._get_vertex(x + _neighbor_increment_x, y + _neighbor_increment_y)
        v3 = self._get_vertex(x, y + _neighbor_increment_y)
        self._quads.append(quad(vs=[v0, v1, v2, v3]))

    # Create the quad objects, based on the vertex objects already created.
    #
    # When removing the "-1", opposite ends will be glued together
    #
    def _create_quads(self):
        for x in range(len(self._xx) - 2):
            for y in range(len(self._yy[0]) - 2):
                self._create_quad(x, y)

    def _set_vertex_normal_for(self, x, y):
        _neighbor_increment_x, _neighbor_increment_y = 1, 1
        if x == (len(self._xx) - 1):
            _neighbor_increment_x = -x
        if y == (len(self._yy[0]) - 1):
            _neighbor_increment_y = -y
        vertex_ = self._get_vertex(x, y)
        #        normal_total_ = self._get_vertex(x, y + _neighbor_increment_y).normal
        #        normal_total_ += self._get_vertex(x + _neighbor_increment_x, y).normal
        vec_1 = self._get_vertex(x, y + _neighbor_increment_y).pos - vertex_.pos
        vec_2 = self._get_vertex(x + _neighbor_increment_x, y).pos - vertex_.pos
        """
        Further work to focus on this area of the normal calculations
        """
        vertex_.normal = cross(vec_1, vec_2)

    #        normal_total_ += cross(vec_1, vec_2)
    #        vertex_.normal = normal_total_/2

    # Set the normal for each vertex to be perpendicular to the lower left corner of the quad.
    # The vectors a and b point to the right and up around a vertex in the xy plane.
    def _make_normals(self):
        for x in range(len(self._xx) - 2):
            for y in range(len(self._yy[0]) - 2):
                self._set_vertex_normal_for(x, y)

    def _update_vertex(self, x, y, value):
        hue = 1 / len(self._zz) * self._hue_gradient * abs(value) + self._hue_offset
        vertex_ = self._get_vertex(x, y)
        vertex_.pos.y = value
        vertex_.color = color.hsv_to_rgb(vec(hue, 1, 1))
        vertex_.opacity = self._opacity
        vertex_.shininess = self._shininess

    def _update_vertices(self, t):
        z_min, z_max = min(map(min, self._zz)), max(map(max, self._zz))
        range_z = z_max - z_min
        for x in range(len(self._xx)):
            for y in range(len(self._yy[0])):
                f_x_y = self._zz[x][y] * (1 - cos(self._omega * t)) * .4
                value = (f_x_y - z_min) * len(self._zz) / range_z
                self._update_vertex(x, y, value)

    def _get_vertex(self, x, y):
        return self._vertices[x * len(self._yy[0]) + y]

    def render(self, t):
        self._update_vertices(t)
        self._make_normals()

    def set_omega_to(self, omega):
        self._omega = omega

    def set_hue_offset_to(self, offset):
        self._hue_offset = offset

    def set_hue_gradient_to(self, gradient):
        self._hue_gradient = gradient

    def set_opacity_to(self, opacity):
        self._opacity = opacity

    def set_shininess_to(self, shininess):
        self._shininess = shininess

    def get_axis_information(self):
        return self._xx, self._yy, self._zz


class Figure:
    def __init__(self, axis_color=color.yellow, tick_marks_color=vec(0.4, 0.8, 0.4), num_tick_marks=10):
        self._subplots = []
        self._hue_offset = .8
        self._hue_gradient = .5
        self._omega = pi / 2
        self._opacity = 1
        self._shininess = 0.6
        self._axis_color = axis_color
        self._tick_marks_color = tick_marks_color
        self._num_tick_marks = num_tick_marks
        self._base = None
        self._tick_marks_visible = False
        self._mesh_visible = True
        self._axis_visible = True

    def _create_base(self, xx, yy, zz):
        axis = Base(xx, yy, zz, self._axis_color, self._tick_marks_color, self._num_tick_marks)
        axis.mesh_visibility_is(self._mesh_visible)
        axis.axis_visibility_is(self._axis_visible)
        axis.tick_marks_visibility_is(self._tick_marks_visible)
        return axis

    def render(self, t):
        for subplot in self._subplots:
            subplot.render(t)

    def set_omega_to(self, omega):
        self._omega = omega
        for subplot in self._subplots:
            subplot.set_omega_to(omega)

    def set_hue_offset_to(self, offset):
        self._hue_offset = offset
        for subplot in self._subplots:
            subplot.set_hue_offset_to(offset)

    def set_hue_gradient_to(self, gradient):
        self._hue_gradient = gradient
        for subplot in self._subplots:
            subplot.set_hue_gradient_to(gradient)

    def set_opacity_to(self, opacity):
        self._opacity = opacity
        for subplot in self._subplots:
            subplot.set_opacity_to(opacity)

    def set_shininess_to(self, shininess):
        self._shininess = shininess
        for subplot in self._subplots:
            subplot.set_shininess_to(shininess)

    def tick_marks_visibility_is(self, visible):
        self._tick_marks_visible = visible
        self._base.tick_marks_visibility_is(visible)

    def mesh_visibility_is(self, visible):
        self._mesh_visible = visible
        self._base.mesh_visibility_is(visible)

    def axis_visibility_is(self, visible):
        self._axis_visible = visible
        self._base.axis_visibility_is(visible)

    def _hide_axis(self):
        self._base.tick_marks_visibility_is(False)
        self._base.mesh_visibility_is(False)
        self._base.axis_visibility_is(False)

    def reset(self):
        for subplot in self._subplots:
            subplot.hide_plot()

        self._subplots = []
        self._hide_axis()

    def add_subplot(self, x, y, z):
        subplot = SubPlot(x, y, z)
        subplot.set_omega_to(self._omega)
        subplot.set_opacity_to(self._opacity)
        subplot.set_hue_offset_to(self._hue_offset)
        subplot.set_hue_gradient_to(self._hue_gradient)
        self._subplots.append(subplot)
        if len(self._subplots) == 1:
            xx, yy, zz = subplot.get_axis_information()
            self._base = self._create_base(xx, yy, zz)


class RadioButton:
    def __init__(self, button_, function_, title_text):
        self._button = button_
        self._function = function_
        self._explanation = title_text

    def uncheck(self):
        self._button.checked = False

    def push(self):
        xx, yy, zz = self._function()
        figure.reset()
        figure.add_subplot(xx, yy, zz)
        animation.title = self._explanation + "\n\n"
        animation.range = 1.5 * len(xx)
        MathJax.Hub.Queue(["Typeset", MathJax.Hub])

    def check(self):
        self._button.checked = True

    def name(self):
        return self._button.name


class RadioButtons:
    def __init__(self):
        self._radio_buttons = []
        self._selected_button = None

    def add(self, button_, function_, title_text):
        self._radio_buttons.append(RadioButton(button_, function_, title_text))

        if (len(self._radio_buttons) % 2) == 0:
            animation.append_to_caption("\n\n")

        if (len(self._radio_buttons)) == 1:
            self._radio_buttons[0].check()
            self._selected_button = self._radio_buttons[0]

    def _uncheck_buttons_except(self, button_name):
        for button_ in self._radio_buttons:
            if button_.name() != button_name: button_.uncheck()

    def _get_button_by(self, button_name):
        for button_ in self._radio_buttons:
            if button_.name() == button_name: return button_

    def toggle(self, button_name):
        self._uncheck_buttons_except(button_name)
        self._selected_button = self._get_button_by(button_name)
        self._selected_button.push()

    def get_selected_button_name(self):
        return self._selected_button.name()


#
# Functions F(x, y) => R
#

def ricker(resolution=50):
    def f_x(xx, yy, i, j):
        return xx[i][j]

    def f_y(xx, yy, i, j):
        return yy[i][j]

    sigma = .7
    sigma_2 = sigma * sigma
    factor = 1 / (pi * sigma_2 * sigma_2)

    def f_z(xx, yy, i, j):
        x_2_plus_y_2 = yy[i][j] * yy[i][j] + xx[i][j] * xx[i][j]
        return factor * (1 - 2 * x_2_plus_y_2 / sigma_2) * exp(-2 * x_2_plus_y_2 / sigma_2)

    return NumpyWrapper(-1.25, 1.25, -1.25, 1.25, resolution).get_plot_data(f_x, f_y, f_z)


def mexican_hat(resolution=50):
    def f_x(xx, yy, i, j):
        return xx[i][j] * cos(yy[i][j])

    def f_y(xx, yy, i, j):
        return xx[i][j] * sin(yy[i][j])

    def f_z(xx, yy, i, j):
        return (xx[i][j] * xx[i][j] - 1) * (xx[i][j] * xx[i][j] - 1)

    return NumpyWrapper(0, 1.25, -pi, pi * 1.05, resolution).get_plot_data(f_x, f_y, f_z)


def exp_sine(resolution=100):
    def f_x(xx, yy, i, j):
        return xx[i][j]

    def f_y(xx, yy, i, j):
        return yy[i][j]

    def f_z(xx, yy, i, j):
        x_2_plus_y_2 = yy[i][j] * yy[i][j] + xx[i][j] * xx[i][j]
        return sin(x_2_plus_y_2) * exp(-x_2_plus_y_2)

    return NumpyWrapper(-pi, pi, -pi, pi, resolution).get_plot_data(f_x, f_y, f_z)


def sin_sqrt(resolution=50):
    def f_x(xx, yy, i, j):
        return xx[i][j]

    def f_y(xx, yy, i, j):
        return yy[i][j]

    def f_z(xx, yy, i, j):
        return sin(sqrt(yy[i][j] * yy[i][j] + xx[i][j] * xx[i][j]))

    return NumpyWrapper(-2 * pi, 2 * pi, -2 * pi, 2 * pi, resolution).get_plot_data(f_x, f_y, f_z)


def sine_cosine(resolution=50):
    def f_x(x, yy, i, j):
        return x[i][j]

    def f_y(xx, yy, i, j):
        return yy[i][j]

    def f_z(xx, yy, i, j):
        return sin(xx[i][j] * pi) * cos(yy[i][j] * pi)

    return NumpyWrapper(-2 * pi / 3, 2 * pi / 3, -2 * pi / 3, 2 * pi / 3, resolution).get_plot_data(f_x, f_y, f_z)


def cosine_of_abs(resolution=75):
    def f_x(x, yy, i, j):
        return x[i][j]

    def f_y(xx, yy, i, j):
        return yy[i][j]

    def f_z(xx, yy, i, j):
        return cos(abs(xx[i][j]) + abs(yy[i][j]))

    return NumpyWrapper(-2 * pi, 2 * pi, -2 * pi, 2 * pi, resolution).get_plot_data(f_x, f_y, f_z)


def polynomial(resolution=50):
    def f_x(x, yy, i, j):
        return x[i][j]

    def f_y(xx, yy, i, j):
        return yy[i][j]

    def f_z(xx, yy, i, j):
        return xx[i][j] * xx[i][j] * xx[i][j] * yy[i][j] - yy[i][j] * yy[i][j] * yy[i][j] * xx[i][j]

    return NumpyWrapper(-1.75, 1.75, -1.75, 1.75, resolution).get_plot_data(f_x, f_y, f_z)


def ripple(resolution=100):
    def f_x(x, yy, i, j):
        return x[i][j]

    def f_y(xx, yy, i, j):
        return yy[i][j]

    def f_z(xx, yy, i, j):
        return sin(.75 * xx[i][j] * xx[i][j] + yy[i][j] * yy[i][j])

    return NumpyWrapper(-4 * pi / 3, 4 * pi / 3, -4 * pi / 3, 4 * pi / 3, resolution).get_plot_data(f_x, f_y, f_z)


#
# GUI controls
#
def adjust_opacity():
    figure.set_opacity_to(opacity_slider.value)


def adjust_shininess():
    figure.set_shininess_to(shininess_slider.value)


def adjust_omega():
    figure.set_omega_to(omega_slider.value)
    omega_slider_text.text = "= {:1.2f}".format(omega_slider.value / pi, 2) + " π"


def adjust_gradient():
    figure.set_hue_gradient_to(gradient_slider.value)


def adjust_offset():
    figure.set_hue_offset_to(offset_slider.value)


def toggle_tick_marks(event):
    figure.tick_marks_visibility_is(event.checked)


def toggle_axis(event):
    figure.axis_visibility_is(event.checked)


def toggle_mesh(event):
    figure.mesh_visibility_is(event.checked)


def toggle_animate(event):
    global dt
    dt = 0.01 if event.checked else 0


def toggle(event):
    radio_buttons.toggle(event.name)


animation.append_to_caption("\n")
_ = checkbox(text='Show mesh ', bind=toggle_mesh, checked=True)
_ = checkbox(text='Show axis ', bind=toggle_axis, checked=True)
_ = checkbox(text='Show tick marks ', bind=toggle_tick_marks, checked=False)
_ = checkbox(text='Animate ', bind=toggle_animate, checked=False)

animation.append_to_caption("\n\nHue offset  ")
offset_slider = slider(min=0, max=1, value=.8, bind=adjust_offset)

animation.append_to_caption("\n\nHue gradient  ")
gradient_slider = slider(min=0, max=1, value=.5, bind=adjust_gradient)

animation.append_to_caption("\n\nAnimation speed ")
omega_slider = slider(min=0, max=2 * pi, value=pi / 2, bind=adjust_omega)
omega_slider_text = wtext(text="= π/2")

animation.append_to_caption("\n\nOpacity ")
opacity_slider = slider(min=0, max=1, step=0.01, value=1, bind=adjust_opacity)

animation.append_to_caption("\n\nShininess ")
shininess_slider = slider(min=0, max=1, step=0.01, value=0.6, bind=adjust_shininess)

animation.append_to_caption("\n\n")

radio_buttons = RadioButtons()
radio_buttons.add(radio(bind=toggle, text=" F=sin(sqrt(x*x + y*y)) ", name="sin_sqrt"), sin_sqrt, sine_sqrt_title)
radio_buttons.add(radio(bind=toggle, text=" F=sin(x) * cos(y) ", name="sine_cosine"), sine_cosine, sine_cosine_title)
radio_buttons.add(radio(bind=toggle, text=" F=x*x*x*y - y*y*y*x ", name="polynomial"), polynomial, polynomial_title)
radio_buttons.add(radio(bind=toggle, text=" F=cos(abs(x) + abs(y) ", name="abs_cosine"), cosine_of_abs,
                  cosine_of_abs_title)
radio_buttons.add(radio(bind=toggle, text=" F=sin(x*x + y*y) ", name="the_ripple"), ripple, ripple_title)
radio_buttons.add(radio(bind=toggle, text=" F=(x*x+y*y)exp(sin(-x*x-y*y)) ", name="exp_sine"), exp_sine,
                  exponential_title)
radio_buttons.add(radio(bind=toggle, text=" Ricker wavelet ", name="ricker"), ricker, ricker_title)
radio_buttons.add(radio(bind=toggle, text=" Mexican hat ", name="mexican_hat"), mexican_hat, mexican_hat_title)
MathJax.Hub.Queue(["Typeset", MathJax.Hub])

# Results in Arc shape
# def f_x(theta, phi, i, j):
#     return cos(theta[i][j])
#
# def f_y(theta, phi, i, j):
#     return sin(theta[i][j]) + cos(phi[i][j])
#


figure = Figure()
xx_, yy_, zz_ = sin_sqrt(50)
figure.add_subplot(xx_, yy_, zz_)

dt = 0.0
time = 1
while True:
    rate(10)
    figure.render(time)
    time += dt
