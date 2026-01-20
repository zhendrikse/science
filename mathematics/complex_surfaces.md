{% include breadcrumbs.html %}

## Surface plots of complex functions
<div class="header_line"><br/></div>

### What are you looking at?

* 🎨 **Colors turn around zero points**
* ✂️ **Branch cuts** are visible as abrupt change of colors
* ⛰️ Height explodes where $|f(z)|$ is big
* 🔴↔🔵 continuous phase cycli

For $ f(z)=\tfrac12(z^2+2) $:

* Zero points at $ z = \pm i\sqrt{2} $
* Phase-singularities exact on those points
  → visually correct? This is a check that everything is mathematically sound.

{% include_relative code/complex_surface_plot.html %}

<p style="clear: both;"></p>

The images are generated with [complex_surfaces.html](https://github.com/zhendrikse/science/blob/main/mathematics/code/complex_surfaces.html).

{% include share_buttons.html %}