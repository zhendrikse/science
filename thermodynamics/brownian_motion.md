{% include breadcrumbs.html %}

## Three-dimensional Brownian motion

A simulation of three-dimensional Brownian motion using a simple hard-sphere model in VPython.

A large, stationary mass is suspended in a randomly arranged lattice of smaller particles which collide
with each other and the larger mass. Interactions between objects are modeled as simple hard-sphere
(i.e. billiard-ball) collisions; by running this simulation a number of times and measuring the distance
that the mass moves each time. If this simulation is accurate to observed brownian motion,
these distances will be normally distributed.

<div class="header_line"><br/></div>

{% include_relative code/BrownianMotion.html %}

<p style="clear: both;"></p>

{% include share_buttons.html %}

