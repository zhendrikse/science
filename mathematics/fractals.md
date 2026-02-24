{% include breadcrumbs.html %}

## Fractal shapes
<div class="header_line"><br/></div>

🐢 Turtle-[frractals.html](https://github.com/zhendrikse/science/blob/main/mathematics/code/fractals.html) is 100% JavaScript, written by [Zeger Hendrikse](https://github.com/zhendrikse/) <br/>
🔧 Fractals inspired by [github.com/jeffvun/fractals](https://github.com/jeffvun/fractals/) <br/>
👉 A [VPython](https://vpython.org) version is available as well, see [fractals.py](https://github.com/zhendrikse/physics-in-python/blob/main/vpython/fractals.py)

<div class="canvasWrapper2D" id="canvas-wrapper">
    <canvas class="applicationCanvas2D" id="fractalsCanvas"></canvas>
</div>
<div class="buttonRow">
  <input type="radio" id="kochSnowflake"/><label for="kochSnowflake">&nbsp;Koch snowflake ❄️</label>
  <label for="cesaroFractal"><input type="radio" id="cesaroFractal"/>&nbsp;Cesaro fractal 🏛️</label>
</div>
<div class="buttonRow">
  <input type="radio" id="sierpinskiTriangle"/><label for="sierpinskiTriangle">&nbsp;Sierpinski triangle ⚠️</label>
  <input type="radio" id="tSquareFractal"/><label for="tSquareFractal">&nbsp;T-square fractal 🔶</label>
</div>
<div class="buttonRow">
  <input type="radio" id="dragonCurve"/><label for="dragonCurve">&nbsp;Dragon curve 🐦‍🔥</label>
</div>
<script type="module" src="fractals.js"></script>
<p style="clear: both;"></p>

{% include share_buttons.html %}
