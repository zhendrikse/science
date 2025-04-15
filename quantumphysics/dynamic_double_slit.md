{% include breadcrumbs.html %}

## [Young&apos;s interference experiment](https://en.wikipedia.org/wiki/Double-slit_experiment)

In this visualization, the interference pattern is generated "dynamically", i.e. by calculating
the propagation of the waves using a 
[finite difference method](https://pythonnumericalmethods.studentorg.berkeley.edu/notebooks/chapter23.03-Finite-Difference-Method.html):

```python
for n in range(1, len(pixels) - 1):
    for m in range(1, len(pixels[0]) - 1):
        uttmesh[m][n] = velocity_squared * ((umesh[m][n - 1] + umesh[m][n + 1] - 2 * umesh[m][n]) / dx_squared + (
                umesh[m - 1][n] + umesh[m + 1][n] - 2 * umesh[m][n]) / dy_squared)

for n in range(1, len(pixels) - 1):
    for m in range(1, len(pixels[0]) - 1):
        utmesh[m][n] += uttmesh[m][n] * dt
        umesh[m][n] += utmesh[m][n] * dt
```

<div class="header_line"><br/></div>

{% include_relative code/dynamic_double_slit.html %}

<p style="clear: both;"></p>

{% include_relative double_slit_background.md %}

{% include share_buttons.html %}

    