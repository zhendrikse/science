{% include breadcrumbs.html %}

## The DNA double helix 🧬
<div class="header_line"><br/></div>

🔧 [Original idea and code](https://trinket.io/glowscript/7ba54885924b) by Francisco Adeil Gomes Araujo
🛠 This [dna.js](https://github.com/zhendrikse/science/blob/main/molecularphysics/dna.js) is a port to Javascript and [Three.js](https://threejs.org/) by [Zeger Hendrikse](https://www.hendrikse.name/)
👉 I have also refactored the original [VPython](https://vpython.org) code, see [dna.py](https://github.com/zhendrikse/physics-in-python/blob/main/vpython/dna.py)

<script src="https://cdn.jsdelivr.net/npm/lil-gui@0.18"></script>
<div class="canvasWrapper" id="dnaCanvasWrapper">
    <canvas class="applicationCanvas" id="dnaCanvas"></canvas>
</div>
<div class="gui-container" id="gui_container"></div>
<script type="module" src="dna.js"></script>

<p style="clear: both;"></p>

{% include share_buttons.html %}