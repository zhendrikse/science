{% include breadcrumbs.html %}

## [Young&apos;s interference experiment](https://en.wikipedia.org/wiki/Double-slit_experiment)
<div class="header_line"><br/></div>

In this visualization, the interference pattern is generated "dynamically", i.e. by calculating
the propagation of the waves using a [finite difference method](https://pythonnumericalmethods.studentorg.berkeley.edu/notebooks/chapter23.03-Finite-Difference-Method.html).

🔧 Original [double slit experiment.py](https://github.com/NelsonHackerman/Random_python_ideas/blob/main/double%20slit%20experiment.py) by [Nelson Hackerman](https://github.com/NelsonHackerman) <br/>
🔧 Ported to Javascript and [three.js](https://threejs.org/) by [Zeger Hendrikse](https://github.com/zhendrikse/), see [dynamic_double_slit.html](https://github.com/zhendrikse/science/blob/main/quantumphysics/code/dynamic_double_slit.html) <br/>
👉 [VPython](https://vpython.org/) version available as [dynamic_double_slit.py](https://github.com/zhendrikse/physics-in-python/blob/main/vpython/dynamic_double_slit.py), but significantly slower!

<div class="canvasWrapper" id="canvas-wrapper">
    <canvas class="applicationCanvas" id="doubleSlitCanvas"></canvas>
</div>
<div class="buttonRow">
    <button id="resetButton">🔄 Reset View</button>&nbsp;&nbsp;
    <label for="slitSizeSlider"><input type="range" min="3" max="25" value="6" class="slider" id="slitSizeSlider"/> Slit size</label>
</div>
<script type="module" src="dynamic_double_slit.js"></script>

<p style="clear: both;"></p>

{% include_relative double_slit_background.md %}

{% include share_buttons.html %}

    