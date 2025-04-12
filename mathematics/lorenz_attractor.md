{% include breadcrumbs.html %}

## Lorenz attractor
<div class="header_line"><br/></div>

{% include_relative code/lorenz_attractor.html %}

<p style="clear: both;"></p>

### Background
<div style="border-top: 1px solid #999999"><br/></div>

The [lorenz attractor](https://en.wikipedia.org/wiki/Lorenz_system) was first studied by [Edward N. Lorenz](https://en.wikipedia.org/wiki/Edward_Norton_Lorenz), 
a meteorologist. It was derived from a simplified model of convection in the earth's atmosphere. 

In 1963, the meteorologist was running a weather model when he stumbled upon something unexpected. 
A tiny rounding error in his input led to wildly different outcomes &mdash; chaos emerging  
from seemingly deterministic equations. This  discovery became the foundation of chaos theory and is beautifully captured 
in the Lorenz equations, a set of three coupled non-linear differential equations:

- $\dfrac{dx}{dt} = a (y - x)$, the stream function

- $\dfrac{dy}{dt} = x (b - z) - y$, the temperature gradient

- $\dfrac{dz}{dt} = xy - c z$, the deviation in (linear) temperature

The constant $a$ is sometimes known as the 
Prandtl number and $b$ the Rayleigh number.
One commonly used set of constants is $a = 10$, $b = 28$, $c = 8 / 3$. 
Another is $a = 28$, $b = 46.92$, $c = 4$.  

At their core, the three simple-looking differential equations describe fluid convection, but
their implications stretch far beyond meteorology. the iconic double-loop shape, known as the Lorenz attractor, 
reveals the sensitive dependence on initial conditions &mdash; better known as the butterfly effect. 
It's why long-term weather forecasting remains so challenging and why deterministic systems can still behave 
unpredictably.

From climate models to neuroscience, from financial markets to turbulent flows, Lorenz's work echoes
through science, technology, and even philosophy. The universe, 
it turns out, is full of delicate interconnections.

For further reading: the website of [Paul Bourke](https://paulbourke.net/fractals/lorenz/) contains 
[a comprehensive page](https://paulbourke.net/fractals/lorenz/) on the Lorenz attractor.

<p style="clear: both;"></p>

{% include share_buttons.html %}