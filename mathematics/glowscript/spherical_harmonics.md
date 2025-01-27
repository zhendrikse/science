```python
Web VPython 3.2

from vpython import *

# https://github.com/nicolaspanel/numjs
get_library('https://cdn.jsdelivr.net/gh/nicolaspanel/numjs@0.15.1/dist/numjs.min.js')
get_library("https://cdnjs.cloudflare.com/ajax/libs/mathjs/14.0.1/math.js")

p_orbitals_title = """
$\\begin{cases} \\rho &amp; = 4 \\cos^2(2\\theta)\\sin^2(\\phi) \\\\  \\theta &amp; = [0, 2\\pi] \\\\ \\phi &amp; = [0, \pi]  \\end{cases}$

"""

caption = """

&#x2022; Based on <a href="https://www.glowscript.org/#/user/GlowScriptDemos/folder/Examples/program/Plot3D">Plot3D</a>
&#x2022; Written by <a href="https://www.hendrikse.name/">Zeger Hendrikse</a> to include: 
  &#x2022; Numpy linspace and meshgrid syntax
  &#x2022; Configurable base and mesh background
  &#x2022; Non-uniform coloring

"""

animation = canvas(align="top", background=color.gray(0.14), center=vec(-8, 16, 8),
                   forward=vec(-1.0, -0.25, -.75), title=p_orbitals_title + "\n", range=140)
MathJax.Hub.Queue(["Typeset", MathJax.Hub])


class Numpy:
    def __init__(self):
        self.array = self._array
        self.linspace = self._linspace
        self.len = self._len
        self.meshgrid = self._meshgrid
        self.sqrt = self._sqrt
        self.cos = self._cos
        self.sin = self._sin
        self.exp = self._exp
        self.abs = self._abs

    def _abs(self, numpy_array): return nj.abs(numpy_array)
    def _exp(self, numpy_array): return nj.exp(numpy_array)
    def _cos(self, numpy_array): return nj.cos(numpy_array)
    def _sin(self, numpy_array): return nj.sin(numpy_array)
    def _sqrt(self, numpy_array): return nj.sqrt(numpy_array)
    def _len(self, numpy_array): return numpy_array.shape[0]
    def _array(self, an_array): return nj.array(an_array)

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

x_hat = vec(1, 0, 0)
y_hat = vec(0, 1, 0)
z_hat = vec(0, 0, 1)
base = [x_hat, y_hat, z_hat]


class Base:
    def __init__(self, xx, yy, zz, axis_color, tick_marks_color, num_tick_marks):
        base_ = [np.linspace(0, np.len(xx), num_tick_marks + 1),
                 np.linspace(0, np.len(yy), num_tick_marks + 1),
                 np.linspace(0, np.len(zz), num_tick_marks + 1)]
        scale = .01 * (base_[0].get(-1) - base_[0].get(0))
        delta_ = [i.get(1) - i.get(0) for i in base_]
        self._tick_marks, self._xy_mesh, self._xz_mesh, self._yz_mesh = [], [], [], []
        self._make_tick_marks(base_, xx, yy, zz, delta_, tick_marks_color, axis_color, scale, num_tick_marks)
        self._make_mesh(base_, delta_, scale)

    def _make_mesh(self, base_, delta_, scale):
        range_ = [i.get(-1) - i.get(0) for i in base_]
        for j in range(np.len(base_[0])):
            pos_x_y = x_hat * base_[0].get(0) + y_hat * base_[1].get(0)
            pos_x_z = x_hat * base_[0].get(0) + z_hat * base_[2].get(0)
            pos_y_z = y_hat * base_[1].get(0) + z_hat * base_[2].get(0)
            self._xy_mesh += [cylinder(pos=pos_x_y + x_hat * j * delta_[0], axis=y_hat * range_[1])]
            self._xy_mesh += [cylinder(pos=pos_x_y + y_hat * j * delta_[1], axis=x_hat * range_[0])]
            self._xz_mesh += [cylinder(pos=pos_x_z + x_hat * j * delta_[0], axis=z_hat * range_[2])]
            self._xz_mesh += [cylinder(pos=pos_x_z + z_hat * j * delta_[2], axis=x_hat * range_[0])]
            self._yz_mesh += [cylinder(pos=pos_y_z + y_hat * j * delta_[1], axis=z_hat * range_[2])]
            self._yz_mesh += [cylinder(pos=pos_y_z + z_hat * j * delta_[2], axis=y_hat * range_[1])]

            pos = (base_[1].get(0) + .5 * range_[1]) * y_hat + (base_[2].get(0) + .5 * range_[2]) * z_hat
            self._yz_mesh += [box(pos=pos, length=scale, width=range_[2], height=range_[1], opacity=0.15, visible=False)]
            pos = (base_[0].get(0) + .5 * range_[0]) * x_hat + (base_[1].get(0) + .5 * range_[1]) * y_hat
            self._xy_mesh += [box(pos=pos, length=range_[0], width=scale, height=range_[1], opacity=0.15, visible=False)]
            pos = (base_[0].get(0) + .5 * range_[0]) * x_hat + (base_[2].get(0) + .5 * range_[2]) * z_hat
            self._xz_mesh += [box(pos=pos, length=range_[0], width=range_[2], height=scale, opacity=0.15, visible=False)]

            self._set_mesh_properties(self._xy_mesh, scale)
            self._set_mesh_properties(self._xz_mesh, scale)
            self._set_mesh_properties(self._yz_mesh, scale)

    def _set_mesh_properties(self, mesh, scale):
        for item_ in mesh:
            item_.color = color.gray(.5)
            item_.radius = scale * .5
            item_.visible = False

    def _make_tick_marks(self, base_, xx, yy, zz, delta_, tick_marks_color, axis_color, scale, num_tick_marks):
        increment = (yy.get(-1, -1) - yy.get(0, 0)) / num_tick_marks
        start_value = yy.get(0, 0)
        for i in range(0, np.len(base_[0]), 2):
            label_text = str(math.round(start_value + i * increment, 2))
            pos = x_hat * base_[0].get(i) + z_hat * (base_[2].get(-1) + 7 * scale)
            a_label = text(pos=pos, text=label_text, height=5 * scale, billboard=True, color=tick_marks_color)
            self._tick_marks.append(a_label)

        increment = (xx.get(-1, -1) - xx.get(0, 0)) / num_tick_marks
        start_value = xx.get(0, 0)
        for i in range(1, np.len(base_[2]), 2):
            label_text = str(math.round(start_value + i * increment, 2))
            pos = z_hat * base_[2].get(i) + x_hat * (base_[0].get(-1) + 5 * scale)
            a_label = text(pos=pos, text=label_text, height=5 * scale, billboard=True, color=tick_marks_color)
            self._tick_marks.append(a_label)

        increment = (zz.get(-1, -1) - zz.get(0, 0)) / num_tick_marks
        start_value = zz.get(0, 0)
        for i in range(0, np.len(base_[1]), 2):
            label_text = str(math.round(start_value + i * increment, 2))
            pos = y_hat * base_[1].get(i) + z_hat * (base_[2].get(-1) + 7 * scale)
            a_label = text(pos=pos, text=label_text, height=5 * scale, billboard=True, color=tick_marks_color)
            self._tick_marks.append(a_label)

        pos = x_hat * (base_[0].get(-1) + 2 * delta_[0]) - vec(0, scale, -30)
        l1 = text(pos=pos, text="Y-axis", color=axis_color, height=scale * 4, billboard=True, emissive=True)
        pos = z_hat * (base_[2].get(-1) + 2 * delta_[2]) + y_hat * (base_[1].get(-1) / 2)
        l2 = text(pos=pos, text="Z-axis", color=axis_color, height=scale * 4, billboard=True, emissive=True)
        pos = x_hat * (base_[0].get(-1) / 2) + z_hat * (base_[2].get(-1) + 2.5 * delta_[2])
        l3 = text(pos=pos, text="X-axis", color=axis_color, height=scale * 4, billboard=True, emissive=True)
        c1 = cylinder(pos=x_hat * base_[0].get(0), axis=x_hat * (base_[0].get(-1) - base_[0].get(0)), color=axis_color, radius=scale)
        c2 = cylinder(pos=y_hat * base_[1].get(0), axis=y_hat * (base_[1].get(-1) - base_[1].get(0)), color=axis_color, radius=scale)
        c3 = cylinder(pos=z_hat * base_[2].get(0), axis=z_hat * (base_[2].get(-1) - base_[2].get(0)), color=axis_color, radius=scale)
        self._tick_marks += [c1, c2, c3, l1, l2, l3]

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


class Plot3D:
    """
    A class to make 3D plots.

    The x-axis is labeled y, the z axis is labeled x, and the y-axis is
    labeled z. This is done to mimic fairly standard practive for plotting
    the z value of a function of x and y.

    A plot is typically made like so:

    resolution = 75
    x = y = np.linspace(-2 * pi, 2 * pi, resolution)
    xx, yy = np.meshgrid(x, y)
    zz = np.cos(np.abs(xx).add(np.abs(yy)))
    Plot3D(xx, yy, zz)


    Attributes
    ----------
    xx : array
        Numpy array containing the x-values, typically generated by
        the np.meshgrid() function
    yy : array
        Numpy array containing the y-values, typically generated by
        the np.meshgrid() function
    zz : array
        Numpy array containing the function values
    z_min: float
        Optional minimum z-axis boundary
    z_max: float
        Optional maximum z-axis boundary


    Methods
    -------
    render(t):
        Render the plot with a new time.
    """

    def __init__(self, xx, yy, zz, z_min=None, z_max=None, axis_color=color.yellow, tick_marks_color=vec(0.4, 0.8, 0.4), num_tick_marks=10):
        self._xx = xx
        self._yy = yy
        self._zz = zz

        self._z_min, self._z_max = self._z_min_and_z_max(z_min, z_max)
        self._dynamic_colors = False
        self._hue = 0.5
        self._omega = pi
        self._axis_color = axis_color
        self._tick_marks_color = tick_marks_color
        self._num_tick_marks = num_tick_marks
        self._axis = self._create_base()
        self._vertices, self._quads = [], []
        self._create_vertices()
        self._create_quads()
        self._render_static()

    def reinitialize(self, xx, yy, zz, z_min=None, z_max=None):
        self._xx = xx
        self._yy = yy
        self._zz = zz

        self._z_min, self._z_max = self._z_min_and_z_max(z_min, z_max)
        self._hide_plot()  # Hide previous shizzle before creating new stuff
        self._hide_axis()  # Hide previous stizzle before creating new stuff
        self._axis = self._create_base()
        self._vertices, self._quads = [], []
        self._create_vertices()
        self._create_quads()
        self._render_static()

    def _z_min_and_z_max(self, z_min, z_max):
        # Has user has already defined the boundaries for us?
        # Otherwise, we fall back to automatic boundary creation
        if z_min and z_max:
            return z_min, z_max

        return self._zz.flatten().min(), self._zz.flatten().max()

    def _hide_axis(self):
        self._axis.tick_marks_visibility_is(False)
        self._axis.xy_mesh_visibility_is(False)
        self._axis.xz_mesh_visibility_is(False)
        self._axis.yz_mesh_visibility_is(False)

    def _hide_plot(self):
        for quad_ in self._quads:
            quad_.visible = False
        for vertex_ in self._vertices:
            vertex_.visible = False

    def _create_base(self):
        x_min, x_max, y_min, y_max = self._ranges()
        xx = np.linspace(x_min, x_max, np.len(self._xx))
        yy = np.linspace(y_min, y_max, np.len(self._yy))
        zz = np.linspace(self._z_min, self._z_max, np.len(self._zz))
        axis = Base(xx, yy, zz, self._axis_color, self._tick_marks_color, self._num_tick_marks)
        axis.xy_mesh_visibility_is(True)
        axis.xz_mesh_visibility_is(True)
        axis.yz_mesh_visibility_is(True)
        return axis
        
    def _ranges(self):
        x_min = self._xx.flatten().min()
        x_max = self._xx.flatten().max()
        y_min = self._yy.flatten().min()
        y_max = self._yy.flatten().max()
        return x_min, x_max, y_min, y_max

    def _create_vertices(self):
        x_min, x_max, y_min, y_max = self._ranges()
        range_x = x_max - x_min
        range_y = y_max - y_min

        for x in range(np.len(self._xx)): 
          for y in range(np.len(self._yy)):
            x_ = (self._xx.get(x, y) - x_min)*np.len(self._xx) / range_x
            y_ = (self._yy.get(x, y) - y_min)*np.len(self._yy) / range_y
            self._vertices.append(vertex(pos=vec(x_, 0, y_), normal=vec(0, 1, 0)))

    # Create the quad objects, based on the vertex objects already created.
    def _create_quads(self):
        for x in range(np.len(self._xx) - 2):
            for y in range(np.len(self._yy) - 2):
                v0 = self._get_vertex(x, y)
                v1 = self._get_vertex(x + 1, y)
                v2 = self._get_vertex(x + 1, y + 1)
                v3 = self._get_vertex(x, y + 1)
                self._quads.append(quad(vs=[v0, v1, v2, v3]))

    def _set_vertex_normal_for(self, x, y):
        if x == np.len(self._xx) - 1 or y == np.len(self._yy) - 1: return
        v = self._get_vertex(x, y)
        a = self._get_vertex(x, y + 1).pos - v.pos
        b = self._get_vertex(x + 1, y).pos - v.pos
        v.normal = cross(a, b)

    # Set the normal for each vertex to be perpendicular to the lower left corner of the quad.
    # The vectors a and b point to the right and up around a vertex in the xy plane.
    def _make_normals(self):
        for x in range(np.len(self._xx) - 2):
            for y in range(np.len(self._yy) - 2):
              self._set_vertex_normal_for(x, y)

    def _value_to_plot(self, x, y, range_z):
        f_x_y = self._zz.get(x, y)
        return (np.len(self._xx) / range_z) * (f_x_y - self._z_min)
        
    def _render_static(self):
        range_z = self._z_max - self._z_min
        for x in range(np.len(self._xx)): 
          for y in range(np.len(self._yy)):
            value = self._value_to_plot(x, y, range_z)
            self._get_vertex(x, y).pos.y = value
            self._get_vertex(x, y).color = color.hsv_to_rgb(vec(self._hue, self._hue, 1))

        self._make_normals()

    def _update_vertex(self, x, y, range_z, dt):
        value = self._value_to_plot(x, y, range_z)
        self._get_vertex(x, y).pos.y = value
        
        hue = abs(value)/np.len(self._zz) + self._hue
        self._get_vertex(x, y).color = color.hsv_to_rgb(vec(hue, hue, 1))
        self._hue += dt / 10000

    def render(self, dt):
        if not self._dynamic_colors: return
        range_z = self._z_max - self._z_min
        for x in range(np.len(self._xx)): 
          for y in range(np.len(self._yy)):
            self._update_vertex(x, y, range_z, dt)

        self._make_normals()
        
    def set_omega_to(self, omega):
        self._omega = omega

    def dynamic_colors_is(self, value):
        self._dynamic_colors = value

    def _get_vertex(self, x, y):
        return self._vertices[x * np.len(self._xx) + y]

    def tick_marks_visibility_is(self, visible):
        self._axis.tick_marks_visibility_is(visible)

    def xy_mesh_visibility_is(self, visible):
        self._axis.xy_mesh_visibility_is(visible)

    def xz_mesh_visibility_is(self, visible):
        self._axis.xz_mesh_visibility_is(visible)

    def yz_mesh_visibility_is(self, visible):
        self._axis.yz_mesh_visibility_is(visible)


def toggle_tick_marks(event):
    plot.tick_marks_visibility_is(event.checked)


def toggle_xz_mesh(event):
    plot.xz_mesh_visibility_is(event.checked)


def toggle_xy_mesh(event):
    plot.xy_mesh_visibility_is(event.checked)


def toggle_yz_mesh(event):
    plot.yz_mesh_visibility_is(event.checked)

def toggle_colors(event):
  plot.dynamic_colors_is(event.checked)

def p_orbitals():
    theta = np.linspace(-1.1 * pi, pi, 100)
    phi = np.linspace(0, pi, 100)
    U, V = np.meshgrid(theta, phi)
    
    R1 = np.cos(U.multiply(2)).multiply(np.cos(U.multiply(2)))
    R2 = np.sin(V).multiply(np.sin(V))
    R = R1.multiply(R2).multiply(4)
    
    X = np.sin(U).multiply(np.cos(V)).multiply(R)
    Y = np.sin(U).multiply(np.sin(V)).multiply(R)
    Z = np.cos(U).multiply(R)
    return X, Y, Z, None, None

animation.append_to_caption("\n")
_ = checkbox(text='YZ mesh ', bind=toggle_yz_mesh, checked=True)
_ = checkbox(text='XZ mesh ', bind=toggle_xy_mesh, checked=True)
_ = checkbox(text='XY mesh ', bind=toggle_xz_mesh, checked=True)
_ = checkbox(text='Tick marks ', bind=toggle_tick_marks, checked=True)
_ = checkbox(text='Dynamic colors', bind=toggle_colors, checked=False)
animation.append_to_caption(caption)

def on_key_press(key):
    if key == "b":
        animation.background = color.white if animation.background == color.black else color.black
    if key == 's':
        animation.capture("3d_complex_function_plot")
    if key == 'v':
        print("scene.center=" + str(animation.center))
        print("scene.forward=" + str(animation.forward))
        print("scene.range=" + str(animation.range))


def key_pressed(event):
    key = event.key
    on_key_press(key)

animation.bind('keydown', key_pressed)
MathJax.Hub.Queue(["Typeset", MathJax.Hub])

xx, yy, zz, z_min, z_max = p_orbitals()
plot = Plot3D(xx, yy, zz, z_min, z_max)
dt = 0.01
while True:
    rate(20)
    plot.render(dt)


```