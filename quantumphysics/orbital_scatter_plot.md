{% include breadcrumbs.html %}

# Atomic orbital scatter plots
<div class="header_line"><br/></div>

- 2s orbital: $\psi_{2s} \propto (2-r)e^{-r/2} \Rightarrow \|\psi\|^2 \propto (2-r)^2 e^{-r}$
- 2p orbital: $\psi_{2p} \propto r e^{-r/2} \cos\theta \Rightarrow \|\psi\|^2 \propto r^2 e^{-r} \cos^2\theta$
- 2py orbital: $\|\psi\|^2 \propto r^2 e^{-r} \sin^2\theta \sin^2\phi$
- 3s orbital: $\psi_{3s} \propto (27 - 18r + 2r^2)e^{-r/3}$
- 3p orbital: $\psi_{3p} \propto r(6-r)e^{-r/3}\cos\theta$
- 3d orbital: $\|\psi\|^2 \propto r^4 e^{-2r/3} \sin^4\theta \cos^2(2\phi)$


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

The 3D-version uses **Monte-Carlo sampling + rejection sampling** based on the probability density $|\psi|^2$,
so per orbital a radial distribution and angular weight is generated.

$$P(r,\theta,\phi) \propto |\psi(r,\theta,\phi)|^2$$

First we generate a **radial candidate**, next **uniform angles**, and accept the point with chance equal to `weight`.


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