from vpython import *
#!/usr/bin/env python

# https://github.com/Yurlungur/our-local-spacetime/blob/master/local_spacetime.py
# https://www.thephysicsmill.com/2015/09/06/our-local-spacetime/

# Author: Jonah Miller (jonah.maxwell.miller@gmail.com)
# Time-stamp: <2015-09-06 16:45:52 (jmiller)>

display = canvas( title = "Local Space-Time", background=color.gray(0.075))
#earth = sphere(texture=textures.earth)

def sinh(x):
    return .5 * ( exp(x) - exp(-x))

def cosh(x):
    return .5 * ( exp(x) + exp(-x))

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
        X = []
        Y = []

        # Create the 2D grid arrays
        for i in range(len(y)):
            X.append(x)  # Repeat x for each row (to get the same x values)

        for j in range(len(x)):
            Y.append([y[i] for i in range(len(y))])  # Repeat y for each column (to get the same y values)

        # Transpose Y to match the structure of numpy's meshgrid
        Y = list(map(list, zip(*Y)))

        return X, Y

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


class SurfacePlot:
    def __init__(self, xx, yy, zz):
        self._hue_offset, self._hue_gradient, self._opacity, self._shininess = .3, .5, 1, .6
        x_min, x_max = min(map(min, xx)), max(map(max, xx))
        y_min, y_max = min(map(min, yy)), max(map(max, yy))
        z_min, z_max = min(map(min, zz)), max(map(max, zz))
        range_x, range_y, range_z = x_max - x_min, y_max - y_min, z_max - z_min
        self._max_range = max(range_x, range_y, range_z)
        self._xx, self._yy, self._zz = xx, yy, zz
        self._vertices, self._quads = [], []
        self._create_vertices()
        self._create_quads()

    def _get_values_for_plot(self, x, y):
        value = self._zz[x][y]
        new_position = vector(self._xx[x][y], value, self._yy[x][y])
        hue = self._hue_gradient * abs(new_position.y) / self._max_range + self._hue_offset
        return new_position, color.hsv_to_rgb(vec(hue, 1, 1.2))

    def _create_vertices(self, t=1):
        for x in range(len(self._xx)):
            for y in range(len(self._yy[0])):
                position, _ = self._get_values_for_plot(x, y)
                self._vertices.append(vertex(pos=position, normal=vec(0, 1, 0)))

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
        # OLD NORMAL ALGORITHM
        # if x == len(self._xx) - 1 or y == len(self._yy[0]) - 1: return
        # v = self._get_vertex(x, y)
        # a = self._get_vertex(x, y + 1).pos - v.pos
        # b = self._get_vertex(x + 1, y).pos - v.pos
        # v.normal = cross(a, b)

        # NEW NORMAL ALGORITH
        _neighbor_increment_x, _neighbor_increment_y = 1, 1
        if x == (len(self._xx) - 1):
            _neighbor_increment_x = -x
        if y == (len(self._yy[0]) - 1):
            _neighbor_increment_y = -y

        vertex_ = self._get_vertex(x, y)
        # # normal_total_ = self._get_vertex(x, y + _neighbor_increment_y).normal
        # # normal_total_ += self._get_vertex(x + _neighbor_increment_x, y).normal
        vec_1 = self._get_vertex(x, y + _neighbor_increment_y).pos - vertex_.pos
        vec_2 = self._get_vertex(x + _neighbor_increment_x, y).pos - vertex_.pos
        # """
        # Further work to focus on this area of the normal calculations
        # """
        vertex_.normal = cross(vec_1, vec_2)
        # # normal_total_ += cross(vec_1, vec_2)
        # # vertex_.normal = normal_total_/2

    # Set the normal for each vertex to be perpendicular to the lower left corner of the quad.
    # The vectors a and b point to the right and up around a vertex in the xy plane.
    def _make_normals(self):
        for x in range(len(self._xx) ):
            for y in range(len(self._yy[0])):
                self._set_vertex_normal_for(x, y)

    def _update_vertex(self, x, y, value, colour):
        vertex_ = self._get_vertex(x, y)
        vertex_.pos.y = value
        vertex_.color = colour
        vertex_.opacity = self._opacity
        vertex_.shininess = self._shininess

    def _update_vertices(self):
        for x in range(len(self._xx)):
            for y in range(len(self._yy[0])):
                position, colour = self._get_values_for_plot(x, y)
                self._update_vertex(x, y, position.y, colour)

    def _get_vertex(self, x, y):
        return self._vertices[x * len(self._yy[0]) + y]

    def render(self):
        self._update_vertices()
        self._make_normals()


# Function to evaluate Legendre polynomial P_n(x) and its derivative
def legendre_poly(n, x):
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


def legendre_poly_derivative(n, x):
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
def find_roots(n, tol=1e-14, max_iter=100):
    # Initial guess for the roots (x) are the Chebyshev nodes
    x = [cos(pi * (4 * i - 1) / (2 * n)) for i in range(1, n + 1)]
    for i in range(n):
        xi = x[i]
        for j in range(max_iter):
            # Calculate Legendre polynomial and its derivative at x_i
            Pn = legendre_poly(n, xi)
            Pn_prime = legendre_poly_derivative(n, xi)
            # Newton-Raphson update
            xi_new = xi - Pn / Pn_prime
            # Check for convergence
            if abs(xi_new - xi) < tol:
                break
            xi = xi_new
        x[i] = xi
    return x


# Function to find the weights for Gaussian quadrature
def gauss_legendre_weights(roots):
    weights = []
    for xi in roots:
        # Weight is calculated using the derivative of the Legendre polynomial
        Pn_prime = legendre_poly_derivative(len(roots), xi)
        weight = 2 / ((1 - xi * xi) * (Pn_prime * Pn_prime))
        weights.append(weight)
    return weights

# Precompute the roots and weights for a given n
roots_cache = {}
weights_cache = {}

def precompute_roots_and_weights(n):
    if n not in roots_cache:
        # Find the roots using the method we previously used
        roots = find_roots(n)
        weights = gauss_legendre_weights(roots)
        roots_cache[n] = roots
        weights_cache[n] = weights
    return roots_cache[n], weights_cache[n]

# Gaussian quadrature integration
def gaussian_quadrature(function_, from_, to_, n):
    # Find the roots and weights for the standard interval [-1, 1]
    roots, weights = precompute_roots_and_weights(n)

    # Transform roots from [-1, 1] to [a, b]
    transformed_roots = [(to_ - from_) / 2 * xi + (to_ + from_) / 2 for xi in roots]

    # Calculate the integral using the transformed roots and weights
    integral = 0
    for xi, weight in zip(transformed_roots, weights):
        integral += weight * function_(xi)

    integral *= (to_ - from_) / 2
    return integral

def integrand(x):
    temp = (1 - x) * (1 - x)
    temp *= temp
    return sqrt( (  (1 / temp) - 1 ) / x )



def local_space_time(resolution=100):
    def f_x(f, s):
        return s * cosh(f)

    def f_y(f, s):
        return s * sinh(f)

    def f_z(_, s):
        upper_bound = 0.25 * s * s
        return gaussian_quadrature(integrand, 0, upper_bound, resolution)

    f_max = 1.2
    f_min = -f_max
    r_earth = 0.4
    r_max = 1.44
    return NumpyWrapper(f_min, f_max, r_earth, r_max, resolution).get_plot_data(f_x, f_y, f_z)

xx, yy, zz = local_space_time()
plot = SurfacePlot(xx, yy, zz)

while True:
    plot.render()
    rate(10)