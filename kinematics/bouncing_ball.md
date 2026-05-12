{% include breadcrumbs.html %}

# Bouncing balls
<div class="header_line"><br/></div>

## Bouncing ball on spring
<div class="header_line"><br/></div>

[![Source](https://img.shields.io/badge/github-repo-green?logo=github&label=bouncing_ball_on_spring.js)](https://github.com/zhendrikse/science/blob/main/kinematics/bouncing_ball_on_spring.js)&nbsp;&nbsp;
[![JavaScript](https://img.shields.io/badge/JavaScript-007ACC?logo=javascript&logoColor=white)](https://en.wikipedia.org/wiki/JavaScript)&nbsp;&nbsp;
[![Three.js](https://img.shields.io/badge/Three.js-000000?logo=three.js&logoColor=white)](https://threejs.org/)

🎯 Illustration of the simplicity of the ThreeSim.js library<br/>
🧠 Based on [this original code snippet](https://trinket.io/glowscript/58d3d4ba0b) by Rhett Allain<br/>
⭐ Coding this problem is explained in [this video](https://www.youtube.com/watch?v=ExxDuRTIe0E)<br/>
🐍 A [VPython demo](https://www.glowscript.org/#/user/zeger.hendrikse/folder/Kinematics/program/Ballonspringdrop) is available as well<br/>

<div class="canvasWrapper" id="ballSpringWrapper">
    <canvas class="applicationCanvas" id="ballSpringCanvas"></canvas>
    <div class="overlayText" id="ballSpringOverlayText">Click to start the animation!</div>
</div>
<div class="buttonRow">
    <label for="velocityArrow"><span style="color: cyan">Velocity: </span></label><input type="checkbox" id="velocityArrow" checked/>
    <label for="forceArrow"><span style="color: red">Force: </span></label><input type="checkbox" id="forceArrow" checked/>
</div>
<div class="buttonRow">
    <label for="dampingSlider">🍃 Air resistance: </label>
    <input type="range" id="dampingSlider" min="0" max="1" step="0.1" value=".2"/>
</div>
<script type="module" src="bouncing_ball_on_spring.js"></script>
<p style="clear: both;"></p>

## Bouncing ball
<div class="header_line"><br/></div>

[![Source](https://img.shields.io/badge/github-repo-green?logo=github&label=bouncing_ball_on_floor.js)](https://github.com/zhendrikse/science/blob/main/kinematics/bouncing_ball_on_floor.js)&nbsp;&nbsp;
[![JavaScript](https://img.shields.io/badge/JavaScript-007ACC?logo=javascript&logoColor=white)](https://en.wikipedia.org/wiki/JavaScript)&nbsp;&nbsp;
[![Three.js](https://img.shields.io/badge/Three.js-000000?logo=three.js&logoColor=white)](https://threejs.org/)&nbsp;&nbsp;

🎯 Graphing the kinetic and potential energies of a bouncing ball<br/>
🐍 A [VPython demo](https://www.glowscript.org/#/user/zeger.hendrikse/folder/Kinematics/program/Bouncingball) is available as well, see [bouncing_ball.py](https://github.com/zhendrikse/physics-in-python/blob/main/vpython/bouncing_ball.py)<br/>

<link rel="stylesheet" href="https://unpkg.com/uplot/dist/uPlot.min.css">
<script src="https://unpkg.com/uplot/dist/uPlot.iife.min.js"></script>
<div class="canvasWrapper" id="bouncingBallOnFloorWrapper">
    <canvas class="applicationCanvas" id="bouncingBallOnFloorCanvas" style="aspect-ratio: 19/12"></canvas>
    <div class="overlayText" id="bouncingBallOnFloorOverlayText">Click to start the animation!</div>
</div>
<div id="chart" style="margin: auto;"></div>
<script type="module" src="bouncing_ball_on_floor.js"></script>
<p style="clear: both;"></p>


{% include share_buttons.html %}
