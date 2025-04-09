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

Let's first assert that:

- Liquids and gasses behave quite similarly, so they can often be modeled using similar modeling techniques.
- We will opt for a grid-based approach, also known as "Eulerian approach".
  This means we start with a grid of some particular size and can only have fluid/gas inside that grid. 
- We assume the fluid (or free gas) to be incompressible. Water is actually very close to being incompressible.
- We also assume the liquid to be inviscid (i.e. non-viscous).


### The three main steps 
<div style="border-top: 1px solid #999999"><br/></div>

1. Modify the velocity values based on the forces. Here we only use the gravitational force.
   We denote this step as <em>integration</em>.
   ```
   for all i, j
       v[i, j] = v[i, j] + Δt * g 
   ```
2. Make the fluid incompressible. We call this step <em>projection</em>. 
   An incompressible fluid means that the divergence (i.e. inflow and outflow) at each
   grid cell needs to be zero.
3. We move the velocity field in the grid. We call this step <em>advection</em>, as advection is defined as 
   the transfer of a property from one place to another due to the motion of the fluid. So if 
   you’ve got some black dye in some water, and the water is moving to the right, then 
   the black dye moves right.

   Just as black ink would move through the fluid, so too will the velocity field itself!
   Intuitively you can think of it this way: a particle moving in a certain direction 
   will continue moving in that direction, even after it’s moved.

   Since we’re storing velocity in a grid just like we do with the smoke, 
   we can use the exact same routine to advect velocity through itself.

<p style="clear: both;"></p>

{% include share_buttons.html %}


