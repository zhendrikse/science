{% include breadcrumbs.html %}

## [Thin film interference](https://en.wikipedia.org/wiki/Thin-film_interference) by reflection 
<div class="header_line"><br/></div>

A plane wave with wavelength $\lambda$ strikes a thin film an angle $\theta_i$ with the normal.
The film has refractive index $n$ and thickness $a$. 
The phase difference between the rays reflected from the first and second surfaces is:

$$\begin{equation}\delta= \frac{4\pi\cdot a\cdot n\cdot \cos(\theta_i)}{\lambda} +\pi\end{equation}$$

There is additional interference from rays reflected inside the film at the first surface:

$$\begin{equation}\delta = \frac{4\pi\cdot a\cdot n\cdot \cos(\theta_i)}{\lambda}\end{equation}$$

The program shows a color plot of the intensity of a given wavelength.

&#x2022; Based on <a href="https://sites.science.oregonstate.edu/~landaur/Books/Problems/Codes/JupyterNB/ThinFilmVP.ipynb">Thin film interference by reflection</a> (AJP 72,1248-1253)<br/>
&#x2022; From <a href="https://books.google.nl/books/about/Computational_Problems_for_Physics.html?id=g9tdDwAAQBAJ">Computational Problems for Physics</a> by RH Landau, MJ Paez, and CC Bordeianu.<br/>
&#x2022; Refactored by <a href="https://www.hendrikse.name/">Zeger Hendrikse</a> in <a href="https://github.com/zhendrikse/science/blob/main/optics/code/thin_film.py">thin_film.py</a>


{% include_relative code/ThinFilm.html %}

<p style="clear: both;"></p>

{% include share_buttons.html %}

