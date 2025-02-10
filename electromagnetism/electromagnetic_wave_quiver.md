{% include breadcrumbs.html %}

## Electromagnetic wave
<div class="header_line"><br/></div>

$\bigg ( v^2\nabla^2 - \dfrac {\partial^2}{{\partial t}^2} \bigg) \vec{E} = 0, \bigg ( v^2\nabla^2 - \dfrac {\partial^2}{{\partial t}^2} \bigg) \vec{B} = 0, v=\dfrac {1} {\sqrt {\mu \epsilon}}$ 

where $v$ is the speed of light (i.e. phase velocity) in a medium with permeability $\mu$, and permittivity $\epsilon$.

{% include_relative code/ElectromagneticWaveQuiver.html %}

<p style="clear: both;"></p>

Electric Field vectors are orange. Magnetic Field vectors are cyan.
The thick green vector representing $\partial \vec{E}/\partial t$ 
is associated with the spatial arrangement of the magnetic field according to
the Ampere-Maxwell law (as evaluated on the green loop).
The sense of circulation on the green loop (by the right-hand rule) determines
the direction of change of the electric field (thumb-direction).

The thick magenta vector representing $\partial \vec{B}/\partial t$
is associated with the spatial arrangement of the electric field according to
the Faraday&apos;s Law (as evaluated on the magenta loop).
The sense of circulation on the magenta loop (by the right-hand rule) determines
the direction of change of the magnetic field (opposite to thumb direction).

Intuitively, $\partial \vec{E}/\partial t$  tells the current value of 
$\vec{E}$ at that point to look like the value of $\vec{E}$ at the point to its left (in this example).
In other words, the pattern of the electric field moves to the **right**.
  
Similarly, $\partial \vec{B}/\partial t$  tells the current value of 
$\vec{B}$ at that point to look like
the value of $\vec{B}$ at the point to its left (in this example).
In other words, the pattern of the magnetic field moves to the **right**.
Thus, this electromagnetic plane wave moves to the right.

<p style="clear: both;"></p>

{% include share_buttons.html %}

