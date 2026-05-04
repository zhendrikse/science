{% include breadcrumbs.html %}

## Electric dipole field
<div class="header_line"><br/></div>

[![Source](https://img.shields.io/badge/github-repo-green?logo=github&label=dipole_field.js)](https://github.com/zhendrikse/science/blob/main/electromagnetism/dipole_field.js)&nbsp;&nbsp;
[![JavaScript](https://img.shields.io/badge/JavaScript-007ACC?logo=javascript&logoColor=white)](https://en.wikipedia.org/wiki/JavaScript)&nbsp;&nbsp;
[![Three.js](https://img.shields.io/badge/Three.js-000000?logo=three.js&logoColor=white)](https://threejs.org/)&nbsp;&nbsp;

🎯 Visualization of electric dipole field:

$$
\vec{E} ( \vec{r} ) = -\dfrac {1} {4\pi\epsilon_0} \nabla \bigg( \dfrac{\vec{r}  \cdot \vec{p}} {r^3} \bigg),\quad \vec{p}=+q(\vec{r}_+) + -q(\vec{r}_-)
$$

<canvas id="dipoleCanvas" class="applicationCanvas" style="aspect-ratio: 2/1;"></canvas>
<div class="buttonRow">
    <label for="fieldStrength">Field </label><input type="range" id="fieldStrength" min="0.1" max="2" step="0.01" value="1"/>
    <label for="autoRotate">Auto-rotate </label><input type="checkbox" id="autoRotate"/>
</div>
<script type="module" src="dipole_field.js"></script>
<p style="clear: both;"></p>

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

