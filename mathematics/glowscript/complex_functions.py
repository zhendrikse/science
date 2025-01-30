# Web VPython 3.2

from vpython import *

# https://github.com/nicolaspanel/numjs
get_library('https://cdn.jsdelivr.net/gh/nicolaspanel/numjs@0.15.1/dist/numjs.min.js')
get_library("https://cdnjs.cloudflare.com/ajax/libs/mathjs/14.0.1/math.js")

title_end = "e^{i\\omega t} \\text{, } \{z \in \\mathbb{C}\} \\text{, } \{\omega, t \in \\mathbb{R}\}$</h2>"
z_2_title = "<h2>$\\psi(z, t) = \\big(z^2 + 2\\big)" + title_end
z_abs_squared_title = "<h2>$\\psi(x,y,t) = z\\bar{z}"+ title_end
z_cubed_title = "<h2>$\\psi(z, t) = \\big(z^3 + 2\\big)" + title_end
z_plus_1_divided_by_z_min_1_title = "<h2>$\\psi(z, t) = \\bigg(\dfrac{z + 1}{z - 1} \\bigg)" + title_end
sine_z_title = "<h2>$\\psi(z,t) = \\sin{(z)}" + title_end
log_z_title = "<h2>$\\psi(z,t) = \\log{(z)}" + title_end
exp_z_title = "<h2>$\\psi(z,t) = e^{-z^2}"+ title_end
sqrt_z_title = "<h2>$\\psi(z,t) = \\sqrt{z}"+ title_end
z_plus_one_over_z_title =  "<h2>$\\psi(z,t) = \\dfrac{1}[2}\\left(z = \\dfrac{1}{z}\\right)"+ title_end

caption = """
&#x2022; Written by <a href="https://www.hendrikse.name">Zeger Hendrikse</a>
&#x2022; Inspired on <a href="https://www.glowscript.org/#/user/GlowScriptDemos/folder/Examples/program/Plot3D">Plot3D</a> by adding the following features: 
  &#x2022; Numpy linspace and meshgrid syntax
  &#x2022; Configurable base and mesh background
  &#x2022; Non-uniform coloring
  &#x2022; Complex numbers and functions

"""
animation = canvas(align="top", background=color.gray(0.14), center=vec(0, 5, 0),
                   forward=vec(-0.9, -0.5, -.8), title=z_2_title + "\n", range=75)

