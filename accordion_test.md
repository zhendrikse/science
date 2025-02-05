
For a plane wave, we can easily derive the Schr&#246;dinger equation.

[expand]

According to <a href="https://en.wikipedia.org/wiki/Matter_wave">De Broglie</a> we have:

$$p = \dfrac{h}{\lambda} = \dfrac{h}{2\pi} \dfrac{2\pi}{\lambda} = \hbar k \Rightarrow \hbar k = \hbar \dfrac{\partial}{\partial x} \psi(x,t) = p \psi(x, t) \Rightarrow p = \hbar \dfrac{\partial}{\partial x}$$

The Kinetic energy can be expressed as:

$$K = \dfrac{p^2}{2m} = -\dfrac{\hbar^2}{2m}\dfrac{\partial^2}{\partial x^2} \psi(x,t)$$

The total energy is given by the <a href="https://en.wikipedia.org/wiki/Planck_relation">Planck-Einstein relation</a>:

$$E = hf = \dfrac{h}{2\pi}\dfrac{2\pi}{T} = \hbar \omega \Rightarrow -i\hbar\dfrac{\partial}{\partial t} \psi(x,t) = E \psi(x,t) \Rightarrow E = -i\hbar\dfrac{\partial}{\partial t}$$

From this we arrive at the <a href="https://en.wikipedia.org/wiki/Schr%C3%B6dinger_equation">Schr&#246;dinger equation</a>:

$$(KE + PE)\Psi(x,,t) = E\Psi(x,t) = -i\hbar \dfrac{\partial}{\partial t}\Psi(x, t) = -\dfrac{\hbar^2}{2m}\dfrac{\partial^2}{\partial x^2} \Psi(x,t) + V(x)\Psi(x,t)$$

In three-dimensional space this is then generalized to:

$$i\hbar\dfrac{\partial}{\partial t}\Psi(\vec{r}, t) = \left(-\frac{\hbar^2}{2m}\nabla^2 + V(\vec{r, t}\right)\Psi(\vec{r}, t)$$

[\expand]

{% include text-expand.html %}
