{% include breadcrumbs.html %}

# Atomic orbital scatter plots

## Two-dimensional orbitals
<div class="header_line"><br/></div>

<div class="buttonRow">
    <button id="1s">1s</button>
    <button id="2s">2s</button>
    <button id="2p">2p</button>
    <button id="2py">2py</button>
    <button id="3s">3s</button>
</div>
<div class="canvasWrapper" id="atomCanvasContainer">
    <canvas class="applicationCanvas" id="atomCanvas"></canvas>
</div>
<div class="buttonRow">
    <button id="3p">3p</button>
    <button id="3d">3d</button>
    <button id="sp">sp</button>
    <button id="sp2">sp2</button>
    <button id="sp3">sp3</button>
</div>
<script type="module" src="./orbital_scatter_plot_2d.js"></script>
<p style="clear: both;"></p>


## Three-dimensional orbitals
<div class="header_line"><br/></div>

<div class="buttonRow">
    <button id="1s_3d">1s</button>
    <button id="2s_3d">2s</button>
    <button id="2p_3d">2p</button>
    <button id="2py_3d">2py</button>
    <button id="3s_3d">3s</button>
</div>
<div class="canvasWrapper" id="orbitalCanvasContainer">
    <canvas class="applicationCanvas" id="orbitalCanvas"></canvas>
</div>
<div class="buttonRow">
    <button id="3p_3d">3p</button>
    <button id="3d_3d">3d</button>
    <button id="sp_3d">sp</button>
    <button id="sp2_3d">sp2</button>
    <button id="sp3_3d">sp3</button>
</div>
<script type="module" src="./orbital_scatter_plot_3d.js"></script>
<p style="clear: both;"></p>


{% include share_buttons.html %}