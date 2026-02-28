{% include breadcrumbs.html %}

## Numerical methods
<div class="header_line"><br/></div>

📌 Based on [this code](https://trinket.io/glowscript/1fe7d9cdd6) and [accompanying video](https://www.youtube.com/watch?v=dShtlMl69kY)<br/>
📌 Refactored and ported to JavaScript by [Zeger Hendrikse](https://www.hendrikse.name/) to [numerical_methods.js](https://github.com/zhendrikse/science/blob/main/mathematics/numerical_methods.js)<br/>
👉 Also refactored to [numerical_methods.py](https://github.com/zhendrikse/physics-in-python/blob/main/vpython/numerical_methods.py)<br/>

#### Comparison of accuracy of numerical methods:<br/>

- <span style="color: red">Exact solution (red)</span>
- <span style="color: cyan">Euler&apos;s method (cyan)</span>
- <span style="color: orange">Symplectic Euler method (orange)</span>
- <span style="color: purple">Runge-Kutta 2 (purple)</span>
- <span style="color: green">Runge-Kutta 4 (green)</span>

<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/uplot@1.6.24/dist/uPlot.min.css">
<script src="https://cdn.jsdelivr.net/npm/uplot@1.6.24/dist/uPlot.iife.min.js"></script>

<div class="canvasWrapper" id="slinkyWrapper">
    <canvas class="applicationCanvas" id="springCanvas"></canvas>
    <div class="overlayText" id="overlayText">Click to start the animation!</div>
</div>
<div id="plot" style="margin:auto;"></div>
<script type="module" src="numerical_methods.js"></script>
<p style="clear: both;"></p>

#### Numeric integrators and harmonic oscillators

📌 Semi-implicit (= symplectic) Euler $\Rightarrow$ symplectic $\Rightarrow$ energy stays bounded<br/>
📌 Verlet $\Rightarrow$ symplectic $\Rightarrow$ energy oscillates<br/>
📌 RK4 $\Rightarrow$ not symplectic $\Rightarrow$ energy grows slowly.<br/> 

Corollary:

👉 Game engines use Verlet<br/>
👉 Physics engines use symplectic integrators<br/>
👉 RK4 is numerically more accurate per step, but performs worse for Hamiltonian systems in the long run.<br/>

{% include share_buttons.html %}