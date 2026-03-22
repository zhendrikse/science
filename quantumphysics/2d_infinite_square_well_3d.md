{% include breadcrumbs.html %}

## A 2D square well visualized in 3D
<div class="header_line"><br/></div>

[![Source](https://img.shields.io/badge/github-repo-green?logo=github&label=2d_infinite_square_well_3d.js)](https://github.com/zhendrikse/science/blob/main/quantumphysics/2d_infinite_square_well_3d.js)&nbsp;&nbsp;
[![JavaScript](https://img.shields.io/badge/JavaScript-007ACC?logo=javascript&logoColor=white)](https://en.wikipedia.org/wiki/JavaScript)&nbsp;&nbsp;
[![Three.js](https://img.shields.io/badge/Three.js-000000?logo=three.js&logoColor=white)](https://threejs.org/)&nbsp;&nbsp;

⭐ Idea taken from the book [Visualizing Quantum Mechanics with Python](https://www.amazon.com/Visualizing-Quantum-Mechanics-Python-Spicklemire/dp/1032569247)<br/>
📌 **Highly recommended background information**: [Visualizing complex numbers and wavefunctions in one and two dimensions](https://ben.land/post/2022/03/17/complex-wavefunction-visualization/)<br/>

👉 vertical cylinders represent the complex value of the wave function<br/>
👉 height $\propto$ to the real part of the wavefunction <br/>
👉 radius $\propto$ to the imaginary part <br/>
👉 the color represents the value of the phase factor <br/>
👉 the systems evolves by summing the Fourier coefficients times the eigenstate

<div class="canvasWrapper" id="iswWaveContainer">
    <canvas class="applicationCanvas" id="iswWaveCanvas"></canvas>
    <div class="overlayText" id="isw3dOverlayText">Click to start the animation!</div>
</div>
<script type="module" src="2d_infinite_square_well_3d.js"></script>

<p style="clear: both;"></p>

> A 2D Infinite Square Well (ISW) is a potential well that has zero potential energy over
> a finite domain in two directions, say the $x$- and $y$-directions, and is infinite outside that
> domain. The simplest case is a rectangular domain in the $xy$-plane with sides $L_x$ and $L_y$.
> In this case the 2D time-independent Schrödinger wave equation factors into two 1D 
> time-independent Schrödinger wave equations, one in the $x$-direction and one
> in the $y$-direction. The wavefunction is then a product of the two 1D wavefunctions. The
> wavefunction is then given by a superposition of energy eigenstate wavefunctions of the
> form $\psi_{nm}(x, y) = A \sin(n\pi x/L_x) \sin(n\pi y/L_y )$.
> &mdash; [Visualizing Quantum Mechanics with Python](https://www.amazon.com/Visualizing-Quantum-Mechanics-Python-Spicklemire/dp/1032569247)

{% include share_buttons.html %}