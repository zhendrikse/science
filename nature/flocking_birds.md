{% include breadcrumbs.html %}

## Flocking birds 🦅
<div class="header_line"><br/></div>

⭐ Original version created by B. Philhour 10/9/17<br/>
⭐ Inspired by Gary Flake's [Computational Beauty of Nature](https://www.amazon.com/Computational-Beauty-Nature-Explorations-Adaptation/dp/0262561271)<br/>
🔧 Ported to JavaScript and [three.js](https://threejs.org/) in [flocking_birds.js](https://github.com/zhendrikse/science/blob/main/nature/flocking_birds.js) by [Zeger Hendrikse](https://www.hendrikse.name/)<br/>
👉 Available in [VPython](https://vpython.org/) as [flocking_birds.py](https://github.com/zhendrikse/physics-in-python/blob/main/vpython/flocking_birds.py), but significantly slower!<br/>
👉 [Another flocking birds demo](https://threejs.org/examples/webgl_gpgpu_birds.html) can be found on the [three.js](https://threejs.org/) website

<canvas class="applicationCanvas" id="birdsCanvas"></canvas><br/>
<p style="clear: both;"></p>
<label for="randomWeightSlider">Random behavior: <input type="range" min="0" max="50" value="5" class="slider" id="randomWeightSlider"/></label>
<label for="centerWeightSlider">Centering behavior: <input type="range" min="0" max="20" value="1" class="slider" id="centerWeightSlider"/></label>
<label for="directionWeightSlider">Direction behavior: <input type="range" min="0" max="20" value="1" class="slider" id="directionWeightSlider"/></label>
<label for="avoidWeightSlider">Avoidance behavior: <input type="range" min="0" max="20" value="10" class="slider" id="avoidWeightSlider"/></label>
<button class="button" id="startleButton">Startle birds</button>
<script type="module" src="flocking_birds.js"></script>
<p style="clear: both;"></p>

{% include share_buttons.html %}