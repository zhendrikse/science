{% include breadcrumbs.html %}

## Real functions $\phi: \mathbb{R}^2 \rightarrow \mathbb{R}^3$
<div class="header_line"><br/></div>

### What are you looking at?

You are looking at a **3D visualization of real-valued functions**

$$
\psi(u, v) = F(u, v), \quad u, v \in \mathbb{R}.
$$


<script src="https://cdn.jsdelivr.net/npm/mathjs@11.11.0/lib/browser/math.js" type="text/javascript"></script>

<div class="titleDiv" id="surface-title"></div>
<div class="equationDiv" id="surface-equation"></div>
<div class="canvasWrapper" id="surface-canvas-container">
    <canvas class="applicationCanvas" id="surfaceCanvas"></canvas>
</div>
<canvas class="applicationCanvas" id="ringCanvas" style="aspect-ratio: 4 / 1;"></canvas>
<div class="guiContainer" id="gui-container"></div>
<script type="module" src="real_surfaces.js"></script>

<p style="clear: both;"></p>

🛠️ The images are generated with [real_surfaces.js](https://github.com/zhendrikse/science/blob/main/mathematics/real_surfaces.js).

{% include share_buttons.html %}