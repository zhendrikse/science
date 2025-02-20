# Web VPython 3.2

from vpython import canvas, rate, exp, arange, quad, vertex, vec, vector, color, cross, curve, sqrt, cos, pi, textures, \
    sphere, checkbox

title = """&#x2022; The <span style="color: red">red lines</span> represent the time axis, running from the bottom to the top.
&#x2022; The black lines are a spatial coordinate, pointing towards the Earth.
&#x2022; The Earth can be shown, but does <em>not</em> do justice to the <em>time</em> coordinate, of course!
&#x2022; A background with stars can be enabled, but <em>violates the time coordinate</em> in a similar way!

&#x2022; Original <a href="https://github.com/Yurlungur/our-local-spacetime/blob/master/local_spacetime.py">local_spacetime.py</a> by Jonah Miller (jonah.maxwell.miller@gmail.com).
&#x2022; Ported to VPython by <a href="https://www.hendrikse.name/">Zeger Hendrikse</a>, see <a href="https://github.com/zhendrikse/science/blob/main/relativity/code/local_space_time.py">local_space_time.py</a>
&#x2022; Learn more about this visualization in Jonah Miller&apos;s elaborate article <a href="https://www.thephysicsmill.com/2015/09/06/our-local-spacetime/">Our Local Spacetime</a>.
&#x2022; Credits to ChatGPT for helping out with the optimization of the Gaussian quadrature.

"""

display = canvas(title=title, width=650, height=650, background=color.gray(0.075), center=vec(.18, -.37, 1.7),
                 range=4.25, forward=vec(-0.8, -.15, -.55))
earth = sphere(texture=textures.earth, visible=False)
stars = sphere(pos=vec(0, 0, 0), texture="https://i.imgur.com/1nVWbbd.jpg", radius=10, shininess=0, opacity=0.5,
               visible=False)


def sinh(x):
    return .5 * (exp(x) - exp(-x))


def cosh(x):
    return .5 * (exp(x) + exp(-x))


class NumpyWrapper:
    def __init__(self, start_1, stop_1, start_2, stop_2, resolution):
        self._resolution = resolution
        x = self._linspace(start_1, stop_1, resolution)
        y = self._linspace(start_2, stop_2, resolution)
        self._x, self._y = self._meshgrid(x, y)

    def _linspace(self, start, stop, num):
        return [x for x in arange(start, stop, (stop - start) / (num - 1))] + [stop]

    def _meshgrid(self, x, y):
        # Create empty lists to hold the grid arrays
        xx = []
        yy = []

        # Create the 2D grid arrays
        for i in range(len(y)):
            xx.append(x)  # Repeat x for each row (to get the same x values)

        for j in range(len(x)):
            yy.append([y[i] for i in range(len(y))])  # Repeat y for each column (to get the same y values)

        # Transpose Y to match the structure of numpy's meshgrid
        yy = list(map(list, zip(*yy)))

        return xx, yy

    def get_plot_data(self, f_x, f_y, f_z):
        x, y, z = [], [], []
        for i in range(len(self._x)):
            x_, y_, z_ = [], [], []
            for j in range(len(self._y[0])):
                x_ += [f_x(self._x[i][j], self._y[i][j])]
                y_ += [f_y(self._x[i][j], self._y[i][j])]
                z_ += [f_z(self._x[i][j], self._y[i][j])]
            x += [x_]
            y += [y_]
            z += [z_]

        return x, y, z


class Plot:
    def __init__(self, xx, yy, zz):
        self._xx, self._yy, self._zz = xx, yy, zz
        self._hue_offset, self._hue_gradient, self._opacity, self._shininess = .3, .5, 1, .6
        x_min, x_max = min(map(min, xx)), max(map(max, xx))
        y_min, y_max = min(map(min, yy)), max(map(max, yy))
        z_min, z_max = min(map(min, zz)), max(map(max, zz))
        range_x, range_y, range_z = x_max - x_min, y_max - y_min, z_max - z_min
        self._max_range = max(range_x, range_y, range_z)

    def set_hue_offset_to(self, offset):
        self._hue_offset = offset

    def set_hue_gradient_to(self, gradient):
        self._hue_gradient = gradient

    def set_opacity_to(self, opacity):
        self._opacity = opacity

    def set_shininess_to(self, shininess):
        self._shininess = shininess


