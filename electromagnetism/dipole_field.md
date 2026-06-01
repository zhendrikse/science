{% include breadcrumbs.html %}

## Electric dipole field
<div class="header_line"><br/></div>

[![Source](https://img.shields.io/badge/github-repo-green?logo=github&label=dipole_field.js)](https://github.com/zhendrikse/helion/blob/main/examples/electromagnetism/scenes/dipole_field.js)&nbsp;&nbsp;
[![JavaScript](https://img.shields.io/badge/JavaScript-007ACC?logo=javascript&logoColor=white)](https://en.wikipedia.org/wiki/JavaScript)&nbsp;&nbsp;
[![Three.js](https://img.shields.io/badge/Three.js-000000?logo=three.js&logoColor=white)](https://threejs.org/)&nbsp;&nbsp;

🎯 Visualization of electric dipole field:

$$
\vec{E} ( \vec{r} ) = -\dfrac {1} {4\pi\epsilon_0} \nabla \bigg( \dfrac{\vec{r}  \cdot \vec{p}} {r^3} \bigg),\quad \vec{p}=+q(\vec{r}_+) + -q(\vec{r}_-)
$$

<div class="applicationCanvasWrapper" id="dipoleCanvasWrapper" style="aspect-ratio: 19 / 12;">
    <canvas id="dipoleCanvas" class="applicationCanvas" style="aspect-ratio: 19/12;"></canvas>
</div>
<div class="buttonRow">
    <label for="fieldStrengthSlider">Field </label><input type="range" id="fieldStrengthSlider" min="0" max=".5" step="any" value="0.25"/>
    <span id="fieldStrengthSliderValue">0.25</span>
    <label for="autoRotate">Auto-rotate </label><input type="checkbox" id="autoRotate"/>
</div>
<script type="module" src="https://www.hendrikse.name/helion/examples/dipole_field.js"></script>

🧠 Inspired by [7_Dipole.py](https://github.com/Physics-Morris/Physics-Vpython/blob/master/7_Dipole.py)<br/>
🐍 A [VPython demo](https://www.glowscript.org/#/user/zeger.hendrikse/folder/Electromagnetism/program/Electricdipolefield) is available as well, see [dipole_field.py](https://github.com/zhendrikse/physics-in-python/blob/main/vpython/circular_aperture.py)<br/>

### Understanding electric fields
<div class="header_line"><br/></div>

<div class="double_image">
<figure class="left_image">
  <a href="images/electric_field.jpg">
    <img alt="Our planets" src="images/electric_field.jpg"/>
  </a>
  <figcaption>This visual originates from 
    <a href="https://www.facebook.com/HouseOfPhysics/">House of Physics</a>.</figcaption>
</figure>
<figure class="right_image">
  <a href="images/electric_field_intensity.jpg">
    <img alt="Our planets" src="images/electric_field_intensity.jpg"/>
  </a>
  <figcaption>This visual originates from 
    <a href="https://www.facebook.com/HouseOfPhysics/">House of Physics</a>.</figcaption>
</figure>
</div>
<p style="clear: both;"></p>


{% include share_buttons.html %}

