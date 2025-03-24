{% include breadcrumbs.html %}

## Diffraction pattern of a circular aperture 
<div class="header_line"><br/></div>

Below you'll find a diffraction pattern of a circular aperture far from a screen, where the 
intensity is calculated as the square of the amplitude of the electric field. Since the 
resulting diffraction pattern is too faint to be discerned from a computer screen, 
a 'fake' intensity image of the diffraction pattern is shown as well, calculated by
using the absolute value of the amplitude representing the intensity instead.

{% include_relative code/CircularAperture.html %}

<p style="clear:both;"></p>

## Instructions given in the video
<div class="header_line"><br/></div>

Below you find a copy of the original set of instructions that accompany the video.

### I. Introduction
<div style="border-top: 1px solid #999999"><br/></div>

This homework is to find the diffraction pattern of a circular aperture far from the screen. Assume there
is a circular aperture of diameter $d=100 \mu m$ and there is a spherical screen at $R=1m$ away. The light source is
of wavelength $\lambda=500nm$. To obtain the diffraction pattern, you can assume there are many point light sources
at the lattice points, sitting at the cross points of the $N=100$ vertical lines and $N=100$ horizontal lines, each 
separated by $s=d/N=1\mu m$ apart. If the lattice point's position is within the circular aperture, then it is allowed
to radiate light. Then on the screen you add all the electric field contributions from the light sources of the grid points, 
and you  will be able to obtain the diffraction intensity pattern by squaring the electric field (the detailed derivation is
listed in the next page). 

In addition to generating the intensity plot of the diffraction pattern, also find and print the
radius of the first dark ring and check whether the Rayleigh criterion $\theta=1.22\lambda / d$ is satisfied. Also notice
that, to calculate intensity is to do the square of the amplitude. However, the 'real' diffraction pattern is really
faint to be observed on the computer screen. Therefore, we also do a 'false' intensity image of the diffraction pattern
by taking the absolute value of the amplitude as the intensity. Of course, when you want to calculate the 
radius of the first dark ring, you should use the 'real' intensity image.

### II. Theoretical background
<div style="border-top: 1px solid #999999"><br/></div>

The amplitude of the electric field at position $(x, y)$ on the screen gets its contribution from all point
sources sitting inside the aperture

$$\begin{equation}E(x, y) =\int\int_{\text{aperture}} \dfrac{1}{r}\sin(\omega t - kr)dXdY\end{equation}$$

or equivalently

$$\begin{equation}E(x, y)=\int\int\dfrac{1}{R\left(1 - \dfrac{xX + yY}{R^2}\right)}\sin\left(\omega t - kR\left(1 -\dfrac{xX + yY}{R^2}\right)\right)dXdY\end{equation}$$

<p style="clear: both;"></p>

{% include share_buttons.html %}