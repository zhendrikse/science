{% include breadcrumbs.html %}

## $N$-body oscillator
<div class="header_line"><br/></div>

[![Source](https://img.shields.io/badge/github-repo-green?logo=github&label=n_body_oscillator.js)](https://github.com/zhendrikse/science/blob/main/waves/n_body_oscillator.js)&nbsp;&nbsp;
[![JavaScript](https://img.shields.io/badge/JavaScript-007ACC?logo=javascript&logoColor=white)](https://en.wikipedia.org/wiki/JavaScript)&nbsp;&nbsp;
[![Three.js](https://img.shields.io/badge/Three.js-000000?logo=three.js&logoColor=white)](https://threejs.org/)

🎯 Modeling an $N$-body mass-spring system<br/>
🐍 A [VPython demo](https://www.glowscript.org/#/user/zeger.hendrikse/folder/Kinematics/program/N-bodycoupledoscillator) is available as well, see [n_body_oscillator.py](https://github.com/zhendrikse/physics-in-python/blob/main/vpython/n_body_oscillator)<br/>

<link href="https://unpkg.com/uplot/dist/uPlot.min.css" rel="stylesheet">
<script src="https://unpkg.com/uplot/dist/uPlot.iife.min.js"></script>

<div class="canvasWrapper" id="oscillatorCanvasWrapper"  style="aspect-ratio: 19 / 12;">
    <canvas id="oscillatorCanvas" class="applicationCanvas" style="aspect-ratio: 19 / 12;"></canvas>
    <div class="overlayText" id="oscillatorOverlay">Click to start the animation!</div>
</div>

<div id="oscillatorPlot" style="margin:auto;"></div>
<script type="module" src="n_body_oscillator.js"></script>
<p style="clear: both;"></p>

<div id="oscillatorPlot" style="margin:auto;"></div>
<script type="module" src="n_body_oscillator.js"></script>
<p style="clear: both;"></p>

{% include share_buttons.html %}