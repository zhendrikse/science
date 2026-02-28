{% include breadcrumbs.html %}

## Free wave packet
<div class="header_line"><br/></div>

>  To create a wavefunction that has a finite extent one can multiply a free particle wavefunction with
> a precise momentum (e.g., $\psi(x) = Ae^{ikx}$) by a Gaussian envelope (e.g., $e^{−x2/2a}$) function
> that “clips” the wavefunction in space. The product of these two is a wavefunction whose
> momentum is “smeared” out around the original momentum value by an amount that depends 
> on the size of the Gaussian envelope. If the Gaussian envelope is large, then the
> momentum smears only a little, but if the envelope is small, the momentum will smear a
> lot. This is intuitively clear from the Heisenberg uncertainty principle since the uncertainty
> in the particle’s position is determined by the width of the Gaussian. As the width of the
> Gaussian grows larger the uncertainty in the momentum decreases.
> 
> [&hellip;]
> 
> Note that when the width of the wave packet in real space becomes narrower, the distribution 
> in the Fourier transform (momentum) space becomes broader, and vice versa. This 
> is consistent with the Heisenberg uncertainty principle and is a consequence of the behavior 
> of the Fourier transform between real space and momentum space. What effect does this 
> have on the propagation of the wave packet in space? We’ll see that a wave packet has no
> choice but to broaden over time. Note that the wave packet must be constructed of momentum 
> components with different wavelengths and speeds. As a result, some components will 
> propagate more slowly, and others will propagate more quickly.
> 
> &mdash; [Visualizing Quantum Mechanics with Python](https://www.amazon.com/Visualizing-Quantum-Mechanics-Python-Spicklemire/dp/1032569247)

<p style="clear: both;"></p>

⭐ Idea taken from the book [Visualizing Quantum Mechanics with Python](https://www.amazon.com/Visualizing-Quantum-Mechanics-Python-Spicklemire/dp/1032569247)<br/>
📌 Ported to JavaScript and [Three.js](https://threejs.org/) in [free_wave_packet_3d.js](https://github.com/zhendrikse/science/blob/main/quantumphysics/free_wave_packet_3d.js)<br/>

<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/uplot@1.6.24/dist/uPlot.min.css">
<script src="https://cdn.jsdelivr.net/npm/uplot@1.6.24/dist/uPlot.iife.min.js"></script>
<div class="canvasWrapper" id="freePacketWrapper" style="aspect-ratio: 2/1">
    <canvas id="freePacketCanvas" class="applicationCanvas" style="aspect-ratio: 2/1"></canvas>
</div>
<script type="module" src="free_wave_packet_3d.js"></script>
<div id="expectationPlot" style="margin:auto;"></div>
<p style="clear: both;"></p>


{% include share_buttons.html %}

