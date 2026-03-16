{% include breadcrumbs.html %}

# Wave propagation in a pool 🌊
<div class="header_line"><br/></div>

[![Source](https://img.shields.io/badge/github-repo-green?logo=github&label=pool.js)](https://github.com/zhendrikse/science/blob/main/waves/pool.js)&nbsp;&nbsp;
[![JavaScript](https://img.shields.io/badge/JavaScript-007ACC?logo=javascript&logoColor=white)](https://en.wikipedia.org/wiki/JavaScript)&nbsp;&nbsp;
[![Three.js](https://img.shields.io/badge/Three.js-000000?logo=three.js&logoColor=white)](https://threejs.org/)&nbsp;&nbsp;
[![WebGL](https://img.shields.io/badge/WebGL-990000?logo=webgl&logoColor=white)](https://www.khronos.org/webgl/)

## Free wave propagation in empty pool
<div class="header_line"><br/></div>

<div class="canvasWrapper" id="emptyPoolContainer" style="aspect-ratio: 19/12;">
    <canvas id="emptyPoolCanvas" class="applicationCanvas" style="aspect-ratio: 19/12;"></canvas>
    <div class="overlayText" id="emptyPoolOverlayText">Click to start the animation!</div>
</div>
<div class="guiContainer" id="emptyPoolControls"></div>
<script type="module" src="pool.js"></script>
<p style="clear: both;"></p>

## Pool with obstacle
<div class="header_line"><br/></div>

<div class="canvasWrapper" id="poolWithObstacleContainer" style="aspect-ratio: 19/12;">
    <canvas id="poolWithObstacleCanvas" class="applicationCanvas" style="aspect-ratio: 19/12;"></canvas>
    <div class="overlayText" id="poolWithObstacleOverlayText">Click to start the animation!</div>
</div>
<div class="guiContainer" id="poolWithObstacleControls"></div>
<script type="module" src="pool_with_obstacle.js"></script>
<p style="clear: both;"></p>


## Pool with moving obstacle
<div class="header_line"><br/></div>

<div class="canvasWrapper" id="poolWithMovingObstacleContainer" style="aspect-ratio: 19/12;">
    <canvas id="poolWithMovingObstacleCanvas" class="applicationCanvas" style="aspect-ratio: 19/12;"></canvas>
    <div class="overlayText" id="poolWithMovingObstacleOverlayText">Click to start the animation!</div>
</div>
<div class="guiContainer" id="poolWithMovingObstacleControls"></div>
<script type="module" src="pool_with_moving_obstacle.js"></script>
<p style="clear: both;"></p>


## A more sophisticated simulation
<div class="header_line"><br/></div>

[Matthias Müller](https://www.matthiasMueller.info/tenMinutePhysics) wrote
a more sophisticated water simulation that is implemented using a so-called grid-based 
or Eulerian approach. He personally elaborates on this simulation 
in [this video](https://www.youtube.com/watch?v=XmzBREkK8kY) 
on his [Ten Minute Physics](https://www.youtube.com/c/TenMinutePhysics) YouTube channel.

<figure style="float: center; text-align: center;">
  <a href="water.html">
    <img alt="Euler water simulation" src="images/water.png" title="Click to animate"/>
  </a>
  <figcaption>Click on the above image to activate the Euler-based water simulation 
  which was implemented using pure JavaScript by 
  <a href="https://www.matthiasMueller.info/tenMinutePhysics">Matthias Müller</a>.</figcaption>
</figure>

<p style="clear: both;"></p>

{% include share_buttons.html %}