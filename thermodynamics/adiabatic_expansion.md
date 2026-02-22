{% include breadcrumbs.html %}

## Adiabatic expansion
<div class="header_line"><br/></div>

You are looking at a simulation of the adiabatic expansion of a gas.
Note that the initial normal distribution of the components of the 
particle velocities does eventually yield a Maxwell-Boltzmann distribution
of velocities in 3D, see for example 
[this form post](https://scicomp.stackexchange.com/questions/19969/how-do-i-generate-maxwell-boltzmann-variates-using-a-uniform-distribution-random).

🔧 [adiabatic_expansion.js](https://github.com/zhendrikse/science/blob/main/thermodynamics/adiabatic_expansion.js) is made with [Three.js](https://threejs.org/) <br/>
⭐ Based on [this code](https://trinket.io/glowscript/67ab1d3d88) on Trinket<br/>
👉 Also available as [adiabatic_expansion.py](https://github.com/zhendrikse/physics-in-python/blob/main/vpython/adiabatic_expansion.py)

<canvas class="applicationCanvas" id="boltzmannCanvas3d"></canvas>
<div class="buttonRow">
    <button id="toggle3d">&nbsp;Pause&nbsp;</button>
    <button id="reset3d">Reset</button>
    <button id="show3d">Show</button>
    <button id="hide3d">Hide</button>
    <button id="add3d">+50</button>
</div>
<div style="margin:auto;">
    <label for="temperatureSlider3d">
        Cold <input type="range" id="temperatureSlider3d" min="0.05" max="2.0" value=".5" step="0.01"/> Hot
    </label>
</div>
<p style="clear: both;"></p>
<div id="plot" style="margin:auto;"></div>
<link rel="stylesheet" href="https://unpkg.com/uplot/dist/uPlot.min.css">
<script src="https://unpkg.com/uplot/dist/uPlot.iife.min.js"></script>
<script type="module" src="adiabatic_expansion.js"></script>

<p style="clear: both;"></p>

{% include share_buttons.html %}



