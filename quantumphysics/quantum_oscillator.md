{% include breadcrumbs.html %}

## Semi-classical visualization of a quantum oscillator
<div class="header_line"><br/></div>

⭐ Original [06_oscillator.py](https://lectdemo.github.io/virtual/06_oscillator.html) by Ruth Chabay 2004<br/>
🔧 Ported to JavaScript and [Three.js](https://threejs.org/) in [quantum_oscillator.js](https://github.com/zhendrikse/science/blob/main/quantumphysics/quantum_oscillator.js)<br/>
👉 A [VPython](https://www.vpython.org/) version is also available as [quantum_oscillator.py](https://github.com/zhendrikse/physics-in-python/blob/main/vpython/quantum_oscillator.py)<br/>
👉 Click on an energy level to put the oscillator into particular state.

<canvas id="applicationCanvas" class="applicationCanvas" style="width: 600px; aspect-ratio: 19/12"></canvas>
<script type="module" src="quantum_oscillator.js"></script>

<p style="clear: both;"></p>

## Quantum Harmonic Oscillator
<div class="header_line"><br/></div>

> It’s not terribly difficult to apply a similar approach of the infinite square well 
> to the simple harmonic oscillator (SHO). What’s the same? There are still energy
> eigenstates (stationary states) that have definite energy (frequency). You can still form
> superpositions of these stationary states to produce more general states that “slosh” in
> time. These superposition states can be used to model realistic scenarios that might occur
> in various situations. What’s different? Well, the potential energy function is pretty different,
> rather than a piecewise constant potential like the infinite square well, or the finite square
> well, the SHO potential is $V (x) = \frac{1}{2}m\omega^2 x^2$, and
> this results in quantitatively different eigenstate energies 
> and wavefunctions. &mdash; [Visualizing Quantum Mechanics with Python](https://www.amazon.com/Visualizing-Quantum-Mechanics-Python-Spicklemire/dp/1032569247)

<p style="clear: both;"></p>

⭐ Idea taken from the book [Visualizing Quantum Mechanics with Python](https://www.amazon.com/Visualizing-Quantum-Mechanics-Python-Spicklemire/dp/1032569247)<br/>
📌 Ported to JavaScript and [Three.js](https://threejs.org/) in [infinite_squarewell_3d.js](https://github.com/zhendrikse/science/blob/main/quantumphysics/infinite_squarewell_3d.js)<br/>

<div class="canvasWrapper" id="shoContainer">
    <canvas id="shoCanvas" class="applicationCanvas"></canvas>
</div>
<div id="expectationPlot" style="margin:auto;"></div>
<div class="guiContainer" id="shoGui"></div>
<script type="module" src="quantum_harmonic_osc_3d.js"></script>
<p style="clear: both;"></p>

👉 The graph shows the expectation value of $x$ as function of time.


## Additional two-dimensional simulation
<div class="header_line"><br/></div>

🔧 This [quantum_harmonic_osc_2d.js](https://github.com/zhendrikse/science/blob/main/quantumphysics/quantum_harmonic_osc_2d.js) is 100% JavaScript<br/>
👉 Based on [HarmonicOscillator.html](https://physics.weber.edu/schroeder/software/HarmonicOscillator.html) by [Daniel V. Schroeder](https://physics.weber.edu/schroeder/), [Weber State University](https://www.weber.edu/)<br/>
🔑 Updated and refactored and by [Zeger Hendrikse](https://www.hendrikse.name/)<br/>
👉 More physics software by [Daniel V. Schroeder](https://physics.weber.edu/schroeder/) can be found [here](https://physics.weber.edu/schroeder/software/)

<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/uplot@1.6.24/dist/uPlot.min.css">
<script src="https://cdn.jsdelivr.net/npm/uplot@1.6.24/dist/uPlot.iife.min.js"></script>
<div id="shoWrapper2D" style="width: 100%; aspect-ratio: 19/12">
    <canvas id="shoCanvas2D" style="width: 100%; aspect-ratio: 19/12"></canvas>
</div>
<div class="buttonRow">
    <label for="speedSlider">Speed:
        <input type="range" id="speedSlider" min="0" max="0.05" step="0.001" value="0.02"/>
    </label>
    <span id="speedValueReadout">0.020</span>
    <button id="pauseButton">Pause</button>
</div>

<div class="buttonRow">
    <input type="radio" name="plotType" id="realImag"/><label for="realImag">Real/imag</label>
    <input type="radio" name="plotType" id="densityPhase" checked/><label for="densityPhase">Density/phase</label>
    <button id="zeroButton">Zero</button>
    <button id="normalizeButton">Normalize</button>
</div>

<div class="buttonRow">
    <button id="alphaButton">Coherent(&alpha;)</button>
    <input type="range" id="alphaSlider" min="0" max="4" step="0.1" value="1"/>
    <label for="alphaSlider">&alpha; =&nbsp;
    <span id="alphaReadout">1.0</span></label>
</div>
<script type="module" src="quantum_harmonic_osc_2d.js"></script>
<p style="clear: both;"></p>

> 

## 📌 The quantum harmonic oscillator 
<div class="header_line"><br/></div>

For the quantum harmonic oscillator:

$$\begin{equation}
\psi_n(x) =
\frac{1}{\sqrt{2^n n! \sqrt{\pi}}}
H_n(x)
e^{-x^2/2}
\end{equation}$$

with energy:

$$
E_n = \hbar \omega (n + 1/2)
$$

it holds that the time evolution is given by:

$$\begin{equation}
\psi_n(x,t) = \psi_n(x) e^{-i (n+1/2)\omega t}
\end{equation}$$

In the code we assume

* dimensionless x
* ℏ = 1
* ω = 1

{% include share_buttons.html %}


