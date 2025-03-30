{% include breadcrumbs.html %}

## [Young&apos;s interference experiment](htpts://en.wikipedia.org/wiki/Double-slit_experiment)

In this visualization, the interference pattern is generated "statically", i.e. by calculating
the path difference between the beams originating from each source and setting the (pixel) color 
of the background accordingly:

```python
path_difference = abs(mag(vertex_.pos - slit_1_pos) - mag(vertex_.pos - slit_2_pos))
n = path_difference % wavelength
brightness = 0.5 * abs(n - 0.5) 
vertex_.color = vector(brightness, brightness, 0) # Vector containing RGB values
```

The two slits are represented by the two spheres that also now firing particles at the screen/detector 
in the simulation, so that the difference in the behavior of particles and waves can be clearly seen.

<div class="header_line"><br/></div>

{% include_relative code/DoubleSlit.html %}

<p style="clear: both;"></p>

{% include_relative double_slit_background.md %}

{% include share_buttons.html %}


    