class ContourPlot(Plot):
    def __init__(self, xx, yy, zz):
        Plot.__init__(self, xx, yy, zz)
        self._x_contours, self._y_contours = [], []
        self._initialize_contour_curves()

    def _initialize_contour_curves(self):
        positions = []
        position_col = [[] for _ in range(len(self._yy[0]))]
        for i in range(len(self._xx)):
            position_row = []
            for j in range(len(self._yy[0])):
                position_row.append(vector(self._xx[i][j], self._zz[i][j], self._yy[i][j]))
                position_col[j].append(vector(self._xx[i][j], self._zz[i][j], self._yy[i][j]))
            positions.append(position_row)
            self._x_contours.append(curve(pos=position_row, radius=.01))

        for i in range(len(position_col)):
            self._y_contours.append(curve(pos=position_col[i], radius=.01))

    def _render_contours(self, x, y):
        self._x_contours[x].modify(y, color=color.magenta)  # Color red fixed for time coordinate
        self._y_contours[y].modify(x, color=color.black)  # Color black fixed for space coordinate
        self._x_contours[x].modify(y, pos=vector(self._xx[x][y], self._zz[x][y], self._yy[x][y]))
        self._y_contours[y].modify(x, pos=vector(self._xx[x][y], self._zz[x][y], self._yy[x][y]))

    def render(self):
        for x in range(len(self._xx)):
            for y in range(len(self._yy[0])):
                self._render_contours(x, y)


class SurfacePlot(Plot):
    def __init__(self, xx, yy, zz):
        Plot.__init__(self, xx, yy, zz)
        self._vertices, self._quads = [], []
        self._create_vertices()
        self._create_quads()

    def _create_vertices(self):
        for x in range(len(self._xx)):
            for y in range(len(self._yy[0])):
                position = vector(self._xx[x][y], self._zz[x][y], self._yy[x][y])
                self._vertices.append(vertex(pos=position, normal=vec(0, 1, 0), color=color.green))

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
    def _create_quads(self):
        for x in range(len(self._xx) - 1):
            for y in range(len(self._yy[0]) - 1):
                self._create_quad(x, y)

    def _set_vertex_normal_for(self, x, y):
        _neighbor_increment_x, _neighbor_increment_y = 1, 1
        if x == (len(self._xx) - 1):
            _neighbor_increment_x = -x
        if y == (len(self._yy[0]) - 1):
            _neighbor_increment_y = -y

        vertex_ = self._get_vertex(x, y)
        normal_total_ = self._get_vertex(x, y + _neighbor_increment_y).normal
        normal_total_ += self._get_vertex(x + _neighbor_increment_x, y).normal
        vec_1 = self._get_vertex(x, y + _neighbor_increment_y).pos - vertex_.pos
        vec_2 = self._get_vertex(x + _neighbor_increment_x, y).pos - vertex_.pos
        # """
        # Further work to focus on this area of the normal calculations
        # """
        # vertex_.normal = cross(vec_1, vec_2)
        normal_total_ += cross(vec_1, vec_2)
        vertex_.normal = normal_total_ / 2

    # Set the normal for each vertex to be perpendicular to the lower left corner of the quad.
    # The vectors a and b point to the right and up around a vertex in the xy plane.
    def _make_normals(self):
        for x in range(len(self._xx)):
            for y in range(len(self._yy[0])):
                self._set_vertex_normal_for(x, y)

    def _update_vertex(self, x, y, value):
        vertex_ = self._get_vertex(x, y)
        vertex_.pos.y = value
        vertex_.color = color.green
        vertex_.opacity = self._opacity
        vertex_.shininess = self._shininess

    def _update_vertices(self):
        for x in range(len(self._xx)):
            for y in range(len(self._yy[0])):
                self._update_vertex(x, y, self._zz[x][y])

    def _get_vertex(self, x, y):
        return self._vertices[x * len(self._yy[0]) + y]

    def render(self):
        self._update_vertices()
        self._make_normals()


