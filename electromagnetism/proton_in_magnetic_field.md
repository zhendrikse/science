{% include breadcrumbs.html %}

# Proton in magnetic field
<div class="header_line"><br/></div>

[![JavaScript](https://img.shields.io/badge/JavaScript-007ACC?logo=javascript&logoColor=white)](https://en.wikipedia.org/wiki/JavaScript)&nbsp;&nbsp;
[![Three.js](https://img.shields.io/badge/Three.js-000000?logo=three.js&logoColor=white)](https://threejs.org/)&nbsp;&nbsp;

## Circular motion
<div class="header_line"><br/></div>

[![Source](https://img.shields.io/badge/github-repo-green?logo=github&label=proton_in_magnetic_field.js)](https://github.com/zhendrikse/science/blob/main/electromagnetism/proton_in_magnetic_field.js)&nbsp;&nbsp;

🎯 Circular motion of a proton in a magnetic field<br/>
🧠 Inspired by [this example](https://www.glowscript.org/#/user/wlane/folder/PHYS152/program/magnetic-field) by [Let&apos;s code physics](https://www.youtube.com/@LetsCodePhysics)<br/>
🐍 A [VPython demo](https://www.glowscript.org/#/user/zeger.hendrikse/folder/Electromagnetism/program/ProtonInMagneticField) is available as well, see [proton_in_magnetic_field.py](https://github.com/zhendrikse/physics-in-python/blob/main/vpython/proton_in_magnetic_field.py)<br/>

<div class="canvasWrapper" id="protonInFieldWrapper" style="aspect-ratio: 19/12">
    <canvas id="protonInFieldCanvas" class="applicationCanvas" style="aspect-ratio: 19/12;"></canvas>
    <div class="overlayText" id="protonInFieldOverlayText">Click to start the animation!</div>
</div>
<div class="buttonRow">
    <label for="protonInFieldStrengthSlider">🧲 Field: </label>
    <input type="range" id="protonInFieldStrengthSlider" min=".1" max="1" step="any" value=".2"/>
    <span id="protonInFieldStrengthSliderValue">10</span>
</div>
<div class="buttonRow">
    <label for="protonInFieldSpeedSlider" >🚀 Speed: </label>
    <input type="range" id="protonInFieldSpeedSlider" min="1" max="100" step="any" value="50"/>
    <span id="protonInFieldSpeedSliderValue">50</span>
</div>
<script type="module" src="proton_in_magnetic_field.js"></script>
<p style="clear: both;"></p>

## Helical motion
<div class="header_line"><br/></div>

[![Source](https://img.shields.io/badge/github-repo-green?logo=github&label=proton_helical_motion.js)](https://github.com/zhendrikse/science/blob/main/electromagnetism/proton_in_magnetic_field.js)&nbsp;&nbsp;

🎯 Circular motion of a proton in a magnetic field<br/>
🧠 Based on [Simple Physics Animations Using VPython](https://towardsdatascience.com/simple-physics-animations-using-vpython-1fce0284606) by Zhiheng Jiang<br/>
🐍 A [VPython demo](https://www.glowscript.org/#/user/zeger.hendrikse/folder/Electromagnetism/program/Helicalmotion) is available as well, see [proton_helical_motion.py](https://github.com/zhendrikse/physics-in-python/blob/main/vpython/proton_helical_motion.py)<br/>

<div class="canvasWrapper" id="helicalProtonCanvasWrapper" style="aspect-ratio: 1/1">
    <canvas id="helicalProtonCanvas" class="applicationCanvas" style="aspect-ratio: 1/1;"></canvas>
    <div class="overlayText" id="helicalProtonCanvasOverlay">Click to start the animation!</div>
</div>
<div class="buttonRow">
    <label for="helicalProtonFieldStrengthSlider">🧲 Field: </label>
    <input type="range" id="helicalProtonFieldStrengthSlider" min=".5" max="5" step="any" value="1"/>
    <span id="helicalProtonFieldStrengthSliderValue">1</span>
</div>
<div class="buttonRow">
    <label for="helicalProtonSpeedSlider" >🚀 Speed: </label>
    <input type="range" id="helicalProtonSpeedSlider" min="1" max="100" step="any" value="50"/>
    <span id="helicalProtonSpeedSliderValue">50</span>
</div>
<div class="buttonRow">
    <label for="helicalProtonChargeSlider" >🪫 charge: </label>
    <input type="range" id="helicalProtonChargeSlider" min=".25" max="5" step="any" value="0.8"/>
    <span id="helicalProtonChargeSliderValue">0.8</span>
</div>
<script type="module" src="proton_helical_motion.js"></script>
<p style="clear: both;"></p>

{% include share_buttons.html %}
