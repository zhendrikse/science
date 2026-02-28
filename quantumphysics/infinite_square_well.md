{% include breadcrumbs.html %}

## A one-dimensional particle in a box
<div class="header_line"><br/></div>

> The Infinite Square Well (ISW) is an idealization of a physical system that strictly prohibits
> the particle from straying beyond a certain range of x-values, but exerts no influence over
> the particle within those limits. So the particle is “free” to roam, but only over a prescribed
> range on the x-axis. &mdash; [Visualizing Quantum Mechanics with Python](https://www.amazon.com/Visualizing-Quantum-Mechanics-Python-Spicklemire/dp/1032569247) 

<p style="clear: both;"></p>

⭐ Idea taken from the book [Visualizing Quantum Mechanics with Python](https://www.amazon.com/Visualizing-Quantum-Mechanics-Python-Spicklemire/dp/1032569247)<br/>
📌 Ported to JavaScript and [Three.js](https://threejs.org/) in [infinite_square_well_3d.js](https://github.com/zhendrikse/science/blob/main/quantumphysics/infinite_square_well_3d.js)<br/>
📌 A [VPython](https://www.vpython.org/) version is also available as [infinite_squarewell.py](https://github.com/zhendrikse/physics-in-python/blob/main/vpython/infinite_squarewell.py)

👉 Note that the energy of the eigenstates go like $n^2$. For example, we observe that the $n = 2$
state has four times the energy, and therefore four times the frequency of the ground state $n = 1$.


<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/uplot@1.6.24/dist/uPlot.min.css">
<script src="https://cdn.jsdelivr.net/npm/uplot@1.6.24/dist/uPlot.iife.min.js"></script>
<div class="canvasWrapper" id="infiniteWellContainer">
    <canvas id="infiniteWellCanvas" class="applicationCanvas"></canvas>
</div>
<div id="expectationPlot" style="margin:auto;"></div>
<div class="guiContainer" id="infiniteWellGui"></div>
<script type="module" src="infinite_square_well_3d.js"></script>
<p style="clear: both;"></p>

👉 The graph shows the expectation value of $x$ as function of time.

$$\begin{equation}
\langle x \rangle(t)= \int x |\psi(x,t)|^2 dx \approx \frac{\sum x_i |\psi_i|^2}{\sum |\psi_i|^2}
\end{equation}$$

When we choose one eigen state, we have

$$\begin{equation}
|\psi(x,t)|^2 = |\psi(x)|^2
\end{equation}$$

which implies no time dependency and hence, $\langle x \rangle$ 
is constant, which makes sense in the physical world: stationary states don't move!
Only when we choose a superposition of states, we get an oscillation in the plot:

$$\begin{equation}
\langle x \rangle (t)
\sim
\cos((E_1 - E_0)t)
\end{equation}$$


## Additional two-dimensional simulation
<div class="header_line"><br/></div>

🔧 This [infinite_square_well_2d.js](https://github.com/zhendrikse/science/blob/main/quantumphysics/infinite_square_well_2d.js) is 100% JavaScript<br/>
👉 Based on [SquareWell.html](https://physics.weber.edu/schroeder/software/SquareWell.html) by [Daniel V. Schroeder](https://physics.weber.edu/schroeder/), [Weber State University](https://www.weber.edu/)<br/>
🔑 Updated and refactored and by [Zeger Hendrikse](https://www.hendrikse.name/)<br/>
👉 More physics software by [Daniel V. Schroeder](https://physics.weber.edu/schroeder/) can be found [here](https://physics.weber.edu/schroeder/software/)

<div id="infiniteSquareWellWrapper2D" style="width: 100%; aspect-ratio: 19/12">
    <canvas id="infiniteSquareWellCanvas2D" ></canvas>
</div>
<div class="buttonRow">
    <label for="speedSlider">Speed:
        <input type="range" id="speedSlider" min="0" max="0.05" step="0.001" value="0.02">
    </label>
    <span id="speedValue">0.020</span>
    <button id="pauseButton">Pause</button>
</div>

<div class="buttonRow">
    <input type="radio" name="plotType" id="realImag"><label for="realImag">Real/imag</label>
    <input type="radio" name="plotType" id="densityPhase" checked><label for="densityPhase">Density/phase</label>
    <button id="zeroButton">Zero</button>
    <button id="normalizeButton">Normalize</button>
</div>
<script type="module" src="infinite_square_well_2d.js"></script>
<p style="clear: both;"></p>

> This simulation animates infinite square well wavefunctions that are built from arbitrary superpositions 
> of the lowest eight definite-energy wavefunctions. The “clock faces” show phasor diagrams 
> for the complex amplitudes of these eight basis functions. Going from the ground state at the left to 
> the seventh excited state at the right, the outside of each “clock” corresponds to the magnitude of each. 
> The wavefunction is then built by summing the eight basis functions, 
> multiplied by their corresponding complex amplitudes. 
> As time passes, each basis amplitude rotates in the complex plane at a frequency 
> proportional to the corresponding energy.
>
> You can select either the real and imaginary parts of the wavefunction 
> (shown in orange and blue, respectively), or the probability density and phase. 
> The phase is represented by hues going from red (pure real and positive) 
> to light green (pure imaginary and positive) to cyan (pure real and negative) 
> to purple (pure imaginary and negative) and finally back to red.
>
> Click (or tap) on any clock face to change the corresponding amplitude. 
> To see an individual basis function, click “zero” and then click on the corresponding clock 
> face. &mdash; Paraphrased from instructions at [SquareWell.html](https://physics.weber.edu/schroeder/software/SquareWell.html)

### Background: particle in a box
<div class="header_line"><br/></div>

Although the one-dimensional particle-in-a-box problem does not correspond to any
real-world system, it illustrates quite well some (fundamental)
quantum mechanical features nonetheless.

The box is modeled by an infinite square well, so that the particle cannot escape
beyond the boundaries of the box.

Inside the box, the potential energy $V$ is zero (or constant). Substituting this together with the
formula for the plane wave $\psi(x,t) = Ae^{ik x}e^{-i\omega t}$ into the Schrödinger equation, we get:

$$\begin{equation}
\dfrac{\partial^2\psi}{\partial x^2} + \dfrac{8\pi^2m}{h^2}(E - 0)\psi=0 \Rightarrow \bigg(\dfrac{-h^2}{8\pi^2m}\bigg)\dfrac{\partial^2\psi}{\partial x^2}=E\psi
\end{equation}$$

Which function does give itself (times $E$) when differentiated twice <em>and</em> is zero at both boundaries of the box?

$$\begin{equation}
\psi = A\sin(ax) \Rightarrow \dfrac{h^2a^2}{8\pi^2m}\psi=E\psi \Rightarrow E=\dfrac{h^2a^2}{8\pi^2m}
\end{equation}$$

To get $a$, we note that the wave function equals zero at the box boundaries:

$$\begin{equation}
\psi=A\sin(ax) = 0 \Rightarrow a=\dfrac{n\pi}{L} \Rightarrow \psi_n = A\sin\bigg(\dfrac{n\pi x}{L}\bigg) \Rightarrow E_n=\dfrac{h^2n^2}{8mL^2}
\end{equation}$$

Normalizing the wave function results in an expression for $A$:

$$\begin{equation}
\int_0^L \psi \cdot  \psi dx = 1 \Rightarrow A^2 \int_0^L\sin^2\bigg(\dfrac{n\pi x}{L}\bigg) dx=1 \Rightarrow A^2\bigg(\dfrac{L}{2}\bigg)=1 \Rightarrow A=\sqrt{\dfrac{2}{L}}
\end{equation}$$

So summarizing, we have

$$\begin{equation}
E=\dfrac{h^2a^2}{8\pi^2m} \text{ and } \psi_n=\sqrt{\dfrac{2}{L}}\sin(nkx), \text{where } k=\dfrac{\pi}{L}
\end{equation}$$

These energy eigenstates (and superpositions thereof) are used in the visualization software.

{% include share_buttons.html %}


    