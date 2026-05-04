{% include breadcrumbs.html %}

## Real functions $\phi: \mathbb{R}^2 \rightarrow \mathbb{R}^3$
<div class="header_line"><br/></div>

[![Source](https://img.shields.io/badge/github-repo-green?logo=github&label=real_surfaces.js)](https://github.com/zhendrikse/science/blob/main/mathematics/real_surfaces.js)&nbsp;&nbsp;
[![JavaScript](https://img.shields.io/badge/JavaScript-007ACC?logo=javascript&logoColor=white)](https://en.wikipedia.org/wiki/JavaScript)&nbsp;&nbsp;
[![Three.js](https://img.shields.io/badge/Three.js-000000?logo=three.js&logoColor=white)](https://threejs.org/)&nbsp;&nbsp;

🎯 A 3D visualization of real-valued functions

$$
\psi(u, v) = F(u, v), \quad u, v \in \mathbb{R}.
$$



<script src="https://cdn.jsdelivr.net/npm/mathjs@11.11.0/lib/browser/math.js" type="text/javascript"></script>

<div class="titleDiv" id="surface-title"></div>
<div class="equationDiv" id="surface-equation"></div>
<div class="canvasWrapper" id="surface-canvas-container">
    <canvas class="applicationCanvas" id="surfaceCanvas"></canvas>
</div>
<canvas class="applicationCanvas" id="ringCanvas" style="aspect-ratio: 4 / 1;"></canvas>
<div class="guiContainer" id="gui-container"></div>
<script type="module" src="real_surfaces.js"></script>

<p style="clear: both;"></p>

🐍 A [VPython demo](https://www.glowscript.org/#/user/zeger.hendrikse/folder/Math/program/MultivariateFunctions) is available as well, see [multivariate_functions.py](https://github.com/zhendrikse/physics-in-python/blob/main/vpython/bouncing_ball.py)<br/>

{% include share_buttons.html %}