{% include breadcrumbs.html %}

## 3D Ising spin model
<div class="header_line"><br/></div>

{% include_relative code/ising_spin.html %}

<p style="clear: both;"></p>

## 2D Ising spin model
<div class="header_line"><br/></div>

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
