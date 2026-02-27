{% include breadcrumbs.html %}

## Bouncing ball
<div class="header_line"><br/></div>

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
