{% include breadcrumbs.html %}

## Surface plots of multivariate functions
<div class="header_line"><br/></div>

- The code for this contour plot can be found in
  [multivariate_surface_plot.html](https://github.com/zhendrikse/science/blob/main/mathematics/code/multivariate_contour_plot.html)
- It is implemented in Javascript using [Three.js](https://threejs.org/)
- A [VPython](https://vpython.org/) version is available as well:
  [multivariate_functions.py](https://github.com/zhendrikse/science/blob/main/mathematics/code/multivariate_functions.py).

<details>
<summary>Some interesting functions to try!</summary>

<table>
  <tr><td>Wavelet</td>        <td>`.5 * sin(3 * sqrt(x*x + y*y)) / sqrt(x*x + y*y)`</td></tr>
  <tr><td>Saddle</td>         <td>`(x*x - y*y) / 5` </td></tr>
  <tr><td>Peak</td>           <td>`2 * exp(-x*x - y*y)`</td></tr>
  <tr><td>Peaks</td>          <td>`.5 * sin(pi * x) * cos(pi * y)`</td></tr>
  <tr><td>Ripple</td>         <td>`.3 * sin(pi * x * y)`</td></tr>
  <tr><td>Poly</td>           <td>`.15 * (y*y*y*x - x*x*x*y)`</td></tr>
  <tr><td>Ricker wavelet</td> <td>`1.5 * (1 - 2 * (x*x + y*y))*exp(-2 * (x*x + y*y) / (4/3))`</td></tr>
</table>

</details>

{% include_relative code/multivariate_contour_plot.html %}

<p style="clear: both;"></p>

{% include_relative multivariate_shared_content.md %}

{% include share_buttons.html %}