{% include breadcrumbs.html %}

## Spherical harmonics
<div class="header_line"><br/></div>

🔧 [spherical_harmonics.js](https://github.com/zhendrikse/science/blob/main/mathematics/spherical_harmonics.js) is 100% JavaScript and [Three.js](https://threejs.org/)<br/>
👉 Formula is taken from [spherical harmonics](https://paulbourke.net/geometry/sphericalh/) from [Paul Bourke](https://paulbourke.net)

<div class="equationDiv" id="surface-equation"></div>
<div class="canvasWrapper" id="complexPlotContainer">
    <canvas class="applicationCanvas" id="complexPlotCanvas"></canvas><br/>
</div>
<div id="gui-container"></div>
<script type="module" src="spherical_harmonics.js"></script>
<script src="https://cdn.jsdelivr.net/npm/mathjs@11.11.0/lib/browser/math.js" type="text/javascript"></script>


<p style="clear: both;"></p>

{% include share_buttons.html %}