{% include breadcrumbs.html %}

## $N$-body oscillator
<div class="header_line"><br/></div>

[![Source](https://img.shields.io/badge/github-repo-green?logo=github&label=n_body_oscillator.js)](https://github.com/zhendrikse/science/blob/main/waves/n_body_oscillator.js)&nbsp;&nbsp;
[![JavaScript](https://img.shields.io/badge/JavaScript-007ACC?logo=javascript&logoColor=white)](https://en.wikipedia.org/wiki/JavaScript)&nbsp;&nbsp;
[![Three.js](https://img.shields.io/badge/Three.js-000000?logo=three.js&logoColor=white)](https://threejs.org/)

<link href="https://unpkg.com/uplot/dist/uPlot.min.css" rel="stylesheet">
<script src="https://unpkg.com/uplot/dist/uPlot.iife.min.js"></script>

<div class="canvasWrapper"  style="aspect-ratio: 2 / 1;">
    <canvas id="oscillatorCanvas" class="applicationCanvas" style="aspect-ratio: 2 / 1;"></canvas>
    <div class="overlayText" id="oscillatorOverlayText">Click to start the animation!</div>
</div>

<div id="oscillatorPlot" style="margin:auto;"></div>
<script type="module" src="n_body_oscillator.js"></script>
<p style="clear: both;"></p>

{% include share_buttons.html %}