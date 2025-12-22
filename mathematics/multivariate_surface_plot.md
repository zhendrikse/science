{% include breadcrumbs.html %}

## Surface plots of multivariate functions
<div class="header_line"><br/></div>

- The code for this surface plot can be found in 
  [multivariate_surface_plot.html](https://github.com/zhendrikse/science/blob/main/mathematics/code/multivariate_surface_plot.html) 
- It is implemented in Javascript using [Three.js](https://threejs.org/) 
- A [VPython](https://vpython.org/) version is available as well:
  [multivariate_functions.py](https://github.com/zhendrikse/science/blob/main/mathematics/code/multivariate_functions.py).
- Some interesting functions: <br/>
  ➡️ Wavelet: `sin(3 * sqrt(x*x + y*y)) / sqrt(x*x + y*y)` <br/>
  ➡️ Saddle: `2/5 * (x*x - y*y)` <br/>
  ➡️ Peak: `4 * exp(-x*x - y*y)` <br/>
  ➡️ Peaks: `sin(pi * x) * cos(pi * y)` <br/>
  ➡️ Ripple: `.5 * sin(pi * x * y)` <br/>
  ➡️ Poly: `.3 * (y*y*y*x - x*x*x*y)` <br/>
  ➡️ Ricker wavelet: `3 * (1 - 2 * (x*x + y*y))*exp(-1.5 * (x*x + y*y))`

    
{% include_relative code/multivariate_surface_plot.html %}

<p style="clear: both;"></p>

{% include_relative multivariate_shared_content.md %}

{% include share_buttons.html %}