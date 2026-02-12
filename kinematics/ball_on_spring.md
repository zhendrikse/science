{% include breadcrumbs.html %}

## Ball dropped onto a spring
<div class="header_line"><br/></div>

Download the [ball_on_spring.html](code/ball_on_spring.html) source code
{% include_relative code/ball_on_spring.html %}

<p style="clear: both;"></p>

### Background info

🧠 Note that the energy oscillates with a higher frequency than the position, namely ** twice as fast**. 

👉 The bal goes up/down with frequency **ω**<br/>
👉 The **energy** oscillates with frequency **2ω**

#### Why does this happen?

Consider an ideal harmonic vibration. The position is given by:

$$
y(t) = A \cos(\omega t)
$$

The velocity is given by:

$$
v(t) = -A \omega \sin(\omega t)
$$

---

🔴 The kinetic energy is:

$$
E_k = \tfrac12 m v^2
= \tfrac12 m A^2 \omega^2 \sin^2(\omega t)
$$

where we have used the trigonometric identity:
$$
\sin^2(\omega t) = \tfrac12 (1 - \cos(2\omega t))
$$

From this it follows that:

➡️ **Frequentie = 2ω**

---

🔵 The potential spring energy is given by:

$$
E_p = \tfrac12 k y^2
= \tfrac12 k A^2 \cos^2(\omega t)
$$

where

$$
\cos^2(\omega t) = \tfrac12 (1 + \cos(2\omega t))
$$

➡️ **Also 2ω**

---

⚪ The total  energy

$$
E = E_k + E_p = \text{constant (zonder demping)}
$$

With damping:

* the average energy gradually diminishes
* a fast oscillation remains visible

### 📐 Intuitively

The **ball**:

* has one top per period

The **energie**:

* is maximal at **highest and lowest** turning points
* is minimal at **equilibrium**

➡️ **So two peaks per cycle**

### 🧪 What do we observe?

| Entity         | Frequency                         |
|----------------|-----------------------------------|
| Position       | ω                                 |
| Velocity       | ω                                 |
| Energy (KE/PE) | **2ω**                            |
| Total energy   | ~ constant (or slowly diminishing) |

✔️ Exactly in accordance with theory!

<p style="clear: both;"></p>

{% include share_buttons.html %}
