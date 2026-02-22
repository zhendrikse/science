{% include breadcrumbs.html %}

## Visualizing a Complex Plane wave 
<div class="header_line"><br/></div>

### What are you looking at?

This animation shows a one-dimensional **complex plane wave**,
a fundamental object in wave physics and quantum mechanics.<br/>
Mathematically, the wave is described by

$$\psi(x, t) = Ae^{i(k x - \omega t)}$$

where

- $A$ is the amplitude
- $k$ is the wave number
- $\omega$ is the angular frequency

Each arrow represents the complex value of the wave function at a fixed position $x$.
The arrow rotates in the complex plane as time evolves:

- **z-direction**: real part of $\psi$
- **y-direction**: imaginary part of $\psi$

The **length of the arrows is constant**, showing that the magnitude $|\psi|$ 
of a plane wave does not change in space or time.
The **color encodes the phase**, making the spatial and temporal phase structure visible.

This visualization helps build intuition for complex waves, phase propagation, 
and the role of $k$ and $\omega$.

<div class="canvasWrapper" id="planeWaveContainer">
    <canvas class="applicationCanvas" id="planeWaveCanvas"></canvas><br/>
</div>
<div class="guiContainer" id="gui-container"></div>
<script type="module" src="plane_wave.js"></script>

<p style="clear: both;"></p>

⭐ Idea taken from the book [Visualizing Quantum Mechanics with Python](https://www.amazon.com/Visualizing-Quantum-Mechanics-Python-Spicklemire/dp/1032569247)<br/>
🔧 Ported to JavaScript and [Three.js](https://threejs.org/) in [plane_wave.js](https://github.com/zhendrikse/science/blob/main/quantumphysics/plane_wave.js)<br/>
👉 A [VPython](https://www.vpython.org/) version is also available as [scalar_plot.py](https://github.com/zhendrikse/physics-in-python/blob/main/vpython/plane_wave.py).


### Guided Exploration
<div class="header_line"><br/></div>

Use the controls to explore the properties of the plane wave.

---

#### Exercise 1 — Spatial phase

1. Set $\omega = 0$.
2. Change the wave number $k$.

**Questions**

* What happens to the phase difference between neighboring arrows?
* How does this relate to the wavelength $\lambda = 2\pi/k$?

---

#### Exercise 2 — Temporal evolution

1. Fix $k$.
2. Increase $\omega$.

**Questions**

* What changes visually?
* What does $\omega$ control physically?
* Does the probability density change?

---

#### Exercise 3 — Direction of propagation

1. Set $k > 0$.
2. Observe how the phase moves in space.
3. Repeat for $k < 0$.

**Questions**

* In which direction does the phase propagate?
* How is this related to the sign of the momentum?

---

#### Exercise 4 — Real vs imaginary parts

Focus on a single arrow and track its motion.

**Questions**

* How are the real and imaginary parts related?
* Why can neither part alone represent the full wave?

---

#### Exercise 5 — Interpretation

A plane wave is not normalizable.

**Questions**

* What does that mean physically?
* Why are plane waves still useful in quantum mechanics?
* How might you build a localized wave packet from plane waves?

---

### Optional challenge

Predict what would happen if **two plane waves with slightly different $k$ ** were added together.
What new structure would you expect to see?


### Complex Plane Waves in Quantum Mechanics
<div class="header_line"><br/></div>

In quantum mechanics, the state of a free particle with definite momentum is described by a **plane wave**

$$
\psi(x,t) = A  e^{i(kx - \omega t)}.
$$

This visualization shows the wave function as a **geometric object** rather than a real-valued curve.

At each position $x$:

* the arrow represents the **complex value** of $\psi(x,t)$
* the arrow rotates in the complex plane with angular frequency $\omega$
* the spatial phase advance is controlled by the wave number $k$

The real and imaginary parts are shown along orthogonal axes.
The **constant arrow length** illustrates that

$$
|\psi(x,t)|^2 = |A|^2
$$

is uniform in space and time.

This emphasizes an important quantum-mechanical point:

> A plane wave does **not** represent a localized particle, but a state with definite momentum and completely delocalized position.

The animation separates:

* **phase evolution** (rotation of arrows)
* from **probability density** (constant magnitude)

which is often obscured in standard textbook plots.


### Concise derivation of the Schr&#246;dinger equation
<div class="header_line"><br/></div>

According to <a href="https://en.wikipedia.org/wiki/Matter_wave">De Broglie</a> we have:

$$p = \dfrac{h}{\lambda} = \dfrac{h}{2\pi} \dfrac{2\pi}{\lambda} = \hbar k \Rightarrow \hbar k = \hbar \dfrac{\partial}{\partial x} \psi(x,t) = p \psi(x, t) \Rightarrow p = \hbar \dfrac{\partial}{\partial x}$$

The Kinetic energy can be expressed as:

$$K = \dfrac{p^2}{2m} = -\dfrac{\hbar^2}{2m}\dfrac{\partial^2}{\partial x^2} \psi(x,t)$$

The total energy is given by the <a href="https://en.wikipedia.org/wiki/Planck_relation">Planck-Einstein relation</a>:

$$E = hf = \dfrac{h}{2\pi}\dfrac{2\pi}{T} = \hbar \omega \Rightarrow -i\hbar\dfrac{\partial}{\partial t} \psi(x,t) = E \psi(x,t) \Rightarrow E = -i\hbar\dfrac{\partial}{\partial t}$$

From this we arrive at the <a href="https://en.wikipedia.org/wiki/Schr%C3%B6dinger_equation">Schr&#246;dinger equation</a>:

$$(KE + PE)\Psi(x,,t) = E\Psi(x,t) = -i\hbar \dfrac{\partial}{\partial t}\Psi(x, t) = -\dfrac{\hbar^2}{2m}\dfrac{\partial^2}{\partial x^2} \Psi(x,t) + V(x)\Psi(x,t)$$


{% include share_buttons.html %}
