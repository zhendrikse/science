{% include breadcrumbs.html %}

## Movement of charged particle in electric field 
<div class="header_line"><br/></div>

[![Source](https://img.shields.io/badge/github-repo-green?logo=github&label=moving_charge.js)](https://github.com/zhendrikse/science/blob/main/electromagnetism/moving_charge.js)&nbsp;&nbsp;
[![JavaScript](https://img.shields.io/badge/JavaScript-007ACC?logo=javascript&logoColor=white)](https://en.wikipedia.org/wiki/JavaScript)&nbsp;&nbsp;
[![Three.js](https://img.shields.io/badge/Three.js-000000?logo=three.js&logoColor=white)](https://threejs.org/)&nbsp;&nbsp;

🎯 Movement of a charged particle in a capacitor field<br/>
🧠 Inspired by [8_Charge_Motion.py](https://github.com/Physics-Morris/Physics-Vpython/blob/master/8_Charge_Motion.py)<br/>
🐍 A [VPython demo](https://www.glowscript.org/#/user/zeger.hendrikse/folder/Electromagnetism/program/Movingcharge) is available as well, see [moving_charge.py](https://github.com/zhendrikse/physics-in-python/blob/main/vpython/moving_charge.py)<br/>

<div class="canvasWrapper" id="movingChargeWrapper" style="aspect-ratio: 19/12">
    <canvas id="movingChargeCanvas" class="applicationCanvas" style="aspect-ratio: 19/12;"></canvas>
    <div class="overlayText" id="movingChargeOverlayText">Click to start the animation!</div>
</div>
<div class="buttonRow">
    <label for="chargeSlider">🪫Charge: </label><input type="range" id="chargeSlider" min="0" max="5" step="0.1" value="1"/>
    <span id="chargeSliderValue">1</span> electron charge(s)
</div>
<div class="buttonRow">
    <label for="speedSlider" >🚀 Speed: </label><input type="range" id="speedSlider" min="1" max="50" step="1" value="15"/>
    <span id="speedSliderValue">15</span> x 1E-14 m/s
</div>
<script type="module" src="moving_charge.js"></script>

<p style="clear: both;"></p>

{% include share_buttons.html %}