{% include breadcrumbs.html %}

## Complex functions $\phi: \mathbb{C} \rightarrow \mathbb{C}$
<div class="header_line"><br/></div>

### What are you looking at?

You are looking at a **3D visualization of complex-valued functions**

$$
\psi(z) = F(z), \quad z \in \mathbb{C}.
$$

↔️ **Horizontal plane** represents the complex input $z = x + iy$

↕️ **Height** shows the magnitude $\text{height} = \log\left( \|F(z)\|\right)$

🎨 **Color encodes the complex phase** (argument) of $F(z)$:
   colors rotate continuously as the phase winds around zero points

✂️ **Branch cuts** appear as sudden color jumps — places where the phase cannot be made continuous

🔴↔🔵 **Full color cycles** indicate a complete $2\pi$ phase rotation

Height &amp; color reveal how the function **stretches, twists, and folds** the complex plane.

<div class="equationDiv" id="surface-equation"></div>
<div class="canvasWrapper" id="complexPlotContainer">
    <canvas class="applicationCanvas" id="complexPlotCanvas"></canvas><br/>
</div>
<div id="gui-container"></div>
<script type="module" src="complex_surfaces.js"></script>

<p style="clear: both;"></p>

🛠️ The images are generated with [complex_surfaces.js](https://github.com/zhendrikse/science/blob/main/mathematics/complex_surfaces.js).

{% include share_buttons.html %}