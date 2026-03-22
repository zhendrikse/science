{% include breadcrumbs.html %}

# Free wave packet
<div class="header_line"><br/></div>

[![JavaScript](https://img.shields.io/badge/JavaScript-007ACC?logo=javascript&logoColor=white)](https://en.wikipedia.org/wiki/JavaScript)&nbsp;&nbsp;
[![Three.js](https://img.shields.io/badge/Three.js-000000?logo=three.js&logoColor=white)](https://threejs.org/)&nbsp;&nbsp;

>  To create a wavefunction that has a finite extent one can multiply a free particle wavefunction with
> a precise momentum (e.g., $\psi(x) = Ae^{ikx}$) by a Gaussian envelope (e.g., $e^{−x2/2a}$) function
> that “clips” the wavefunction in space. The product of these two is a wavefunction whose
> momentum is “smeared” out around the original momentum value by an amount that depends
> on the size of the Gaussian envelope. If the Gaussian envelope is large, then the
> momentum smears only a little, but if the envelope is small, the momentum will smear a
> lot. This is intuitively clear from the Heisenberg uncertainty principle since the uncertainty
> in the particle’s position is determined by the width of the Gaussian. As the width of the
> Gaussian grows larger the uncertainty in the momentum decreases.<br/>
> [&hellip;]<br/>
> Note that when the width of the wave packet in real space becomes narrower, the distribution
> in the Fourier transform (momentum) space becomes broader, and vice versa. This
> is consistent with the Heisenberg uncertainty principle and is a consequence of the behavior
> of the Fourier transform between real space and momentum space. What effect does this
> have on the propagation of the wave packet in space? We’ll see that a wave packet has no
> choice but to broaden over time. Note that the wave packet must be constructed of momentum
> components with different wavelengths and speeds. As a result, some components will
> propagate more slowly, and others will propagate more quickly.
> &mdash; [Visualizing Quantum Mechanics with Python](https://www.amazon.com/Visualizing-Quantum-Mechanics-Python-Spicklemire/dp/1032569247)

<p style="clear: both;"></p>

📌 **Highly recommended background information**: [Simulating quantum mechanics with Python](https://ben.land/post/2022/03/09/quantum-mechanics-simulation/)<br/>

## 3D visualization of a free wave packet
<div class="header_line"><br/></div>

[![Source](https://img.shields.io/badge/github-repo-green?logo=github&label=free_wave_packet_3d.js)](https://github.com/zhendrikse/science/blob/main/quantumphysics/free_wave_packet_3d.js)&nbsp;&nbsp;

⭐ Idea taken from the book [Visualizing Quantum Mechanics with Python](https://www.amazon.com/Visualizing-Quantum-Mechanics-Python-Spicklemire/dp/1032569247)<br/>

<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/uplot@1.6.24/dist/uPlot.min.css">
<script src="https://cdn.jsdelivr.net/npm/uplot@1.6.24/dist/uPlot.iife.min.js"></script>
<div class="canvasWrapper" id="freePacketWrapper" style="aspect-ratio: 2/1">
    <canvas id="freePacketCanvas" class="applicationCanvas" style="aspect-ratio: 2/1"></canvas>
    <div class="overlayText" id="overlayText">Click to start the animation!</div>
</div>
<div class="guiContainer" id="freePacketGui"></div>
<script type="module" src="free_wave_packet_3d.js"></script>
<div id="expectationPlot" style="margin:auto;"></div>
<p style="clear: both;"></p>


## Additional two-dimensional simulation
<div class="header_line"><br/></div>

[![Source](https://img.shields.io/badge/github-repo-green?logo=github&label=free_wave_packet_2d.js)](https://github.com/zhendrikse/science/blob/main/quantumphysics/free_wave_packet_2d.js)&nbsp;&nbsp;

⭐ Based on [Wavepackets.html](https://physics.weber.edu/schroeder/software/Wavepackets.html) by [Daniel V. Schroeder](https://physics.weber.edu/schroeder/), [Weber State University](https://www.weber.edu/)<br/>
🔑 Updated and refactored and by [Zeger Hendrikse](https://www.hendrikse.name/)<br/>
⭐ More physics software by [Daniel V. Schroeder](https://physics.weber.edu/schroeder/) can be found [here](https://physics.weber.edu/schroeder/software/)

👉 Click/tap to add a new wavepacket <br/>
👉 Drag vertically to change its shape and horizontally to change its momentum <br/>
👉 Use the controls at right for more careful adjustments<br/>

<div id="freeWavePacketDiv" style="position:relative;">
    <canvas id="freeWavePacketCanvas" style="aspect-ratio: 2/1; width: 100%; position:relative; z-index:1;">Canvas not supported! Please update your browser.</canvas>
</div>
<div class="buttonRow">
    <label for="speedSlider">Speed:
        <input type="range" id="speedSlider" min="1" max="100" step="1" value="10">
    </label>
    <span id="speedValue">0.020</span>
</div>

<div class="buttonRow">
    <input type="radio" name="plotType" id="realImag"/><label for="realImag">Real/imag</label>
    <input type="radio" name="plotType" id="densityPhase" checked/><label for="densityPhase">Density/phase</label>
    <input type="checkbox" id="gridCheck"/><label for="gridCheck">Grid</label>
    <button id="clearButton">Clear</button>
    <button id="pauseButton">Pause</button>
    <button id="addButton">Add packet</button>
</div>
<div class="buttonRow">
    <label for="posSlider">Position:</label>
    <input type="range" id="posSlider" min="80" max="640" step="1" value="100"/>
</div>
<div class="buttonRow">
    <label for="heightSlider">Height:</label>
    <input type="range" id="heightSlider" min="0" max="1.5" step="0.01" value="1.0"/>
</div>
<div class="buttonRow">
    <label for="widthSlider">Width:</label>
    <input type="range" id="widthSlider" min="5" max="100" step="1" value="40"/>
</div>
<div class="buttonRow">
    <label for="momentumSlider">Momentum:</label>
    <input type="range" id="momentumSlider" min="-0.5" max="0.5" step="0.01" value=".25"/>
</div>

<script type="module" src="free_wave_packet_2d.js"></script>
<p style="clear: both;"></p>

> This simulation shows the time evolution of a one-dimensional, nonrelativistic quantum 
> wavefunction that is built out of Gaussian wave packets. There are no forces acting on the particle 
> within the region shown. However, the wavefunction is always zero at the edges of the region, 
> so the particle is effectively trapped in an infinitely deep potential well. 
> When a wavepacket hits an edge it will reflect.
>
> You can select either the real and imaginary parts of the wavefunction
> (shown in orange and blue, respectively), or the probability density and phase.
> The phase is represented by hues going from red (pure real and positive)
> to light green (pure imaginary and positive) to cyan (pure real and negative)
> to purple (pure imaginary and negative) and finally back to red.
>
> **What to look for**: Notice how a wavepacket moves in the direction of increasing phase, 
> although the phase velocity (of the individual waves within a packet) differs from the group 
> velocity (of the packet as a whole). Notice how packets of different widths spread out at 
> different rates. Notice how after this spreading, the wavelength is no longer uniform within the packet. 
> Notice the interference patterns produced when packets overlap or reflect off the edges.
>
> The simulation works by solving a discretized version of the time-dependent Schrödinger equation, 
> as you can see by looking at the source code.
> &mdash; Paraphrased from instructions at [Wavepackets.html](https://physics.weber.edu/schroeder/software/Wavepackets.html)

{% include share_buttons.html %}

