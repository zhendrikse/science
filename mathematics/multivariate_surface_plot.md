{% include breadcrumbs.html %}

## Surface plots of multivariate functions
<div class="header_line"><br/></div>

- The code for this surface plot can be found in 
  [multivariate_surface_plot.html](https://github.com/zhendrikse/science/blob/main/mathematics/code/multivariate_surface_plot.html) 
- It is implemented in Javascript using [Three.js](https://threejs.org/) 
- A [VPython](https://vpython.org/) version is available as well:
  [multivariate_functions.py](https://github.com/zhendrikse/science/blob/main/mathematics/code/multivariate_functions.py).
- Some interesting functions:
  - Wavelet: `.5 * sin(3 * sqrt(x*x + y*y)) / sqrt(x*x + y*y)`
  - Saddle: `(x*x - y*y) / 5`
  - Peak: `2 * exp(-x*x - y*y)`
  - Peaks: `.5 * sin(pi * x) * cos(pi * y)`
  - Ripple: `.3 * sin(pi * x * y)`
  - Poly: `.15 * (y*y*y*x - x*x*x*y)`
  - Ricker wavelet: `1.5 * (1 - 2 * (x*x + y*y))*exp(-2 * (x*x + y*y) / (4/3))`
    
{% include_relative code/multivariate_surface_plot.html %}

<p style="clear: both;"></p>

{% include_relative multivariate_shared_content.md %}

{% include share_buttons.html %}