{% include breadcrumbs.html %}

## Numerical methods
<div class="header_line"><br/></div>

🔧 This [integration_with_polar_coordinates.js](https://github.com/zhendrikse/science/blob/main/mathematics/integration_with_polar_coordinates.js) page is a port to JavaScript and [Three.js](https://threejs.org/)<br/>
👉 Based on [original program](https://www.glowscript.org/#/user/wlane/folder/Numerical-Integration-for-Beginners/program/integration-slider-sphere/) by [Let&apos;s code physics](https://www.youtube.com/@LetsCodePhysics)<br/>
⭐ Function that is integrated: $f(\theta, \phi) = \theta^2(\phi - \pi)^2$<br/>
👉 Also refactored to [integration_with_polar_coordinates.py](https://github.com/zhendrikse/science/blob/main/mathematics/code/integration_with_polar_coordinates.py)  by [Zeger Hendrikse](https://www.henrikse.name/)


👉 Based on [this code](https://trinket.io/glowscript/1fe7d9cdd6) and [accompanying video](https://www.youtube.com/watch?v=dShtlMl69kY)<br/>
🔧 Refactored and ported to JavaScript by [Zeger Hendrikse](https://www.hendrikse.name/) to [numerical_methods.js](https://github.com/zhendrikse/science/blob/main/mathematics/numerical_methods.js)<br/>
👉 Also refactored to [numerical_methods.py](https://github.com/zhendrikse/physics-in-python/blob/main/vpython/numerical_methods.py)<br/>

⭐ Comparison of accuracy of numerical methods:<br/>

- <span style="color: red">Exact solution (red)</span>
- <span style="color: cyan">Euler&apos;s method (cyan)</span>
- <span style="color: orange">Implicit Euler method (orange)</span>
- <span style="color: purple">Runge-Kutta 2 (purple)</span>
- <span style="color: green">Runge-Kutta 4 (green)</span>

<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/uplot@1.6.24/dist/uPlot.min.css">
<script src="https://cdn.jsdelivr.net/npm/uplot@1.6.24/dist/uPlot.iife.min.js"></script>

<div class="canvasWrapper" id="slinkyWrapper">
    <canvas class="applicationCanvas" id="springCanvas" style="aspect-ratio: 1 /1; width: 600px; background: black; "></canvas>
    <div class="overlayText" id="overlayText">Click to start the animation!</div>
</div>
<div id="plot" style="margin:auto;"></div>
<script type="module" src="numerical_methods.js"></script>
<p style="clear: both;"></p>

{% include share_buttons.html %}