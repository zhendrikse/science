{% include breadcrumbs.html %}

## 3D Ising spin model
<div class="header_line"><br/></div>

{% include_relative code/ising_spin.html %}

<p style="clear: both;"></p>

## 2D Ising spin model
<div class="header_line"><br/></div>

🔧 The [ising_spin_2d.js](https://github.com/zhendrikse/science/blob/main/thermodynamics/ising_spin_2d.js) below is 100% JavaScript<br/>
👉 Based on [isingHTML5.html](https://physics.weber.edu/thermal/isingHTML5.html) by [Daniel V. Schroeder](https://physics.weber.edu/schroeder/) (Weber State University)<br/>
👉 For use with [An Introduction to Thermal Physics](http://physics.weber.edu/thermal/)<br/>
🔑 Updated, refactored and extended by [Zeger Hendrikse](https://www.hendrikse.name/)<br/>

<div id="isingSpingCanvasWrapper" class="canvasWrapper2D" style="aspect-ratio: 1/1;">
    <canvas id="2dIsingCanvas" class="applicationCanvas2D"></canvas>
</div>
<div style="margin-top: 10px; text-align:center;">
    <label for="tempSlider">
        Temperature = <output id="tempReadout" for="tempSlider">2.27</output>
    </label>
    <input id="tempSlider" type="range" min="0.01" max="9.99" step="0.01" value="2.27"/>
    <button id="pauseButton">Start</button>
</div>

<p style="clear: both;"></p>

{% include share_buttons.html %}
