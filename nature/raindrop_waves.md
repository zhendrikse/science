{% include breadcrumbs.html %}

## Raindrops falling in a pond ☔
<div class="header_line"><br/></div>

- Based on [this example](https://beltoforion.de/de/unterhaltungsmathematik/2d-wellengleichung.php) 
  from [Recreational Mathematics with Python](https://github.com/beltoforion/recreational_mathematics_with_python)
- Ported to JavaScript and [three.js](https://threejs.org/) by [Zeger Hendrikse](https://github.com/zhendrikse/), see 
  [raindrop_waves.js](https://github.com/zhendrikse/science/blob/main/nature/raindrop_waves.js)
- Also available in [VPython](https://vpython.org/) as 
  [raindrop_waves.py](https://github.com/zhendrikse/physics-in-python/blob/main/vpython/raindrop_waves.py), but significantly slower!

<canvas class="applicationCanvas" id="raindropCanvas" style="aspect-ratio: 4 / 3;"></canvas>
<div class="guiContainer" id="raindropsGui"></div>
<script type="module" src="raindrop_waves.js"></script>
<p style="clear: both;"></p>

{% include share_buttons.html %}