{% include breadcrumbs.html %}

## 2D Fourier transform
<div class="header_line"><br/></div>

[![Source](https://img.shields.io/badge/github-repo-green?logo=github&label=fourier_transform.js)](https://github.com/zhendrikse/science/blob/main/mathematics/fourier_transform.js)&nbsp;&nbsp;
[![JavaScript](https://img.shields.io/badge/JavaScript-007ACC?logo=javascript&logoColor=white)](https://en.wikipedia.org/wiki/JavaScript)&nbsp;&nbsp;

🎯 Proving the wave-like nature of light<br/>
🧠 Inspired by [this application](https://www.falstad.com/fft/) by [Pual Falstad](https://www.falstad.com/)<br>
👉 Related to [Fraunhofer diffraction](../optics/fraunhofer_diffraction.html)

<div style="margin: 0 auto; text-align: center;">
  &nbsp;&nbsp;&nbsp;&nbsp;<canvas id="screen" class="applicationCanvas2D"></canvas>
</div>

<div class="buttonRow">
  <button id="squareButton">🟩 Square</button>
  <button id="circleButton">🟢 Circle </button>
  <label for="diameterSlider">Size:
    <input type="range" id="diameterSlider" min="20" max="50" value="30">
    <span id="diameterValue">30 pixels</span>
  </label>
</div>

<script type="module" src="fourier_transform.js"></script>
<p style="clear:both;"></p>

{% include share_buttons.html %}