{% include breadcrumbs.html %}

## Proton in magnetic field
<div class="header_line"><br/></div>

[![Source](https://img.shields.io/badge/github-repo-green?logo=github&label=proton_in_magnetic_field.js)](https://github.com/zhendrikse/science/blob/main/electromagnetism/proton_in_magnetic_field.js)&nbsp;&nbsp;
[![JavaScript](https://img.shields.io/badge/JavaScript-007ACC?logo=javascript&logoColor=white)](https://en.wikipedia.org/wiki/JavaScript)&nbsp;&nbsp;
[![Three.js](https://img.shields.io/badge/Three.js-000000?logo=three.js&logoColor=white)](https://threejs.org/)&nbsp;&nbsp;

🎯 Movement of helical motion of a proton in a magnetic field<br/>
🧠 Inspired by [this example](https://www.glowscript.org/#/user/wlane/folder/PHYS152/program/magnetic-field) by [Let&apos;s code physics](https://www.youtube.com/@LetsCodePhysics)<br/>
🐍 A [VPython demo](https://www.glowscript.org/#/user/zeger.hendrikse/folder/Electromagnetism/program/ProtonInMagneticField) is available as well, see [proton_in_magnetic_field.py](https://github.com/zhendrikse/physics-in-python/blob/main/vpython/proton_in_magnetic_field.py)<br/>

<div class="canvasWrapper" id="protonInFieldWrapper" style="aspect-ratio: 19/12">
    <canvas id="protonInFieldCanvas" class="applicationCanvas" style="width: 600px; aspect-ratio: 19/12;"></canvas>
    <div class="overlayText" id="protonInFieldOverlayText">Click to start the animation!</div>
</div>
<div class="buttonRow">
    <div class="buttonRow">
        <label for="protonInFieldStrengthSlider">🧲 Field: </label>
        <input type="range" id="protonInFieldStrengthSlider" min="1" max="10" step="0.1" value="2"/>
        <span id="protonInFieldStrengthSliderValue">10</span>
    </div>
    <label for="protonInFieldSpeedSlider" >🚀 Speed: </label>
    <input type="range" id="protonInFieldSpeedSlider" min="1" max="100" step="1" value="50"/>
    <span id="protonInFieldSpeedSliderValue">50</span>
</div>
<script type="module" src="proton_in_magnetic_field.js"></script>

<p style="clear: both;"></p>

{% include share_buttons.html %}