{% include breadcrumbs.html %}

## The three-body problem
<div class="header_line"><br/></div>

🔧 This [three_body.html](https://github.com/zhendrikse/science/blob/main/kinematics/code/three_body.html) uses [Three.js](https://threejs.org/) <br/>
⭐ Based on [this original code snippet](https://trinket.io/glowscript/9ece3648f0) by Rhett Allain<br/>
⭐ Coding this problem is explained in [this video](https://www.youtube.com/watch?v=Ye2wIV8-SB8)<br/>
👉 Also available in [VPython](https://vpython.org) as [three_body.py](https://github.com/zhendrikse/physics-in-python/blob/main/vpython/three_body.py)

<script type="importmap">
    {
      "imports": {
        "three": "https://unpkg.com/three@0.182.0/build/three.module.js",
        "three/addons/": "https://unpkg.com/three@0.182.0/examples/jsm/"
      }
    }
</script>

<div class="canvasWrapper" id="threeBodyWrapper">
    <canvas class="applicationCanvas" id="threeBodyCanvas"></canvas>
    <div class="overlayText" id="overlayText">Click to start the animation!</div>
</div>

<script type="module" src="three_body.js"></script>

<p style="clear:both;"></p>

{% include share_buttons.html %}