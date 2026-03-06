{% include breadcrumbs.html %}

# Atomic orbital scatter plots
<div class="header_line"><br/></div>

## Two-dimensional orbitals
<div class="header_line"><br/></div>

<div class="buttonRow">
    <button id="1s">&nbsp;1s&nbsp;</button>
    <button id="2s">&nbsp;2s&nbsp;</button>
    <button id="2p">&nbsp;2p&nbsp;</button>
    <button id="2py">&nbsp;2py&nbsp;</button>
    <button id="3s">&nbsp;3s&nbsp;</button>
</div>
<div class="canvasWrapper" id="atomCanvasContainer">
    <canvas class="applicationCanvas" id="atomCanvas"></canvas>
</div>
<div class="buttonRow">
    <button id="3p">&nbsp;3p&nbsp;</button>
    <button id="3d">&nbsp;3d&nbsp;</button>
    <button id="sp">&nbsp;sp&nbsp;</button>
    <button id="sp2">&nbsp;sp2&nbsp;</button>
    <button id="sp3">&nbsp;sp3&nbsp;</button>
</div>
<script type="module" src="./orbital_scatter_plot_2d.js"></script>
<p style="clear: both;"></p>


## Three-dimensional orbitals
<div class="header_line"><br/></div>

<div class="buttonRow">
    <button id="1s_3d">&nbsp;1s&nbsp;</button>
    <button id="2s_3d">&nbsp;2s&nbsp;</button>
    <button id="2p_3d">&nbsp;2p&nbsp;</button>
    <button id="2py_3d">&nbsp;2py&nbsp;</button>
    <button id="3s_3d">&nbsp;3s&nbsp;</button>
</div>
<div class="canvasWrapper" id="orbitalCanvasContainer">
    <canvas class="applicationCanvas" id="orbitalCanvas"></canvas>
</div>
<div class="buttonRow">
    <button id="3p_3d">&nbsp;3p&nbsp;</button>
    <button id="3d_3d">&nbsp;3d&nbsp;</button>
    <button id="sp_3d">&nbsp;sp&nbsp;</button>
    <button id="sp2_3d">&nbsp;sp2&nbsp;</button>
    <button id="sp3_3d">&nbsp;sp3&nbsp;</button>
</div>
<script type="module" src="./orbital_scatter_plot_3d.js"></script>
<p style="clear: both;"></p>


{% include share_buttons.html %}