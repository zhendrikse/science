{% include breadcrumbs.html %}

## Two-dimensional diffusion limited aggregation
<div class="header_line"><br/></div>

{% include_relative code/dla_2d.html %}

<p style="clear: both;"></p>

We start with a two-dimensional lattice containing a seed particle in the middle.
Next, we draw a circle with a given radius around the particle, and place another particle 
on the perimeter of this circle at some random angle and have it execute a random walk, 
restricted to vertical or horizontal jumps between lattice sites. 

To make the model more realistic, we let the length of each
step vary according to a random Gaussian distribution. If at some point during its
random walk, the particle encounters another particle within one lattice spacing,
they stick together and the walk terminates. If the particle passes outside the 
circle from which it was released, it is lost forever. The process is repeated as often
as desired.

<p style="clear: both;"></p>

{% include share_buttons.html %}
