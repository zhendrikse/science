{% include breadcrumbs.html %}

## Dropping a slinky spring
<div class="header_line"><br/></div>

[![Source](https://img.shields.io/badge/github-repo-green?logo=github&label=slinky_drop.js)](https://github.com/zhendrikse/science/blob/main/kinematics/slinky_drop.js)&nbsp;&nbsp;
[![JavaScript](https://img.shields.io/badge/JavaScript-007ACC?logo=javascript&logoColor=white)](https://en.wikipedia.org/wiki/JavaScript)&nbsp;&nbsp;
[![Three.js](https://img.shields.io/badge/Three.js-000000?logo=three.js&logoColor=white)](https://threejs.org/)

🎯 Understanding the free fall of a slinky spring<br/>
🧠 Based on [this original code snippet](https://trinket.io/glowscript/e5f14ebee1) by Rhett Allain<br/>
⭐ His code belongs to [this article](https://rhettallain.com/2019/02/06/modeling-a-falling-slinky/)<br/>
🐍 A [VPython demo](https://www.glowscript.org/#/user/zeger.hendrikse/folder/Kinematics/program/Slinkydrop) is available as well, see [slinky_drop.py](https://github.com/zhendrikse/physics-in-python/blob/main/vpython/slinky_drop.py)<br/>

<div class="canvasWrapper" id="slinkyWrapper">
    <canvas class="applicationCanvas" id="slinkyCanvas"></canvas>
    <div class="overlayText" id="overlayText">Click to start the animation!</div>
</div>
<script type="module" src="slinky_drop.js"></script>

<p style="clear: both;"></p>

{% include share_buttons.html %}