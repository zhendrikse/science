{% include breadcrumbs.html %}

## Lorenz attractor
<div class="header_line"><br/></div>

According to [Paul Bourke](https://paulbourke.net/fractals/lorenz/):

<blockquote>
The lorenz attractor was first studied by Ed N. Lorenz, 
a meteorologist, around 1963. It was derived from a simplified model of convection in the earth's atmosphere. 
It also arises naturally in models of lasers and dynamos. 
The system is most commonly expressed as 3 coupled non-linear differential equations.

$dx / dt = a (y - x)$

$dy / dt = x (b - z) - y$

$dz / dt = xy - c z$

One commonly used set of constants is $a = 10, b = 28, c = 8 / 3$. 
Another is $a = 28, b = 46.92, c = 4$. The constant $a$ is sometimes known as the 
Prandtl number and $b$ the Rayleigh number.

The series does not form limit cycles nor does it ever reach a steady state. Instead, 
it is an example of deterministic chaos. As with other chaotic systems the Lorenz system is sensitive 
to the initial conditions, two initial states no matter how close will diverge, usually sooner rather than later. 
</blockquote>

<p style="clear: both;"></p>

{% include_relative code/LorenzAttractor.html %}

<p style="clear: both;"></p>

{% include share_buttons.html %}