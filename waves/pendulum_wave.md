{% include breadcrumbs.html %}

## Pendulum wave 🌊
<div class="header_line"><br/></div>

[![Source](https://img.shields.io/badge/github-repo-green?logo=github&label=pendulum_wave.js)](https://github.com/zhendrikse/science/blob/main/waves/pendulum_wave.js)&nbsp;&nbsp;
[![JavaScript](https://img.shields.io/badge/JavaScript-007ACC?logo=javascript&logoColor=white)](https://en.wikipedia.org/wiki/JavaScript)&nbsp;&nbsp;
[![Three.js](https://img.shields.io/badge/Three.js-000000?logo=three.js&logoColor=white)](https://threejs.org/)&nbsp;&nbsp;

$$\begin{equation}
\theta(t)=\theta_0 \cos \bigg( \sqrt{  \frac {g} {L}} t \bigg)\text{, where }L = \frac{g T^2}{4\pi^2}
\end{equation}$$

<div class="canvasWrapper" id="poolWithMovingObstacleContainer">
    <canvas id="pendulumCanvas" class="applicationCanvas"></canvas>
    <div class="overlayText" id="pendulumOverlay">Click to start the animation!</div>
</div>
<script type="module" src="pendulum_wave.js"></script>

⭐ Based on the VPython [PendulumWave](https://glowscript.org/#/user/yizhe/folder/Public/program/PendulumWave) and inspired by [www.dynamicmath.xyz](https://www.dynamicmath.xyz/)<br/>
👉 Related to [Newton&apos;s cradle](https://www.hendrikse.name/science/kinematics/newtons_cradle.html) simulation<br/>

###  Why the pendulum wave re-synchronizes 🧠

At first glance the pendulum wave looks chaotic, but it is actually a **perfectly designed periodic motion**!

The key idea:

👉 Each pendulum has a **slightly different period**, chosen very carefully.

Each of the pendulum's period is carefully chosen

$$\begin{equation}
T_i = \frac{T_{pw}}{N + i}
\end{equation}$$

where $T_{pw}$ is the period of the pendulum wave. As a consequence, after a time $T_{pw}$:

$$\begin{equation}
\text{number of oscillations} = \frac{T_{pw}}{T_i} = N + i
\end{equation}$$

👉 That is an **integer**.

So every pendulum has completed 15 swings, 16 swings, 17 swings, etc.

Because each pendulum completes an **integer number of cycles**, 
they all return to the same position with the same phase, i.e. they **re-synchronize perfectly**.

#### What happens in between?

Between $t = 0$ and $t = T_{pw}$:

* Phases drift apart
* The pattern looks like a traveling wave
* Then becomes messy / “random”
* Then reorganizes again

This is due to **phase differences evolving linearly**:

$$\begin{equation}
\theta_i(t) \sim \cos(\omega_i t)\text{, with } \omega_i = \frac{2\pi}{T_i}
\end{equation}$$

#### 🎼 A many-body “beat” phenomenon 

Although here you’re seeing **many frequencies interfering in time**, it’s similar to:

* musical harmonics
* interference patterns
* Fourier superposition

#### 🧠 Why the wave pattern appears

At intermediate times:

* Neighboring pendulums are slightly out of phase
* This creates **spatial phase gradients**

Our brain interprets this as a **wave traveling through the system**. However,
nothing is actually traveling — it's a mere *illusion*.

#### 🧩 The deeper math

This is a system of pendulums, where for each individual pendulum we have:

$$\begin{equation}
\theta_i(t) = A \cos\left(\frac{2\pi}{T_i} t\right)
\end{equation}$$

Because all (T_i) are chosen as:

$$\begin{equation}
T_i = \frac{T_{pw}}{N+i}
\end{equation}$$

all frequencies are **commensurate** (rationally related). This guarantees 
a **common period** and an exact recurrence, since after a time $T_{pw}$:

$$\begin{equation}
\theta_i(t + T_{pw}) = \theta_i(t)
\end{equation}$$

for *all* pendulums.

#### Summarizing:

👉 The wave comes back because every pendulum “keeps perfect count” and they all land back in sync after completing whole-number cycles.


<p style="clear: both;"></p>

{% include share_buttons.html %}