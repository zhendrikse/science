{% include breadcrumbs.html %}

## Non-ideal capacitor
<div class="header_line"><br/></div>

{% include_relative code/non_ideal_capacitor.html %}

<p style="clear: both;"></p>

## Theoretical background
<div class="header_line"><br/></div>

The capacity for a capacitor consisting of two parallel plates is given by $C = \epsilon_0A/d$,
where $A$ is the surface area and $d$ the distance between the plates, and $\epsilon_0$ the permittivity
of the spacer material. 

Since $d \ll A$, we expect the fields 
to be approximately constant with $\rho$ until we get close to the edge of the plates. 
Therefore, we assume $\partial V/\partial\rho$ is negligible and can be taken to be zero. 
As the surrounding area does not contain any additional charges, we can consider this
to be a so-called <em>source-free</em> region, and Laplace’s Equation applies:

$\begin{equation}\nabla^2V=0\end{equation}$

<blockquote>
A reasonable question to ask at this point would be, what about the potential field close to the edge 
of the plates, or, for that matter, beyond the plates? The field in this region is referred to as a 
fringing field. For the fringing field, $\partial V/\partial \rho$ is no longer negligible and must 
be taken into account. 

In addition, it is necessary to modify the boundary conditions to account for the outside 
surfaces of the plates (that is, the sides of the plates that face away from the dielectric) 
and to account for the effect of the boundary between the spacer material and free space. 
These issues make the problem much more difficult. 
When an accurate calculation of a fringing field is necessary, it is common to resort 
to a numerical solution of Laplace’s Equation. Fortunately, accurate calculation of 
fringing fields is usually not required in practical engineering applications. &mdash; 
<a href="https://www.circuitbread.com/textbooks/electromagnetics-i/electrostatics/potential-field-within-a-parallel-plate-capacitor">www.circuitbread.com</a>
</blockquote><br/>

When we assume the plates to lie in the $xy$-plane, the  fields will be symmetric along the $z$-direction, 
hence $\partial/V\partial z$ will be zero.

This simplifies our Laplace equation to

$\begin{equation}\dfrac{\partial^2V}{\partial x^2} + \dfrac{\partial^2V}{\partial y^2} = 0 \end{equation}$

Once we know the potential $V$, we can also calculate the electric field:

$\begin{equation} \vec{E} = -\nabla\cdot V = -\left( \dfrac{\partial}{\partial x}\hat{x} + \dfrac{\partial}{\partial y}\hat{y} + \dfrac{\partial}{\partial z}\hat{z} \right)V\end{equation}$

So our task is to numerically solve the second order differential equation for the potential $V$:

- $V(x + h, y) \approx V(x, y) + h\dfrac{\partial V}{\partial x} + \dfrac{h^2}{2}\dfrac{\partial^2 V}{\partial x^2}$

- $V(x, y + h) \approx V(x, y) + h\dfrac{\partial V}{\partial y} + \dfrac{h^2}{2}\dfrac{\partial^2 V}{\partial y^2}$

- $V(x - h, y) \approx V(x, y) - h\dfrac{\partial V}{\partial x} + \dfrac{h^2}{2}\dfrac{\partial^2 V}{\partial x^2}$

- $V(x, y - h) \approx V(x, y) - h\dfrac{\partial V}{\partial y} + \dfrac{h^2}{2}\dfrac{\partial^2 V}{\partial y^2}$

$\begin{equation}V(x, y) = \dfrac{1}{4} \bigg( V(x + h, y) + V(x, y+ h) + V(x - h, y) + V(x, y - h) \bigg)\end{equation}$

This translates to the following Python code:

```python
import numpy as np
def solve_laplacian_numpy(u, u_cond, iterations=5000):
    V = np.array(u)
    for i in range(iterations):
        V[u_cond] = u[u_cond]
        V[1:-1, 1:-1] = .25 * (V[0:-2, 1:-1] + V[2:, 1:-1] + V[1:-1, 0:-2] + V[1:-1, 2:])
    return V

def get_field(V, h):
    E_x, E_y = np.gradient(V)
    return -E_x / h, -E_y / h
```

<p style="clear: both;"></p>

{% include share_buttons.html %}


