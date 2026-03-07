{% include breadcrumbs.html %}

## Quantum barrier scattering
<div class="header_line"><br/></div>

<link href="https://unpkg.com/uplot/dist/uPlot.min.css" rel="stylesheet"/>
<script src="https://unpkg.com/uplot/dist/uPlot.iife.min.js"></script>

<div class="canvasWrapper" id="barrier3dWrapper">
    <canvas class="applicationCanvas" id="barrier3dCanvas"></canvas>
    <div class="overlayText" id="barrier3dOverlayText">Click to start the animation!</div>
</div>
<div id="barrier3dGui" class="guiContainer">
</div>
<script type="module" src="quantum_barrier_3d.js"></script>
<p style="clear: both;"></p>

## Additional two-dimensional simulation
<div class="header_line"><br/></div>



> This simulation shows a quantum mechanical wavepacket hitting a barrier. 
> You can adjust the wavepacket’s nominal energy, the barrier energy, the barrier width, 
> and the width of a “ramp” on either side of the barrier, to see how these affect the amount 
> of the wavepacket that gets through (i.e., the tunneling probability). 
> Drag the width slider all the way to the right to make a step instead of a barrier.
>
> The wavefunction is always zero at the edges of the image, so the quantum particle is effectively 
> trapped in an infinitely deep potential well. Thus, when the wavepacket hits the edges, 
> it will reflect off of them.
>
> You can select either the real and imaginary parts of the wavefunction 
> (shown in orange and blue, respectively), or the probability density and phase. 
> The phase is represented by hues going from red (pure real and positive) 
> to light green (pure imaginary and positive) to cyan (pure real and negative) 
> to purple (pure imaginary and negative) and finally back to red.
>
> Play with the simulation for a while, then try to predict what will happen when 
> you change the various settings. How does the wavepacket behave when there is no barrier at all? 
> How can you tell, when the simulation is paused, whether the wavepacket is moving to the left or right? 
> How does the wavelength within the packet vary as you change its energy? 
> Under what conditions will most of the wavepacket make it through the barrier? 
> In what ways does the wavepacket behave like a classical particle?
>
> Technical details: The simulation works by solving a discretized version of the time-dependent Schrödinger equation, 
> as you can see by looking at the source code. Distances are measured in units of nominal screen pixels, and the grid 
> spacing is 20 pixels. Other units are determined by setting h-bar and the particle mass to 1. This is a nonrelativistic 
> particle, so its kinetic energy is $p^2/2m$. From this formula and the de Broglie relation you can figure out how the 
> energy of a wavefunction is related to its wavelength. A wavepacket is actually a mixture that includes a range of 
> energies, so the uncertainty (standard deviation) in the energy is displayed next to the energy slider. Notice also that 
> the phase velocity (of the individual waves within the wavepacket) differs from the group velocity (of the packet as 
> a whole). &mdash; [BarrierScattering.html](https://physics.weber.edu/schroeder/software/BarrierScattering.html)


{% include share_buttons.html %}