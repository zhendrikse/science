#Web VPython 3.2

from vpython import simple_sphere, vec, color, rate, label, canvas, cylinder, vector, arange, exp, checkbox

title = """&#x2022; <a href="https://github.com/zhendrikse/science/blob/main/mathematics/code/scalar_plot.py">scalar_plot.py</a> by <a href="https://www.hendrikse.name/">Zeger Hendrikse</a>

&#x2022; Shown below is the vector field:

<h3>$f(x, y, z) = e^{-\\alpha (x^2 + y^2 + z^2)}$</h3>
"""

display = canvas(title=title, height=500, forward=vec(-2.5, -2.2, -2.2), center=vec(0, 0, -.5), up=vec(0, 0, 1), background=color.gray(0.075), range=6.0)

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

    def tick_marks_visibility_is(self, visible):
        for tick_mark in self._tick_marks:
            tick_mark.visible = visible

    def mesh_visibility_is(self, visible):
        for i in range(len(self._mesh)):
            self._mesh[i].visible = visible

    def axis_labels_visibility_is(self, visible):
        for i in range(len(self._axis_labels)):
            self._axis_labels[i].visible = visible


class Scalar:
    def __init__(self, position, radius, value):
        self._position = position
        self._value = value
        self._sphere = simple_sphere(pos=position, radius=radius, opacity=0.3)

    def set_color(self, colour):
        self._sphere.color = colour

    def value(self):
        return self._value


class ScalarField:
    def __init__(self, x_min, x_max, dx, f_x_y_z):
        locations = arange(x_min, x_max, dx)
        field_values = []
        scalar_field = []
        for x in locations:
            for y in locations:
                for z in locations:
                    position = vector(x, y, z)
                    field_value = f_x_y_z(position)
                    field_values.append(field_value)
                    scalar_field.append(Scalar(position, dx / 4, field_value))
        self._max_value = max(field_values)
        self._min_value = min(field_values)

        for scalar in scalar_field:
            scalar.set_color(self._color_for(scalar.value()))

    def _color_for(self, value):
        mid_temp = (self._max_value + self._min_value) / 2
        value_range = self._max_value - self._min_value
        red = (value - self._min_value) / value_range * 10
        blue = (self._max_value - value) / value_range * 2
        green = value / mid_temp
        return vector(red, green, blue)

    def min_value(self):
        return self._min_value

    def max_value(self):
        return self._max_value

def temperature_at(position):
    alpha = 4e-1
    temperature = exp(-alpha * position.mag * position.mag)
    # temperature = mag(position-vector(1,0,0))**-1 - mag(position-vector(-1,0,0))**-1
    return temperature

def toggle_tick_marks(event):
    plot_base.tick_marks_visibility_is(event.checked)


def toggle_axis_labels(event):
    plot_base.axis_labels_visibility_is(event.checked)


def toggle_mesh(event):
    plot_base.mesh_visibility_is(event.checked)

display.append_to_caption("\n")
_ = checkbox(text='Mesh ', bind=toggle_mesh, checked=True)
_ = checkbox(text='Axis labels ', bind=toggle_axis_labels, checked=True)
_ = checkbox(text='Tick marks ', bind=toggle_tick_marks, checked=True)

x_max = 3
field = ScalarField(-x_max, x_max, 1 * x_max / 10, temperature_at)
plot_base = Base(arange(-3, 3, 0.2), arange(-3, 3, 0.2), arange(-3, 3, 0.2), color.yellow, color.green, 10)
MathJax.Hub.Queue(["Typeset", MathJax.Hub])

while True:
    rate(10)