class Numpy:
    def __init__(self):
        self.array = self._array
        self.linspace = self._linspace
        self.len = self._len
        self.meshgrid = self._meshgrid

    def _len(self, numpy_array):
        return numpy_array.shape[0]

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
        increment = (xx.get(-1, -1) - xx.get(0, 0)) / num_tick_marks
        start_value = xx.get(0, 0)
        for i in range(1, np.len(base_[2]), 2):
            label_text = '{:1.2f}'.format(start_value + i * increment, 2)
            pos = z_hat * base_[2].get(i) + x_hat * (base_[0].get(-1) + 5 * scale)
            x_label = text(pos=pos, text=label_text, height=5 * scale, billboard=True, color=tick_marks_color)
            self._tick_marks.append(x_label)

        increment = (yy.get(-1, -1) - yy.get(0, 0)) / num_tick_marks
        start_value = yy.get(0, 0)
        for i in range(0, np.len(base_[0]), 2):
            label_text = '{:1.2f}'.format(start_value + i * increment, 2)
            pos = x_hat * base_[0].get(i) + z_hat * (base_[2].get(-1) + 15 * scale)
            y_label = text(pos=pos, text=label_text, height=5 * scale, billboard=True, color=tick_marks_color)
            self._tick_marks.append(y_label)

        increment = (zz.get(-1, -1) - zz.get(0, 0)) / num_tick_marks
        start_value = zz.get(0, 0)
        for i in range(1, np.len(base_[1]), 2):
            label_text = '{:1.2f}'.format(start_value + i * increment, 2)
            pos = y_hat * base_[1].get(i) + z_hat * (base_[2].get(-1) + 15 * scale)
            z_label = text(pos=pos, text=label_text, height=5 * scale, billboard=True, color=tick_marks_color)
            self._tick_marks.append(z_label)

        pos = x_hat * (base_[0].get(-1) + 2 * delta_[0]) - vec(0, scale, -30)
        l_y = text(pos=pos, text="Y-axis", color=axis_color, height=scale * 4, billboard=True, emissive=True)
        pos = z_hat * (base_[2].get(-1) + 2 * delta_[2]) + y_hat * (.625 * base_[1].get(-1))
        l_z = text(pos=pos, text="Z-axis", color=axis_color, height=scale * 4, billboard=True, emissive=True)
        pos = x_hat * (base_[0].get(-1) / 2) + z_hat * (base_[2].get(-1) + 3 * delta_[2])
        l_x = text(pos=pos, text="X-axis", color=axis_color, height=scale * 4, billboard=True, emissive=True)
        c_x = cylinder(pos=x_hat * base_[0].get(0), axis=x_hat * (base_[0].get(-1) - base_[0].get(0)), color=axis_color, radius=scale)
        c_y = cylinder(pos=z_hat * base_[2].get(0), axis=z_hat * (base_[2].get(-1) - base_[2].get(0)), color=axis_color, radius=scale)
        c_z = cylinder(pos=y_hat * base_[1].get(0), axis=y_hat * (base_[1].get(-1) - base_[1].get(0)), color=axis_color, radius=scale)
        self._tick_marks += [c_x, c_y, c_z, l_x, l_y, l_z]

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
    def __init__(self, xx, yy, zz, f, axis_color=color.yellow, tick_marks_color=vec(0.4, 0.8, 0.4), num_tick_marks=10):
        self._f = f
        self._xx = xx
        self._yy = yy
        self._zz = zz
        self._omega = 2 * pi
        self._axis_color = axis_color
        self._tick_marks_color = tick_marks_color
        self._num_tick_marks = num_tick_marks
        self._vertices, self._quads = [], []
        self._create_vertices()
        self._create_quads()
        self._axis = self._create_base()
        self.render(0)
        
    def reinitialize(self, xx, yy, zz, f):
        self._f = f
        self._xx = xx
        self._yy = yy
        self._zz = zz
        self._hide_plot()
        self._hide_axis()
        self._vertices, self._quads = [], []
        self._create_vertices()
        self._create_quads()
        self._axis = self._create_base()
        self.render(0)
        
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
        axis = Base(self._xx, self._yy, self._zz, self._axis_color, self._tick_marks_color, self._num_tick_marks)
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

    def _color_for(self, complex_num):
        phase = atan2(complex_num.im, complex_num.re)
        phase += 2 * pi if phase < 0 else 0
        phase /= 2 * pi
        return color.hsv_to_rgb(vec(phase, 1, 1.25))

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
        #if x == np.len(self._xx) - 1 or y == np.len(self._yy) - 1: return
        vertex_ = self._get_vertex(x, y)
        vec_1 = self._get_vertex(x, y + 1).pos - vertex_.pos
        vec_2 = self._get_vertex(x + 1, y).pos - vertex_.pos
        vertex_.normal = cross(vec_1, vec_2)

    # Set the normal for each vertex to be perpendicular to the lower left corner of the quad.
    # The vectors a and b point to the right and up around a vertex in the xy plane.
    def _make_normals(self):
        for x in range(np.len(self._xx) - 2):
            for y in range(np.len(self._yy) - 2):
              self._set_vertex_normal_for(x, y)
            
    def set_omega_to(self, omega):
        self._omega = omega

    def _update_vertex(self, x, y, t, range_z):
        f_z = self._f(math.complex(self._xx.get(x, y), self._yy.get(x, y)), self._omega * t)

        value = np.len(self._zz) / range_z * (f_z.abs() - self._zz.get(0))
        self._get_vertex(x, y).pos.y = value
        self._get_vertex(x, y).color = self._color_for(f_z)

    def render(self, t):
        z_min, z_max = self._zz.flatten().min(), self._zz.flatten().max()
        range_z = (z_max - z_min) * 1.1
        for x in range(np.len(self._xx)): 
          for y in range(np.len(self._yy)):
            self._update_vertex(x, y, t, range_z)

        self._make_normals()

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

def z_plus_one_over_z():
    xx, yy = np.meshgrid(np.linspace(-2, 2, 50), np.linspace(-2, 2, 50))
    zz = np.linspace(0, 8, 50)

    def f(z, t):
        value = math.multiply(math.complex(.5, 0), math.add(z, math.divide(math.complex(1, 0), z)))
        phase = math.complex(cos(t), sin(t))
        return math.multiply(value, phase)
        
    return xx, yy, zz, f

def z_squared():
    xx, yy = np.meshgrid(np.linspace(-2, 2, 50), np.linspace(-2, 2, 50))
    zz = np.linspace(0, 8, 50)

    def f(z, t):
        value = math.add(math.multiply(z, z), math.complex(2, 0))
        phase = math.complex(cos(t), sin(t))
        return math.multiply(value, phase)

    return xx, yy, zz, f

def z_abs_squared():
    xx, yy = np.meshgrid(np.linspace(-3, 3, 50), np.linspace(-3, 3, 50))
    zz = np.linspace(0, 15, 50)

    def f(z, t):
        value = math.multiply(z, math.conj(z))
        phase = math.complex(cos(t), sin(t))
        return math.multiply(value, phase)

    return xx, yy, zz, f


def z_cubed():
    xx, yy = np.meshgrid(np.linspace(-2, 2, 50), np.linspace(-2, 2, 50))
    zz = np.linspace(0, 24, 50)

    def f(z, t):
        value = math.add(math.multiply(math.multiply(z, z), z), math.complex(2, 0))
        phase = math.complex(cos(t), sin(t))
        return math.multiply(value, phase)

    return xx, yy, zz, f  

def z_plus_1_divided_by_z_min_1():
    xx, yy = np.meshgrid(np.linspace(-3, 3, 100), np.linspace(-3, 3, 100))
    zz = np.linspace(0, 50, 100)

    def f(z, t):
        value = math.add(math.complex(1, 0), z)
        value = math.divide(value, math.add(math.complex(-1, 0), z))
        phase = math.complex(cos(t), sin(t))
        return math.multiply(value, phase)

    return xx, yy, zz, f

