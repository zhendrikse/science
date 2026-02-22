{% include breadcrumbs.html %}

## Hydrogen orbitals ⚛︎
<div class="header_line"><br/></div>

### What are you looking at?

This is a **3D visualization of atomic orbitals**: mathematical shapes arising from the solutions of 
the Schrödinger equation for a hydrogen-like atom.

Each surface represents a region of constant probability density. Colors show the **sign (phase)** of the 
wavefunction, and transparency reveals its **relative magnitude**.

Use the controls to explore how orbital shape and symmetry change.

<div class="canvasWrapper" id="orbitalsContainer">
    <canvas class="applicationCanvas" id="orbitalsCanvas"></canvas>
</div>
<div id="gui-container"></div>

<p style="clear: both;"></p>

## What can be seen
<div class="header_line"><br/></div>

You are looking at a three-dimensional visualization of **atomic orbitals** — 
the quantum-mechanical wavefunctions that describe where an electron is likely to 
be found around an atomic nucleus.

Each shape represents an orbital defined by the quantum numbers *n* and *ℓ*. 
Rather than showing electrons as tiny particles moving along fixed paths, 
quantum mechanics describes them as **waves**. 
The surfaces you see here are constructed from the angular part of those wavefunctions.

### Color and phase

The colors indicate the **sign (phase)** of the wavefunction:

* **Blue** and **red** represent opposite phases of the electron’s wave.
* Where the color changes, the wavefunction passes through zero — these are **nodal surfaces**, 
* regions where the probability of finding the electron is exactly zero.

### Transparency and magnitude

The **opacity** of the surface reflects the **magnitude** of the wavefunction:

* More opaque regions correspond to larger values of $\|\psi\|$.
* More transparent regions indicate smaller amplitudes.

This makes both the **shape** *and* the **structure** of each orbital visible at the same time.

### What this is — and what it isn’t

* These shapes are **not solid objects**.
* They are **not electron trajectories**.
* They are visual representations of mathematical functions that encode probability and symmetry.

What you are really seeing is the geometry of quantum mechanics itself.

## The mathematics behind the shapes
<div class="header_line"><br/></div>

Atomic orbitals are solutions of the **time-independent Schrödinger equation** for a hydrogen-like atom:

$$
\left(
-\frac{\hbar^2}{2\mu}\nabla^2
-\frac{e^2}{4\pi\varepsilon_0 r}
\right)\psi(\mathbf{r})
= E\,\psi(\mathbf{r})
$$

Because the potential depends only on the distance \(r\), the solutions separate in **spherical coordinates**:

$$
\psi_{n\ell m}(r,\theta,\phi)
=
R_{n\ell}(r)\,Y_{\ell}^{m}(\theta,\phi)
$$

- $R_{n\ell}(r)$ is the **radial function**, controlling the size and radial nodes
- $Y_{\ell}^{m}(\theta,\phi)$ are the **spherical harmonics**, determining the orbital shape and symmetry

### What you see here — and what you don’t

- The surfaces shown are **isosurfaces of the wavefunction amplitude**
- **Color** indicates the **sign (phase)** of $\psi$
- **Transparency** reflects the relative magnitude

Not shown explicitly:
- The time dependence $e^{-iEt/\hbar}$
- Electron trajectories (electrons do **not** orbit like planets)
- Exact probability density $\|\psi\|^2$ — this is a geometric representation

These shapes visualize the **structure of quantum states**, not literal electron paths.


{% include share_buttons.html %}

