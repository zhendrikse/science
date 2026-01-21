{% include breadcrumbs.html %}

## Surface plots of complex functions
<div class="header_line"><br/></div>

### What are you looking at?

You are looking at a **3D visualization of a complex-valued function**

$$
\psi(z) = F(z), \quad z \in \mathbb{C}.
$$

* **The horizontal plane** represents the complex input $z = x + iy$

* **Height** shows the magnitude as $\log |F(z)|$

* **Color encodes the complex phase** (argument) of $F(z)$:<br/>
  🎨 colors rotate continuously as the phase winds around zero points

* ✂️ **Branch cuts** appear as sudden color jumps — places where the phase cannot be made continuous

* 🔴↔🔵 **Full color cycles** indicate a complete $2\pi$ phase rotation

Height &amp; color reveal how the function **stretches, twists, and folds** the complex plane.

{% include_relative code/complex_surfaces.html %}

<p style="clear: both;"></p>

🛠️ The images are generated with [complex_surfaces.html](https://github.com/zhendrikse/science/blob/main/mathematics/code/complex_surfaces.html).

{% include share_buttons.html %}