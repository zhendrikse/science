{% include breadcrumbs.html %}

## Two-dimensional Brownian motion
<div class="header_line"><br/></div>

🔧 [brownian_motion_2d.html](https://github.com/zhendrikse/science/blob/main/thermodynamics/code/brownian_motion_2d.html) is JavaScript and [Three.js](https://threejs.org/) <br/>

{% include_relative code/brownian_motion_2d.html %}

<p style="clear: both;"></p>

## Three-dimensional Brownian motion
<div class="header_line"><br/></div>

🔧 [brownian_motion_3d.html](https://github.com/zhendrikse/science/blob/main/thermodynamics/code/energy_equipartition.html) is JavaScript and [Three.js](https://threejs.org/) <br/>
⭐ Also available as [brownian_motion.py](https://github.com/zhendrikse/physics-in-python/blob/main/vpython/brownian_motion.py)

{% include_relative code/brownian_motion_3d.html %}

<p style="clear: both;"></p>

## Robert Brown, Albert Einstein and Brownian motion
<div class="header_line"><br/></div>

[Brownian motion](https://en.wikipedia.org/wiki/Brownian_motion) is named after its discoverer, 
Robert Brown. The first sound theoretical underpinning came in 
1905 by Einstein, the same year in which he published his first paper on the special theory of relativity, as
well as his paper on the [photo-electric effect](https://en.wikipedia.org/wiki/Photoelectric_effect), 
the latter of which would eventually earn him his Nobel Prize.

<blockquote>
<p>
Einstein developed this statistical molecular theory of liquids for his doctoral dissertation at the University of Zurich. 
In a separate paper, he applied the molecular theory of heat to liquids to explain the puzzle of so-called "Brownian motion".
In 1827, the English botanist Robert Brown noticed that pollen seeds suspended in water moved in an irregular "swarming" motion. 
Einstein then reasoned that if tiny but visible particles were suspended in a liquid, the invisible atoms in the liquid would 
bombard the suspended particles and cause them to jiggle. Einstein explained the motion in detail, accurately predicting the 
irregular, random motions of the particles, which could be directly observed under a microscope.
</p>

<p>
When Einstein's paper first appeared in 1905, the notion of atoms and molecules was still a subject of heated scientific debate. 
Ernst Mach and the physical chemist Wilhelm Ostwald were among those who chose to deny their existence. 
They argued that the laws of thermodynamics need not be based on mechanics, which dictated the existence of invisible atoms in motion. 
Ostwald in particular advocated the view that thermodynamics dealt only with energy and how it is transformed in the everyday world 
(He and his followers were known as "energeticists" as a result).
</p>

<p>
However, by May 1908, Einstein had published a second paper on Brownian motion providing even more detail than his 1905 paper, 
and suggesting a way to test his theory experimentally. That same year, a French physicist named Jean Baptiste Perrin conducted 
a series of experiments that confirmed Einstein's predictions. Perrin wrote that his results 
"cannot leave any doubt of the rigorous exactitude of the formula proposed by Einstein," 
and his work later earned him his own Nobel Prize in Physics, in 1926.
</p>

<p>
Eventually the experimental evidence supporting Einstein's theory of Brownian motion became so compelling that the naysayers 
were forced to accept the existence of material atoms. His fundamental work on applying statistical methods to the random motions 
of Newtonian atoms also led to his insights into the photo electric effect, through the discovery of a critical 
connection between his statistical theory of heat and the behavior of electromagnetic radiation. 
This was the first step in his goal to unify the two fields. 
Thus far, the electromagnetic theory developed by James Clerk Maxwell in the late 19th century had resisted all 
attempts to reduce it to mechanical processes. Einstein set out to do just that. &mdash; 
<a href="https://www.aps.org/archives/publications/apsnews/200502/history.cfm">Einstein and Brownian Motion</a>
on <a href="https://www.aps.org/">aps.org</a>.
</p>
</blockquote><br/>

<p style="clear: both;"></p>

## Maxwell-Boltzmann Distribution: 2D vis à vis 3D
<div class="header_line"><br/></div>

### Maxwell-Boltzmann velocity distributions for $\vec{v}$
<div class="header_line"><br/></div>

The velocity distribution for $f(\vec{v}) , d^n\vec{v}$ is given by

#### 3D case

$$ f(\vec{v}) d^3\vec{v} = \left(\frac{m}{2 \pi k_B T}\right)^{3/2} \exp\Big(-\frac{m v^2}{2 k_B T}\Big) d^3\vec{v}$$

#### 2D case    

$$ f(\vec{v}) d^2\vec{v} = \left(\frac{m}{2 \pi k_B T}\right) \exp\Big(-\frac{m v^2}{2 k_B T}\Big) d^2\vec{v}$$

* We have $v^2 = v_x^2 + v_y^2 + v_z^2$ in 3 dimensions and $v^2 = v_x^2 + v_y^2$ in 2 dimensions.
* Normalisation because the integral volume $d^n\vec{v}$ depends on the dimension.

### Maxwell-Boltzmann velocity distributions for $\|\vec{v}\|$
<div class="header_line"><br/></div>

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

