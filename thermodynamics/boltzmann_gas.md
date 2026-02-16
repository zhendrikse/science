{% include breadcrumbs.html %}

# Ideal gas velocity distribution
<div class="header_line"><br/></div>


## Two-dimensional Boltzmann gas
<div class="header_line"><br/></div>

{% include_relative code/boltzmann_gas_2d.html %}

<p style="clear: both;"></p>

## Three-dimensional Boltzmann gas
<div class="header_line"><br/></div>

{% include_relative code/boltzmann_gas_3d.html %}

<p style="clear: both;"></p>


### Kinetic theory and the ideal gas
<div class="header_line"><br/></div>

<figure style="text-align: center;">
  <img alt="Kinetic theory and the ideal gas" src="images/kinetic_theory_ideal_gas.jpg" />
  <figcaption>This excellent visual guide originates from 
    <a href="https://www.facebook.com/HouseOfPhysics/">House of Physics</a>.
  </figcaption>
</figure>


## Maxwell-Boltzmann Distribution: 2D vis à vis 3D

### Maxwell-Boltzmann velocity distributions for $\vec{v}$

The velocity distribution for $f(\vec{v}) , d^n\vec{v}$ is given by

#### 3D case

$$ f(\vec{v}) d^3\vec{v} = \left(\frac{m}{2 \pi k_B T}\right)^{3/2} \exp\Big(-\frac{m v^2}{2 k_B T}\Big) d^3\vec{v}$$

#### 2D case

$$ f(\vec{v}) d^2\vec{v} = \left(\frac{m}{2 \pi k_B T}\right) \exp\Big(-\frac{m v^2}{2 k_B T}\Big) d^2\vec{v}$$

* We have $v^2 = v_x^2 + v_y^2 + v_z^2$ in 3 dimensions and $v^2 = v_x^2 + v_y^2$ in 2 dimensions.
* Normalisation because the integral volume $d^n\vec{v}$ depends on the dimension.

### Maxwell-Boltzmann velocity distributions for $\|\vec{v}\|$

In the graphs we reduce to a **radial distribution**, so we take
the “surface of the cirkel/sphere”:

$$
d^n\vec{v} = v^{n-1} dv , d\Omega_n
$$

where $d\Omega_n$ denotes the angular part.
This amounts to an additional factor $v$ for 2D, $v^2$ for 3D.

#### 3D case

$$ f(v) dv = 4\pi \left(\frac{m}{2 \pi k_B T}\right)^{3/2} v^2 \exp\Big(-\frac{m v^2}{2 k_B T}\Big) dv$$

#### 2D case

$$ f(v) dv = \frac{m}{k_B T} , v , \exp\Big(-\frac{m v^2}{2 k_B T}\Big) dv$$

* **Factor $v^{n-1}$** originates from the velocities with the same speeds (surface of a cirkel/sphere).
* This is what is used in the code, e.g. `value = (v / T) * exp(-v*v / (2 * T))` in 2D.


{% include share_buttons.html %}

