{% include breadcrumbs.html %}

## Night sky 🔭
<div class="header_line"><br/></div>

🔧 The [nightsky.js](https://github.com/zhendrikse/science/blob/main/astrophysics/nightsky.js) below is 100% JavaScript<br/>
👉 Based on [StarMotion.html](https://physics.weber.edu/schroeder/sky/StarMotion.html) by [Daniel V. Schroeder](https://physics.weber.edu/schroeder/) (Weber State University)<br/>
🛠 Updated, refactored and extended by [Zeger Hendrikse](https://www.hendrikse.name/)

<div id="nightSkyCanvasWrapper" class="canvasWrapper2D" style="aspect-ratio: 2/1;">
    <canvas class="applicationCanvas2D" id="nightSkyCanvas" style="aspect-ratio: 2/1;"></canvas>
</div>

<div class="buttonRow">
    <label for="latSlider">Latitude = <output id="latReadout" for="latSlider">52&deg;</output>
        <input id="latSlider" type="range" min="-90" max="90" step="1" value="52"/>
    </label>
    <label for="bearingSlider">Bearing = <output id="bearingReadout" for="bearingSlider">180&deg;</output>
        <input id="bearingSlider" type="range" min="0" max="360" step="1" value="180"/>
    </label>
</div>
<p style="clear: both;"></p>
<button id="pauseButton"> Start </button>
<script type="module" src="nightsky.js"></script>
<p style="clear: both;"></p>

{% include share_buttons.html %}


