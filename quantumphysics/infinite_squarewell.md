{% include breadcrumbs.html %}

## A one-dimensional particle in a box
<div class="header_line"><br/></div>

⭐ Idea taken from the book [Visualizing Quantum Mechanics with Python](https://www.amazon.com/Visualizing-Quantum-Mechanics-Python-Spicklemire/dp/1032569247)<br/>
🔧 Ported to JavaScript and [Three.js](https://threejs.org/) in [infinite_squarewell.js](https://github.com/zhendrikse/science/blob/main/quantumphysics/infinite_squarewell.js)<br/>
👉 A [VPython](https://www.vpython.org/) version is also available as [infinite_squarewell.py](https://github.com/zhendrikse/physics-in-python/blob/main/vpython/infinite_squarewell.py).

<div class="canvasWrapper" id="infiniteWellContainer">
    <canvas id="infiniteWellCanvas" class="applicationCanvas"></canvas>
</div>
<div class="guiContainer" id="infiniteWellGui"></div>
<script type="module" src="infinite_squarewell.js"></script>
<p style="clear: both;"></p>

## Additional two-dimensional simulation
<div class="header_line"><br/></div>

🔧 This [infinite_squarewell_2d.js](https://github.com/zhendrikse/science/blob/main/quantumphysics/infinite_squarewell_2d.js) is 100% JavaScript<br/>
👉 Based on [SquareWell.html](https://physics.weber.edu/schroeder/software/SquareWell.html) by [Daniel V. Schroeder](https://physics.weber.edu/schroeder/), [Weber State University](https://www.weber.edu/)<br/>
🔑 Updated and refactored and by [Zeger Hendrikse](https://www.hendrikse.name/)<br/>
👉 More physics software by [Daniel V. Schroeder](https://physics.weber.edu/schroeder/) can be found [here](https://physics.weber.edu/schroeder/software/)

<div id="infiniteSquareWellWrapper2D" class="canvasWrapper2D">
    <canvas id="infiniteSquareWellCanvas2D" class="applicationCanvas2D"></canvas>
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
<script type="module" src="infinite_squarewell_2d.js"></script>
<p style="clear: both;"></p>

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


    