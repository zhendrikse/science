{% include breadcrumbs.html %}

## Fields around a moving charged rod
<div class="header_line"><br/></div>

[![Source](https://img.shields.io/badge/github-repo-green?logo=github&label=charged_rod.js)](https://github.com/zhendrikse/science/blob/main/electromagnetism/charged_rod.js)&nbsp;&nbsp;
[![JavaScript](https://img.shields.io/badge/JavaScript-007ACC?logo=javascript&logoColor=white)](https://en.wikipedia.org/wiki/JavaScript)&nbsp;&nbsp;
[![Three.js](https://img.shields.io/badge/Three.js-000000?logo=three.js&logoColor=white)](https://threejs.org/)&nbsp;&nbsp;

🎯 Illustration of [Faraday's law](./faradays_law.html)<br/>
🧠 Inspired by [MovingLineOfCharge](https://www.glowscript.org/#/user/wlane/folder/PHYS152/program/MovingLineOfCharge) by Ksenja Llazar and Alyssa McCaskey<br/>
🐍 A [VPython demo](https://www.glowscript.org/#/user/zeger.hendrikse/folder/Electromagnetism/program/ChargedSheet) is available as well, see [charged_rod.py](https://github.com/zhendrikse/physics-in-python/blob/main/vpython/charged_rod.py)<br/>
👉 The rod is modeled as a collection of point charges<br/>
👉 Electric field arrows are <span style="color: red">red</span>, magnetic field arrows are <span style="color: blue">blue</span>

<div class="applicationCanvasWrapper" id="chargedRodWrapper" style="aspect-ratio: 3/4">
    <canvas id="chargedRodCanvas" class="applicationCanvas" style="aspect-ratio: 3/4"></canvas>
    <div class="overlayText" id="chargedRodOverlay">Click to start the animation!</div>
</div>
<script type="module" src="charged_rod.js"></script>

<p style="clear: both;"></p>

{% include share_buttons.html %}