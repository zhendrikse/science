{% include breadcrumbs.html %}

## Modeling a chain drop from table
<div class="header_line"><br/></div>

[![Source](https://img.shields.io/badge/github-repo-green?logo=github&label=chain_drop.js)](https://github.com/zhendrikse/science/blob/main/kinematics/chain_drop.js)&nbsp;&nbsp;
[![JavaScript](https://img.shields.io/badge/JavaScript-007ACC?logo=javascript&logoColor=white)](https://en.wikipedia.org/wiki/JavaScript)&nbsp;&nbsp;
[![Three.js](https://img.shields.io/badge/Three.js-000000?logo=three.js&logoColor=white)](https://threejs.org/)

🎯 How to model a chain as a mass-spring system<br/>
🧠 Based on [original](https://trinket.io/glowscript/bbe791bbfe7d) by Rhett Allain<br/>
👉 Belongs to this [accompanying video](https://www.youtube.com/watch?v=vXp1hW_t-bo)<br/>
🐍 A [VPython demo](https://www.glowscript.org/#/user/zeger.hendrikse/folder/Kinematics/program/Chainfromtable) is available as well, see [chain_drop.py](https://github.com/zhendrikse/physics-in-python/blob/main/vpython/chain_drop.py)<br/>

<link href="https://unpkg.com/uplot/dist/uPlot.min.css" rel="stylesheet">
<script src="https://unpkg.com/uplot/dist/uPlot.iife.min.js"></script>

<div class="canvasWrapper" id="chainDropWrapper" style="aspect-ratio: 19/12">
    <canvas class="applicationCanvas" id="chainDropCanvas" style="aspect-ratio: 19/12"></canvas>
    <div class="overlayText" id="chainDropOverlayText">Click to start the animation!</div>
</div>
<div id="chainPlot"></div>
<script type="module" src="chain_drop.js"></script>

<p style="clear: both;"></p>

{% include share_buttons.html %}