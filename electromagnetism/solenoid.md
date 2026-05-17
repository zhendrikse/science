{% include breadcrumbs.html %}

## Electric field around a [solenoid](https://en.wikipedia.org/wiki/Solenoid)
<div class="header_line"><br/></div>

[![Source](https://img.shields.io/badge/github-repo-green?logo=github&label=solenoid.js)](https://github.com/zhendrikse/science/blob/main/electromagnetism/solenoid.js)&nbsp;&nbsp;
[![JavaScript](https://img.shields.io/badge/JavaScript-007ACC?logo=javascript&logoColor=white)](https://en.wikipedia.org/wiki/JavaScript)&nbsp;&nbsp;
[![Three.js](https://img.shields.io/badge/Three.js-000000?logo=three.js&logoColor=white)](https://threejs.org/)&nbsp;&nbsp;

🎯 Electric field around a solenoid<br/>
🧠 Inspired by [25-4.Bsolenoid](https://glowscript.org/#/user/yizhe/folder/Public/program/25-4.Bsolenoid)<br/>
👉 Field vectors are rendered on a logarithmic scale<br/>
🐍 A [VPython demo](https://www.glowscript.org/#/user/zeger.hendrikse/folder/Electromagnetism/program/Solenoid) is available as well, see [solenoid.py](https://github.com/zhendrikse/physics-in-python/blob/main/vpython/solenoid.py)<br/>

<div class="applicationCanvasWrapper" id="solenoidCanvasWrapper">
    <canvas id="solenoidCanvas" class="applicationCanvas"></canvas>
</div>
<div class="buttonRow">
    <label for="fieldStrength">Field </label>
    <input type="range" id="fieldStrength" min="0.1" max="2" step="0.01" value=".75"/>
    <span id="fieldStrengthSliderValue">.75</span>
    <label for="autoRotate">Auto-rotate </label><input type="checkbox" id="autoRotate"/>
</div>
<script type="module" src="solenoid.js"></script>
<p style="clear: both;"></p>

{% include share_buttons.html %}