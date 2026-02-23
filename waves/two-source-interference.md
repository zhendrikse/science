{% include breadcrumbs.html %}

## 3D interference of two oscillating sources
<div class="header_line"><br/></div>

🔧 This [3d-two-source-interference.js](https://github.com/zhendrikse/science/blob/main/waves/3d-two-source-interference.js) uses [Three.js](https://threejs.org/)<br/>

<div class="canvasWrapper" id="3dInterferenceWrapper">
    <canvas class="applicationCanvas" id="3dInterferenceCanvas"></canvas><br/>
</div>
<div id="gui-container"></div>
<script type="module" src="3d-two-source-interference.js"></script>

<p style="clear: both;"></p>

## 2D interference of two oscillating sources
<div class="header_line"><br/></div>

🔧 This [2d-two-source-interference.js](https://github.com/zhendrikse/science/blob/main/waves/2d-two-source-interference.js) is 100% JavaScript<br/>
👉 Based on [interference.html](https://physics.weber.edu/schroeder/software/Interference.html) by [Daniel V. Schroeder](https://physics.weber.edu/schroeder/)  (Weber State University)<br/>
🔑 Updated, refactored and extended by [Zeger Hendrikse](https://www.hendrikse.name/)<br/>

<div id="interferenceCanvasWrapper" class="canvasWrapper2D" style="aspect-ratio: 19/12">
    <canvas class="applicationCanvas2D" id="2dInterferenceCanvas"></canvas>
</div>
<p style="clear: both;"></p>
<div style="text-align:center;">
    <label>Distance:
    <input type="range" id="separationSlider" min="0" max="1" step="0.01" value="0.5" />
    </label><br><br>

    <label>k = <output id="kReadout"></output>
    <input type="range" id="kSlider" min="0.01" max="0.3" step="0.005"/>
    </label><br><br>

    <label>ω = <output id="omegaReadout"></output>
    <input type="range" id="omegaSlider" min="0" max="10" step=".1"/>
    </label><br><br>
    <button id="pauseButton">Start</button>
</div>
<script type="module" src="2d-two-source-interference.js"></script>

<p style="clear: both;"></p>

### The physics of superposition
<div class="header_line"><br/></div>

<figure style="text-align: center;">
  <img alt="How gravity shapes the universe" src="images/interference_superposition.jpg" />
  <figcaption>This excellent visual guide originates from 
    <a href="https://www.facebook.com/HouseOfPhysics/">House of Physics</a>.
  </figcaption>
</figure>

{% include share_buttons.html %}