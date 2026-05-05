{% include breadcrumbs.html %}

## Bouncing ball
<div class="header_line"><br/></div>

[![Source](https://img.shields.io/badge/github-repo-green?logo=github&label=ball_on_spring.js)](https://github.com/zhendrikse/science/blob/main/kinematics/ball_on_spring.js)&nbsp;&nbsp;
[![JavaScript](https://img.shields.io/badge/JavaScript-007ACC?logo=javascript&logoColor=white)](https://en.wikipedia.org/wiki/JavaScript)&nbsp;&nbsp;
[![Three.js](https://img.shields.io/badge/Three.js-000000?logo=three.js&logoColor=white)](https://threejs.org/)&nbsp;&nbsp;

🎯 Modeling a mass-spring system<br/>
🐍 A [VPython demo](https://www.glowscript.org/#/user/zeger.hendrikse/folder/Kinematics/program/Ballbouncingonspring) is available as well, see [ball_on_spring.py](https://github.com/zhendrikse/physics-in-python/blob/main/vpython/ball_on_spring.py)<br/>

<link rel="stylesheet" href="https://unpkg.com/uplot/dist/uPlot.min.css">
<script src="https://unpkg.com/uplot/dist/uPlot.iife.min.js"></script>
<div class="canvasWrapper" id="bouncingBallWrapper">
    <canvas class="applicationCanvas" id="bouncingBallCanvas"></canvas>
    <div class="overlayText" id="overlayText">Click to start the animation!</div>
</div>
<div id="chart" style="margin: auto;"></div>
<script type="module" src="bouncing_ball.js"></script>

<p style="clear: both;"></p>

{% include share_buttons.html %}
