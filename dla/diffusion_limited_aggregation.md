{% include breadcrumbs.html %}

## Three-dimensional diffusion limited aggregation
<div class="header_line"><br/></div>

{% include_relative code/DLA_3d.html %}

<p style="clear: both;"></p>

{% include share_buttons.html %}

We start with a three-dimensional lattice containing a seed particle in the middle.
Next, we draw a sphere with a given radius around the particle, and place another particle 
on the surface of this sphere at some random angle and have it execute a random walk, 
restricted to vertical or horizontal jumps between lattice sites. 

To make the model more realistic, we let the length of each
step vary according to a random Gaussian distribution. If at some point during its
random walk, the particle encounters another particle within one lattice spacing,
they stick together and the walk terminates. If the particle passes outside the 
sphere from which it was released, it is lost forever. The process is repeated as often
as desired.

<p style="clear: both;"></p>

{% include share_buttons.html %}
