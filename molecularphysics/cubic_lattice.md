{% include breadcrumbs.html %}

## Cubic lattice model
<div class="header_line"><br/></div>

🔧 [Original code](https://www.glowscript.org/#/user/wlane/folder/Let'sCodePhysics/program/atoms-array) by [Let&apos;s code physics](https://www.youtube.com/@LetsCodePhysics)<br/>
🛠  Refactored and ported to [cubic_lattice.js](https://github.com/zhendrikse/science/blob/main/molecularphysics/cubic_lattice.js) with [Three.js](https://threejs.org/)<br/>
👉 A similar [VPython](https://vpython.org/) version is available as [molecules.py](https://github.com/zhendrikse/pysics-in-python/blob/main/vpython/cubic_lattice.py).

<canvas class="applicationCanvas" id="simulationCanvas" style="aspect-ratio: 1/1"></canvas><br/>
<p style="clear: both;"></p>
<div class="buttonRow">
    <button id="pauseButton">&nbsp;Pause&nbsp;</button>
    <button id="bondTypeButton">Bonds as springs</button>
</div>
<script type="module" src="cubic_lattice.js"></script>

<p style="clear: both;"></p>

### The world of solids
<div class="header_line"><br/></div>

<figure style="text-align: center;">
  <img alt="The world of solids" src="images/the_world_of_solids.jpg" />
  <figcaption>This excellent visual guide originates from 
    <a href="https://www.facebook.com/HouseOfPhysics/">House of Physics</a>.
  </figcaption>
</figure>

<p style="clear: both;"></p>

{% include share_buttons.html %}