class GaussianQuadrature:
    def __init__(self):
        # Precompute the roots and weights for a given n
        self._roots_cache = {}
        self._weights_cache = {}

    # Function to evaluate Legendre polynomial P_n(x) and its derivative
    def _legendre_poly(self, n, x):
        if n == 0:
            return 1
        elif n == 1:
            return x
        else:
            P0 = 1
            P1 = x
            for k in range(2, n + 1):
                Pn = ((2 * k - 1) * x * P1 - (k - 1) * P0) / k
                P0 = P1
                P1 = Pn
            return Pn

    def _legendre_poly_derivative(self, n, x):
        if n == 0:
            return 0
        elif n == 1:
            return 1
        else:
            P0 = 1
            P1 = x
            for k in range(2, n + 1):
                Pn = ((2 * k - 1) * x * P1 - (k - 1) * P0) / k
                P0 = P1
                P1 = Pn
            return n * (P0 - x * P1) / (1 - (x * x))

    # Function to find the roots (x) of the Legendre polynomial P_n(x) using Newton's method
    def _find_roots(self, n, tol=1e-14, max_iter=100):
        # Initial guess for the roots (x) are the Chebyshev nodes
        x = [cos(pi * (4 * i - 1) / (2 * n)) for i in range(1, n + 1)]
        for i in range(n):
            xi = x[i]
            for j in range(max_iter):
                # Calculate Legendre polynomial and its derivative at x_i
                Pn = self._legendre_poly(n, xi)
                Pn_prime = self._legendre_poly_derivative(n, xi)
                # Newton-Raphson update
                xi_new = xi - Pn / Pn_prime
                # Check for convergence
                if abs(xi_new - xi) < tol:
                    break
                xi = xi_new
            x[i] = xi
        return x

    # Function to find the weights for Gaussian quadrature
    def _gauss_legendre_weights(self, roots):
        weights = []
        for xi in roots:
            # Weight is calculated using the derivative of the Legendre polynomial
            Pn_prime = self._legendre_poly_derivative(len(roots), xi)
            weight = 2 / ((1 - xi * xi) * (Pn_prime * Pn_prime))
            weights.append(weight)
        return weights

    def _precompute_roots_and_weights(self, n):
        if n not in self._roots_cache:
            # Find the roots using the method we previously used
            roots = self._find_roots(n)
            weights = self._gauss_legendre_weights(roots)
            self._roots_cache[n] = roots
            self._weights_cache[n] = weights
        return self._roots_cache[n], self._weights_cache[n]

    # Gaussian quadrature integration
    def gaussian_quadrature(self, f_x, from_, to_, n):
        # Find the roots and weights for the standard interval [-1, 1]
        roots, weights = self._precompute_roots_and_weights(n)

        # Transform roots from [-1, 1] to [a, b]
        transformed_roots = [(to_ - from_) / 2 * xi + (to_ + from_) / 2 for xi in roots]

        # Calculate the integral using the transformed roots and weights
        integral = 0
        for xi, weight in zip(transformed_roots, weights):
            integral += weight * f_x(xi)

        integral *= (to_ - from_) / 2
        return integral


def integrand(x):
    temp = (1 - x) * (1 - x)
    temp *= temp
    return sqrt(((1 / temp) - 1) / x)


def local_space_time(resolution=100):
    def f_x(f, s):
        return s * cosh(f)

    def f_z(f, s):
        return s * sinh(f)

    def f_y(_, s):
        upper_bound = 0.25 * s * s
        visual_scaling_factor = 3.
        return visual_scaling_factor * integration.gaussian_quadrature(integrand, 0, upper_bound, resolution)

    f_max = 1.2
    f_min = -f_max
    r_earth = 0.4
    r_max = 1.44
    return NumpyWrapper(f_min, f_max, r_earth, r_max, resolution).get_plot_data(f_x, f_y, f_z)


integration = GaussianQuadrature()
x, y, z = local_space_time()
SurfacePlot(x, y, z).render()
x, y, z = local_space_time(20)
ContourPlot(x, y, z).render()


def toggle_earth():
    earth.visible = not earth.visible


def toggle_stars():
    stars.visible = not stars.visible


display.append_to_caption("\n")
_ = checkbox(text="Show Earth ", bind=toggle_earth)
_ = checkbox(text="Show stars ", bind=toggle_stars)
MathJax.Hub.Queue(["Typeset", MathJax.Hub])

while True:
    rate(10)


