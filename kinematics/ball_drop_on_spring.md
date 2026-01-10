{% include breadcrumbs.html %}

## Ball dropped onto a spring
<div class="header_line"><br/></div>

Download the [ball_drop_on_spring.py](code/ball_drop_on_spring.py) source code
{% include_relative code/ball_drop_on_spring.html %}

<p style="clear: both;"></p>

{% include share_buttons.html %}


<h2>Info</h2>
🔥 Mooie observatie — en **ja, dit klopt fysisch volledig**.
Wat je ziet is géén bug maar een **klassiek, subtiel natuurkundig effect**. Dit is precies het soort inzicht waar VPython-docenten blij van worden 🙂

---

## 🧠 Kernantwoord (kort)

**De energie oscilleert met een hogere frequentie dan de positie**, namelijk **2× zo snel**.

👉 De bal gaat omhoog/omlaag met frequentie **ω**
👉 De **energie** oscilleert met frequentie **2ω**

---

## 📐 Waarom gebeurt dit?

Neem een ideale harmonische trilling:

### Positie

$$
y(t) = A \cos(\omega t)
$$

### Snelheid

$$
v(t) = -A \omega \sin(\omega t)
$$

---

## 🔴 Kinetische energie

$$
E_k = \tfrac12 m v^2
= \tfrac12 m A^2 \omega^2 \sin^2(\omega t)
$$

Gebruik identiteit:
$$
\sin^2(\omega t) = \tfrac12 (1 - \cos(2\omega t))
$$

➡️ **Frequentie = 2ω**

---

## 🔵 Potentiële veerenergie

$$
E_p = \tfrac12 k y^2
= \tfrac12 k A^2 \cos^2(\omega t)
$$

$$
\cos^2(\omega t) = \tfrac12 (1 + \cos(2\omega t))
$$

➡️ **Ook 2ω**

---

## ⚪ Totale energie

$$
E = E_k + E_p = \text{constant (zonder demping)}
$$

Met demping:

* gemiddelde daalt
* snelle oscillatie blijft zichtbaar

---

## 🎯 Intuïtief beeld

* De **bal**:

* heeft 1 top per periode
* De **energie**:

* maximaal bij **bovenste én onderste** keerpunt
* minimaal bij **evenwicht**

➡️ **Dus twee pieken per cyclus**

---

## 🧪 Wat jij letterlijk ziet in jouw simulatie

| Grootheid       | Frequentie                      |
| --------------- | ------------------------------- |
| Positie         | ω                               |
| Snelheid        | ω                               |
| Energie (KE/PE) | **2ω**                          |
| Totale energie  | ~ constant (of langzaam dalend) |

✔️ Precies zoals in theorie

---

## 🧩 Extra leuk experiment (aanrader)

Teken **positie y(t)** ook in de grafiek:

```js
const Y = [];
```

In `animate()`:

```js
Y.push(y * 20); // schaal
if (Y.length > maxPoints) Y.shift();
```

In `drawGraph()`:

```js
drawLine(Y, "lime");
```

👉 Je ziet dan letterlijk:

* groene golf → langzaam
* rode/blauwe energie → 2× zo snel

🤯 *Dat is didactisch goud.*