def log_z():
    xx, yy = np.meshgrid(np.linspace(-3, 3, 50), np.linspace(-3, 3, 50))
    zz = np.linspace(0, 3, 50)

    def f(z, t):
        phase = math.complex(cos(t), sin(t))
        return math.multiply(math.log(z), phase)

    return xx, yy, zz, f

def sine_z():
    xx, yy = np.meshgrid(np.linspace(-2, 2, 50), np.linspace(-2, 2, 50))
    zz = np.linspace(0, 4, 50)

    def f(z, t):
        phase = math.complex(cos(t), sin(t))
        return math.multiply(math.sin(z), phase)

    return xx, yy, zz, f

def exp_z():
    xx, yy = np.meshgrid(np.linspace(-2, 2, 50), np.linspace(-2, 2, 50))
    zz = np.linspace(0, 40, 50)

    def f(z, t):
        phase = math.complex(cos(t), sin(t))
        return math.multiply(math.exp(math.multiply(math.complex(-1, 0), math.multiply(z, z))), phase)

    return xx, yy, zz, f

def sqrt_z():
    xx, yy = np.meshgrid(np.linspace(-1, 1, 50), np.linspace(-1, 1, 50))
    zz = np.linspace(0, 1.5, 50)

    def f(z, t):
        phase = math.complex(cos(t), sin(t))
        return math.multiply(math.sqrt(z), phase)

    return xx, yy, zz, f
  
def switch_function(event):
  xx, yy, zz, f = None, None, None, None
  if event.index < 0: return
  elif event.index == 0:
    xx, yy, zz, f = z_squared()
    animation.title = z_2_title + "\n"
    animation.range = 75
  elif event.index == 1:
    xx, yy, zz, f = z_abs_squared()
    animation.title = z_abs_squared_title + "\n"
    animation.range = 75
  elif event.index == 2:
    xx, yy, zz, f = z_cubed()
    animation.range = 75
    animation.title = z_cubed_title + "\n\n"
  elif event.index == 3:
    xx, yy, zz, f = z_plus_1_divided_by_z_min_1()
    animation.range = 150
    animation.title = z_plus_1_divided_by_z_min_1_title + "\n"
  elif event.index == 4:
    xx, yy, zz, f = z_plus_one_over_z()
    animation.range = 80
    animation.title = z_plus_one_over_z_title + "\n"
  elif event.index == 5:
    xx, yy, zz, f = sine_z()
    animation.range = 75
    animation.title = sine_z_title + "\n"
  elif event.index == 6:
    xx, yy, zz, f = log_z()
    animation.range = 75
    animation.title = log_z_title + "\n"
  elif event.index == 7:
    xx, yy, zz, f = exp_z()
    animation.range = 85
    animation.title = exp_z_title + "\n"
  elif event.index == 8:
    xx, yy, zz, f = sqrt_z()
    animation.range = 75
    animation.title = sqrt_z_title + "\n"

  plot.reinitialize(xx, yy, zz, f)
  MathJax.Hub.Queue(["Typeset", MathJax.Hub])

def adjust_omega():
    plot.set_omega_to(omega_slider.value)
    omega_slider_text.text = str(round(omega_slider.value / pi, 2)) + " * π"

animation.append_to_caption("\n")
wave_choices = [
  "f(z,t) = z * z + 2", 
  "f(z,t) = |z| * |z|", 
  "f(z,t) = z * z * z + 2", 
  "f(z,t) = z + 1 / z - 1",
  "f(z,t) = .5 * (z + 1/z)",
  "f(z,t) = sin(z)", 
  "f(z,t) = log(z)", 
  "f(z,t) = exp(-z * z)", 
  "f(z,t) = sqrt(z)"]
_ = menu(choices=wave_choices, bind=switch_function)
animation.append_to_caption("    ")
_ = checkbox(text='YZ mesh', bind=toggle_yz_mesh, checked=True)
_ = checkbox(text='XZ mesh', bind=toggle_xz_mesh, checked=True)
_ = checkbox(text='XY mesh', bind=toggle_xy_mesh, checked=True)
_ = checkbox(text='Tick marks', bind=toggle_tick_marks, checked=True)

animation.append_to_caption("\n\n")
omega_slider = slider(min=0, max=6 * pi, value=2 * pi, bind=adjust_omega)
animation.append_to_caption("Omega = ")
omega_slider_text = wtext(text="2 * π")
animation.append_to_caption("\n"+ caption + "\n")

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

def running(ev):
    global run
    run = not run
    # print("scene.center=" + str(animation.center))
    # print("scene.forward=" + str(animation.forward))
    # print("scene.range=" + str(animation.range))
        
animation.bind('mousedown', running)
MathJax.Hub.Queue(["Typeset", MathJax.Hub])

time = 0
dt = 0.01
run = True
plot = Plot3D(z_squared()[0], z_squared()[1], z_squared()[2], z_squared()[3])
while True:
    rate(1/dt)
    if run:
        plot.render(time)
        time += dt
