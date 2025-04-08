{% include breadcrumbs.html %}

## Euler fluid simulation in pure Javascript
<div class="header_line"><br/></div>

You can move the obstacle with your mouse!

&#x2022; Copyright 2022 [Matthias Müller](https://www.matthiasMueller.info/tenMinutePhysics) &mdash; [Ten Minute Physics](https://www.youtube.com/c/TenMinutePhysics)<br/>
&#x2022; See also his [GitHub pages](https://matthias-research.github.io/pages/tenMinutePhysics/index.html)<br/>

{% include_relative code/euler_fluid.html %}

<p style="clear: both;"></p>

## Implementation 
<div class="header_line"><br/></div>

Let's first state that:

- Liquids and gasses behave quite similarly, so they can often be modeled using similar modeling techniques.
- We will opt for a grid-based approach, also known as "Eulerian approach".
  This means we start with a grid of some particular size and can only have fluid inside that grid. 
- We assume the fluid (or free gas) to be incompressible. Water is actually very close to being incompressible.
- We also assume the liquid to be inviscid (i.e. non-viscous).


### The three main steps 
<div style="border-top: 1px solid #999999"><br/></div>

1. Modify the velocity values based on the forces. Here we only use the gravitational force.
   ```
   for all i, j
       v[i, j] = v[i, j] + Δt * g 
   ```
2. Make the fluid incompressible. We call this projection.
3. We move the velocity field in the grid. We call this advection.

<p style="clear: both;"></p>

{% include share_buttons.html %}


