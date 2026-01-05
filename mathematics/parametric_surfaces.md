{% include breadcrumbs.html %}

## Parametric surfaces
<div class="header_line"><br/></div>

The images are generated with [parametric_surfaces.html](https://github.com/zhendrikse/science/blob/main/mathematics/code/parametric_surfaces.html).
{% include_relative code/parametric_surfaces.html %}

<br/><br/>
<p style="clear: both;"></p>

## Numeric calculation mean &amp; Gaussian curvature
<div class="header_line"><br/></div>

We use **central differences of second order** for *all* derivatives as these derivatives are 

* **translation-invariant**
* **no preferred direction**
* stable for curvature calculations

This is essential for:

* correct **signs** of k₁ and k₂
* correct ratio between both k₁ and k₂

Note that **forward differencing** is asymmetric and leads to an error in the curvature calculation.

For central differences we use:

$$X_{uu} = \frac{X(u+e)-2X(u)+X(u-e)}{e^2}$$

$$X_{uv} = \frac{ X(u+e,v+e)-X(u+e,v-e)-X(u-e,v+e)+X(u-e,v-e)}{4e^2}$$

### Comparison with analytic Gaussian curvature of a torus

For a torus with major radius `R` and minor radius  `r` we have the following parametrization:

$$X(u,v) = \begin{pmatrix} (R + r\cos v)\cos u \\ (R + r\cos v)\sin u \\ r\sin v \end{pmatrix}$$

⭐ The **Gaussian curvature** is given by:

$$K(v) = \frac{\cos v}{r (R + r \cos v)}$$

👉 Note that this curvature

* is **independent of u**,
* is zero at $v = \pm\frac{\pi}{2}$,
* and has a change of sign between the blue ↔ red transition.

👉 For the coloring this means that:

* 🔴 **Outside** where $\theta = 0 \rightarrow \cos\theta = 1 \rightarrow K > 0$: **elliptic**, i.e. red

* 🔵 **Inside** where $\theta = \pi \rightarrow \cos\theta = -1 \rightarrow K < 0$: **hyperbolic**, i.e. blue

* ⚪ **Side lines** where $\theta = \pm \dfrac{\pi}{2} \rightarrow K = 0$: **parabolic**

👉 For the principal curvatures k₁ and k₂ we see that

* **k₁**

  * 🔴 **Outside** strongly positive (red)
  * 🔵 **Inside**: strongly negative (blue)

* **k₂**

  * Everywhere the same sign
  * Varying intensity

🧠 Summarizing:

A torus has

* both **positive and negative Gaussian curvature**
* **two closed K = 0-contours** (the so-called “equatorial” circles)
* no contours where the _mean_ curvature $H = 0$




---

## 2. Analytische K berekenen in code

Als jouw `surfaceDefinition` deze torus is, voeg dit toe:

```js
function torusGaussianCurvature(u, v, R, r) {
    return Math.cos(v) / (r * (R + r * Math.cos(v)));
}
```

Let op:

* `u` zit er alleen in voor consistentie
* `v` moet **in radialen** zijn (niet genormaliseerd!)

Als je nu `u,v ∈ [0,1]` gebruikt, dan:

```js
const U = 2 * Math.PI * u;
const V = 2 * Math.PI * v;
```

---

## 3. Numeriek vs analytisch vergelijken

### A. Puntgewijs vergelijken (console / debug)

```js
const Kn = this.geom.gaussianCurvature(u, v);
const Ka = torusGaussianCurvature(U, V, R, r);

const relError = Math.abs(Kn - Ka) / Math.max(1e-6, Math.abs(Ka));
```

Typische goede waarden:

* `relError ~ 1e-3` → ok
* `relError ~ 1e-4` → heel goed
* `> 1e-2` → eps of stencil fout

---

### B. Visueel: error colormap (aanrader)

Dit is super leerzaam.

```js
const error = Kn - Ka;
const t = Math.tanh(error * errorScale);
```

* rood → numeriek te groot
* blauw → numeriek te klein
* grijs → klopt

Je zult zien:

* fout het grootst bij **binnenkant** (hoge kromming)
* fout groeit bij te grote `eps`

---

## 4. Wat je mag verwachten qua fouten

### Afhankelijkheid van `eps`

| eps    | gedrag                |
| ------ | --------------------- |
| `1e-3` | zichtbaar fout        |
| `1e-4` | acceptabel            |
| `1e-5` | meestal optimaal      |
| `1e-6` | ruis (floating point) |

👉 sweet spot: **`1e-5 × schaal`**

---

### Nabij K = 0

Relatieve fout explodeert daar (want delen door klein getal).
Gebruik daar **absolute fout**:

```js
Math.abs(Kn - Ka)
```

---

## 5. Extra check: teken van K

Een snelle sanity test:

```js
if (Math.sign(Kn) !== Math.sign(Ka)) {
    console.warn("sign error at", u, v);
}
```

Als dit gebeurt:

* bijna altijd stencil / eps probleem
* of normale vector verkeerd georiënteerd

---

## 6. Waarom dit een uitstekende test is

De torus is perfect omdat:

* analytische oplossing bekend
* positieve + negatieve K
* nul-contours
* geen randproblemen

Als je torus klopt:
👉 **99% kans dat je differentiaalgeometrie correct is**

---

## 7. Volgende logische stap (optioneel)

Als je dit leuk vindt, zijn dit mooie vervolgstappen:

* vergelijk **mean curvature H**
* vergelijk **principal curvatures k₁, k₂**
* plot **asymptotic directions** waar `K < 0`
* numerieke convergentie testen (`eps → 0`)

Zeg maar wat je wilt uitdiepen 👍



Als je wilt, kunnen we als volgende stap:

* principal directions tekenen
* asymptotic directions (waar K < 0)
* of je numerieke K vergelijken met de analytische torusformule





## Introduction to manifolds
<div class="header_line"><br/></div>

<blockquote>
<p>
The term “manifold” comes from Riemann’s Mannigfaltigkeit, which is German for “variety” or “multiplicity.”
</p>

<p>
A manifold is a space that looks Euclidean when you zoom in on any one of its points. 
For instance, a circle is a one-dimensional manifold. 
Zoom in anywhere on it, and it will look like a straight line. 
An ant living on the circle will never know that it’s actually round. 
But zoom in on a figure eight, right at the point where it crosses itself, 
and it will never look like a straight line. The ant will realize at that intersection point 
that it’s not in a Euclidean space. A figure eight is therefore not a manifold.
</p>

<p>
Similarly, in two dimensions, the surface of the Earth is a manifold; 
zoom in far enough anywhere on it, and it’ll look like a flat 2D plane. 
But the surface of a double cone — a shape consisting of two cones connected 
at their tips — is not a manifold.

From:
<a href="https://www.wired.com/story/behold-the-manifold-the-concept-that-changed-how-mathematicians-view-space/">
  Behold the Manifold, the Concept that Changed How Mathematicians View Space.
</a>
</p>
</blockquote><br/>


<figure>
  <img alt="Introduction to manifolds" src="./images/manifold.jpg" title="Click to animate"/>
  <figcaption>From
    <a href="https://www.wired.com/story/behold-the-manifold-the-concept-that-changed-how-mathematicians-view-space/">
      Behold the Manifold, the Concept that Changed How Mathematicians View Space.
    </a>
  </figcaption>
</figure>


<p style="clear: both;"></p>

## References

- [The core of differential geometry](https://dibeos.net/2025/04/12/the-core-of-differential-geometry/)

{% include share_buttons.html %}