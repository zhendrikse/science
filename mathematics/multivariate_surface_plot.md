{% include breadcrumbs.html %}

## Surface plots of multivariate functions
<div class="header_line"><br/></div>

- The code for this surface plot can be found in 
  [multivariate_surface_plot.html](https://github.com/zhendrikse/science/blob/main/mathematics/code/multivariate_surface_plot.html) 
- It is implemented in Javascript using [Three.js](https://threejs.org/) 
- A [VPython](https://vpython.org/) version is available as well:
  [multivariate_functions.py](https://github.com/zhendrikse/science/blob/main/mathematics/code/multivariate_functions.py).
- Some interesting functions: <br/>
  ➡️ Wavelet: `1.5 * sin(3 * sqrt(v*v + u*u)) / sqrt(u*u + v*v + 1e-3)` <br/>
  ➡️ Saddle: `2/5 * (u*u - v*v)` <br/>
  ➡️ Peak: `6 * exp(-u*u - v*v)` <br/>
  ➡️ Peaks: `2 * sin(1.75 *u + pi/6) * cos(1.75 * v + pi/6)` <br/>
  ➡️ Ripple: `sin(2.5 * u * v)` <br/>
  ➡️ Poly: `.1 * (v*v*v*u - u*u*u*v)` <br/>
  ➡️ Ricker wavelet: `5 * (1 - 1 * (u*u + v*v))*exp(-0.75 * (u*u + v*v))`

    
{% include_relative code/multivariate_surface_plot.html %}

<p style="clear: both;"></p>

{% include_relative multivariate_shared_content.md %}

{% include share_buttons.html %}