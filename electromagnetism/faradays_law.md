{% include breadcrumbs.html %}

## Faraday&apos;s law of induction
<div class="header_line"><br/></div>

[![Source](https://img.shields.io/badge/github-repo-green?logo=github&label=faradays_law.js)](https://github.com/zhendrikse/science/blob/main/electromagnetism/faradays_law.js)&nbsp;&nbsp;
[![JavaScript](https://img.shields.io/badge/JavaScript-007ACC?logo=javascript&logoColor=white)](https://en.wikipedia.org/wiki/JavaScript)&nbsp;&nbsp;
[![Three.js](https://img.shields.io/badge/Three.js-000000?logo=three.js&logoColor=white)](https://threejs.org/)&nbsp;&nbsp;

🎯 Visualization of the relationship between a changing magnetic field and the induced electric field<br/>
🧠 Inspired by original version on [web page of Rob Salgado](https://www.visualrelativity.com/vpython/)<br/>
🐍 A [VPython demo](https://www.glowscript.org/#/user/zeger.hendrikse/folder/Electromagnetism/program/Faradayslaw) is available as well, see [faradays_law.py](https://github.com/zhendrikse/physics-in-python/blob/main/vpython/faradays_law.py)<br/>
👉 Current through a real wire would have an azimuthal magnetic around the wire<br/>
👉 Faraday’s law<br/>
<p style="clear: both;"></p>

$$\text{In differential form:}\quad \nabla \times \vec{E} = -\frac{\partial \vec{B}}{\partial t}$$

$$\text{In integral form:}\quad \oint \vec{E}\cdot d\vec{l} = -\frac{d\Phi_B}{dt} $$

🔴 Arrows represent the magnetic field change $\frac{\partial \vec{B}}{\partial t}$<br>
🔵 Arrows represent induced electric field $\nabla \times \vec{E} = -\frac{\partial \vec{B}}{\partial t}$<br/>
🟡 Balls visualize the electric charges traveling through the wire.<br/>
🟢 Faraday loops represent the **orientation of the integration loop** used in Faraday’s law. 

These green arrows do **not** necessarily represent the physical electric field direction itself.
Instead, they define the positive circulation direction according to the right-hand rule:

<div class="canvasWrapper" id="faradayLawCanvasWrapper" style="aspect-ratio: 19 / 12;">
    <canvas class="applicationCanvas" id="faradayLawCanvas" style="aspect-ratio: 19/12"></canvas>
    <div class="overlayText" id="faradayLawCanvasOverlay">Click to start the animation!</div>
</div>
<div class="buttonRow">
    <label for="faradayLoopButton">Show Faraday loop <input type="checkbox" id="faradayLoopButton"></label>
</div>
<script type="module" src="faradays_law.js"></script>
<p style="clear: both;"></p>

### Important conceptual points
<div class="header_line"><br/></div>

The simulation distinguishes between:

| Visual Element       | Meaning                         |
| -------------------- | ------------------------------- |
| Green loop direction | chosen mathematical orientation |
| Blue electric field  | physical induced field          |
| Red magnetic arrows  | changing magnetic flux source   |

This separation is important because Faraday’s law relates:

* the circulation of the electric field around a closed path,
* to the time rate of change of magnetic flux through that path.

#### Physical Interpretation of the Minus Sign

The minus sign in Faraday’s law means:

> Nature resists changes in magnetic flux.

If the magnetic field through the loop increases in one direction, the induced electric field circulates in the direction that would generate an opposing magnetic field.
This is the essence of electromagnetic induction and energy conservation.

{% include share_buttons.html %}