{% include breadcrumbs.html %}

## Shells and snails 🐚
<div class="header_line"><br/></div>

🔧 This [shells_snails.js](https://github.com/zhendrikse/science/blob/main/nature/flocking_birds.js) is pure JavaScript, written by [Zeger Hendrikse](https://www.hendrikse.name/)<br/>


<script src="https://cdn.jsdelivr.net/npm/mathjs@11.11.0/lib/browser/math.js" type="text/javascript"></script>

<div class="titleDiv" id="surface-title"></div>
<div class="equationDiv" id="surface-equation"></div>
<div class="canvasWrapper" id="surface-canvas-container">
    <canvas class="applicationCanvas" id="surfaceCanvas"></canvas>
</div>
<canvas class="applicationCanvas" id="ringCanvas" style="aspect-ratio: 4 / 1;"></canvas>
<div class="guiContainer" id="gui-container"></div>
<script type="module" src="shells_snails.js"></script>
<p style="clear: both;"></p>

{% include share_buttons.html %}