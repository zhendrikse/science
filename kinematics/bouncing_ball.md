{% include breadcrumbs.html %}

## Bouncing ball
<div class="header_line"><br/></div>

<link rel="stylesheet" href="https://unpkg.com/uplot/dist/uPlot.min.css">
<script src="https://unpkg.com/uplot/dist/uPlot.iife.min.js"></script>
<div class="canvasWrapper" id="bouncingBallWrapper">
    <canvas class="applicationCanvas" id="bouncingBallCanvas"  width="400" height="400"></canvas>
</div>
<div class="buttonRow">
    <button id="bouncingBallButton">Start</button>
</div>
<div id="chart" style="margin: auto;"></div>
<script type="module" src="bouncing_ball.js"></script>

<p style="clear: both;"></p>

{% include share_buttons.html %}