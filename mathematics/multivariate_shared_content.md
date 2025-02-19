## Background information
<div class="header_line"><br/></div>

### Implementation details
<div style="border-top: 1px solid #999999"><br/></div>

In order to make the code as generic as possible, we took an approach based
on both [Numpy](https://numpy.org/) and [Matplotlib](https://matplotlib.org/), 
with which 3D-plots may typically be generated using:

```python
fig, ax = plt.subplots(subplot_kw={"projection": "3d"})

x = np.arange(-5, 5, 0.5)
y = np.arange(-5, 5, 0.5)
X, Y = np.meshgrid(x, y)
R = np.sqrt(X**2 + Y**2)
Z = np.sin(R)

ax.plot_wireframe(X, Y, Z, color='C0')
```

As we don't have the possibility to import neither Numpy nor Matplotlib when running
VPython in a web page (i.e. when it is transpiled to Javascript), 
we have to define a similar [mesh grid](https://www.geeksforgeeks.org/numpy-meshgrid-function/)-like 
function. 

This functionality is implemented in the `NumpyWrapper` class, which we provide with a range
for both axes. The three functions `f_x(x, y)`, `f_y(x, y)`, and `f_z(x, y)` then act
on the mesh grid in a similar way as shown above: 

```python
def sin_sqrt(resolution=50):
    def f_x(x, _):
        return x

    def f_y(_, y):
        return y

    def f_z(x, y):
        return 5 * sin(sqrt(y * y + x * x))

    return NumpyWrapper(-2 * pi, 2 * pi, -2 * pi, 2 * pi, resolution).get_plot_data(f_x, f_y, f_z)
```

This approach will seamlessly accommodate much more complicated surfaces 
and (on [polar coordinates](polar_coordinates.md) based) parametrization, 
that you can find elsewhere on this site, see for instance the topological shapes
in both [surface](topology_surface_plot.md) and [contour](topology_contour_plot.md) plots.
