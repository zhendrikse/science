{% include breadcrumbs.html %}

## Numeric integration using polar coordinates
<div class="header_line"><br/></div>

🔧 This [integration_with_polar_coordinates.js](https://github.com/zhendrikse/science/blob/main/mathematics/integration_with_polar_coordinates.js) page is a port to JavaScript and [Three.js](https://threejs.org/)<br/>
👉 Based on [original program](https://www.glowscript.org/#/user/wlane/folder/Numerical-Integration-for-Beginners/program/integration-slider-sphere/) by [Let&apos;s code physics](https://www.youtube.com/@LetsCodePhysics)<br/>
⭐ Function that is integrated: $f(\theta, \phi) = \theta^2(\phi - \pi)^2$<br/>
👉 Also refactored to [integration_with_polar_coordinates.py](https://github.com/zhendrikse/science/blob/main/mathematics/code/integration_with_polar_coordinates.py)  by [Zeger Hendrikse](https://www.henrikse.name/)

<div class="titleDiv" id="integral-title"></div>
<div class="canvasWrapper" id="container">
    <canvas class="applicationCanvas" id="integrationCanvas"></canvas><br/>
</div>
<div class="guiContainer" id="gui-container"></div>
<script type="module" src="integration_with_polar_coordinates.js"></script>
<p style="clear: both;"></p>

{% include share_buttons.html %}