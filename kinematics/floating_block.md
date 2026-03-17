{% include breadcrumbs.html %}

## Floating block movement in water
<div class="header_line"><br/></div>

[![Source](https://img.shields.io/badge/github-repo-green?logo=github&label=floating_block.js)](https://github.com/zhendrikse/science/blob/main/kinematics/floating_block.js)&nbsp;&nbsp;
[![JavaScript](https://img.shields.io/badge/JavaScript-007ACC?logo=javascript&logoColor=white)](https://en.wikipedia.org/wiki/JavaScript)&nbsp;&nbsp;
[![Three.js](https://img.shields.io/badge/Three.js-000000?logo=three.js&logoColor=white)](https://threejs.org/)

⭐ Based on [buoyancy.py](https://github.com/gcschmit/vpython-physics/blob/master/buoyancy/buoyancy.py)<br/>

<link href="https://unpkg.com/uplot/dist/uPlot.min.css" rel="stylesheet">
<script src="https://unpkg.com/uplot/dist/uPlot.iife.min.js"></script>

<div class="canvasWrapper" id="floatingBlockContainer">
    <canvas id="floatingBlockCanvas" class="applicationCanvas"></canvas>
    <div class="overlayText" id="floatingBlockOverlayText">Click to start the animation!</div>
</div>
<div id="forceChart" style="margin:auto;"></div>
<script type="module" src="floating_block.js"></script>
<p style="clear: both;"></p>

{% include share_buttons.html %}