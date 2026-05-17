{% include breadcrumbs.html %}

## Electron movement in electric field of a charged plate
<div class="header_line"><br/></div>

[![Source](https://img.shields.io/badge/github-repo-green?logo=github&label=charged_sheet.js)](https://github.com/zhendrikse/science/blob/main/electromagnetism/moving_charge.js)&nbsp;&nbsp;
[![JavaScript](https://img.shields.io/badge/JavaScript-007ACC?logo=javascript&logoColor=white)](https://en.wikipedia.org/wiki/JavaScript)&nbsp;&nbsp;
[![Three.js](https://img.shields.io/badge/Three.js-000000?logo=three.js&logoColor=white)](https://threejs.org/)&nbsp;&nbsp;

🎯 Movement of a charged particle in a field of a charged plate<br/>
🧠 Inspired by [this demo](https://trinket.io/glowscript/38fbc7b2d01d) Byron Philhour<br/>
🐍 A [VPython demo](https://www.glowscript.org/#/user/zeger.hendrikse/folder/Electromagnetism/program/ChargedSheet) is available as well, see [charged_sheet.py](https://github.com/zhendrikse/physics-in-python/blob/main/vpython/charged_sheet.py)<br/>

<div class="canvasWrapper" id="chargedSheetWrapper">
    <canvas class="applicationCanvas" id="chargedSheetCanvas"></canvas>
    <div class="overlayText" id="chargedSheetOverlay">Click to start the animation!</div>
</div>
<script type="module" src="charged_sheet.js"></script>
<p style="clear: both;"></p>

{% include share_buttons.html %}