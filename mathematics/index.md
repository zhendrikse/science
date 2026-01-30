{% include breadcrumbs.html %}

<blockquote>
Somehow it’s okay for people to chuckle about not being good at math. 
Yet, if I said “I never learned to read,” they’d say I was an illiterate dolt. &mdash;
<a href="https://en.wikipedia.org/wiki/Neil_deGrasse_Tyson">Neil deGrasse Tyson</a>
</blockquote><br/>

<a name="mathematics"></a>
# Mathematics
<div class="header_line"><br/></div>

<a name="multivariate_functions"></a>
### Plots for $f(x, y) \rightarrow \mathbb{R}$
<div style="border-top: 1px solid #999999"><br/></div>

The application below let's one render functions in two real variables $x$ and $y$.
The color-coding below is associated with the height of the object and
is added purely for aesthetical purposes.

<div class="double_image">
<figure class="left_image">
  <a href="parametric_surfaces.html">
    <img alt="Multivariate functions" src="images/multivariate_surface_plot.png" title="Click to animate"/>
  </a>&nbsp;&nbsp;&nbsp;
  <figcaption>Surface plot for $f(x, y) = \sin(\pi x)\cos(\pi y)$.</figcaption>
</figure>
<figure class="right_image">
  <a href="complex_surfaces.html">
    <img alt="Complex functions" src="images/complex_function_plot.png" title="Click to animate"/>
  </a>
  <figcaption>Surface plot for $f(z) = \exp(-z^2)$.</figcaption>
</figure>
</div>
<p style="clear: both;"></p>

<a name="fields"></a>
### Scalar fields $f(x, y, z) \rightarrow \mathbb{R}$ and vector fields $f(x, y, z) \rightarrow \mathbb{R}^3$
<div style="border-top: 1px solid #999999"><br/></div>

A field is an algebraic structure that is defined as a non-empty collection with two 
([binary](https://en.wikipedia.org/wiki/Binary_operation)) operations: 
addition, $a+b$, and multiplication, $a\cdot b$. 

These operations are accurately defined by 
[the conditions they must suffice](https://math.libretexts.org/Bookshelves/Analysis/Mathematical_Analysis_(Zakon)/02%3A_Real_Numbers_and_Fields/2.01%3A_Axioms_and_Basic_Definitions), 
but roughly speaking they should behave similarly as we know them already from the
rational numbers $\mathbb{Q}$ and real numbers $\mathbb{R}$.

The applications below render two such fields, that are abundant in physics, namely 
[scalar fields](https://en.wikipedia.org/wiki/Scalar_field) and [vector fields](https://en.wikipedia.org/wiki/Vector_field).
The former assigns a value (scalar) to every point in space (e.g. the temperature
in a room), the latter a vector (e.g. the force and direction of the wind).

<div class="double_image">
<figure class="left_image">
  <a href="quiver_plot.html">
    <img alt="Vector field" src="images/vector_field.png" title="Click to animate"/>
  </a>
  <figcaption>Rendering of three-dimensional vector field and implied flow.</figcaption>
</figure>
<figure class="right_image">
  <a href="div_curl_demo.html">
    <img alt="Divergence and curl" src="images/div_curl_demo.png" title="Click to animate"/>
  </a>
  <figcaption>Visualization of divergence and curl.</figcaption>
</figure>
</div>
<p style="clear: both;"></p>

<div class="double_image">
<figure class="left_image">
  <a href="scalar_plot.html">
    <img alt="Scalar field" src="images/scalar_plot.png" title="Click to animate"/>
  </a>
  <figcaption>Rendering a temperature distribution as a 3D scalar field.</figcaption>
</figure>
<figure class="right_image">
  <!-- SPACE RESERVED FOR FUTURE APPLICATION 
    -->
</figure>
</div>
<p style="clear: both;"></p>

<a name="surfaces"></a>
## Differential geometry
<div class="header_line"><br/></div>

<div class="double_image">
<figure class="left_image">
  <a href="parametric_surfaces.html">
    <img alt="Twisted torus" src="gallery/images/twisted_torus.png" title="Click to animate"/>
  </a>
  <figcaption>Surface plot of twisted torus. For more surfaces, visit the <a href="gallery/index.html">Math Art Gallery</a>.</figcaption>
</figure>
<figure class="right_image">
  <a href="parametric_surfaces.html">
    <img alt="Self-intersecting disk" src="gallery/images/self_intersecting_disk_contour.png" title="Click to animate"/>
  </a>
  <figcaption>Contour plot of <a href="https://en.wikipedia.org/wiki/Real_projective_plane">self-intersecting disk</a>.
  For more surfaces, visit the <a href="gallery/index.html">Math Art Gallery</a>.</figcaption>
</figure>
</div>
<p style="clear: both;"></p>

<a name="cellular_automata"></a>
## Cellular automata
<div class="header_line"><br/></div>

<div class="double_image">
<figure class="left_image">
  <a href="game_of_life.html">
    <img alt="Conway's game of life" src="./images/2d_game_of_life.png" title="Click to animate"/>
  </a>
  <figcaption>Conway's game of life.</figcaption>
</figure>
<figure class="right_image">
  <!-- SPACE RESERVED FOR FUTURE APPLICATIONS -->
</figure>
</div>
<p style="clear: both;"></p>


<a name="mandelbrot"></a>
## Mandelbrot &amp; Julia sets
<div class="header_line"><br/></div>

<div class="double_image">
<figure class="left_image">
  <a href="mandelbrot.html">
    <img alt="Mandelbrot set" src="images/mandelbrot.png" title="Click to animate"/>
  </a>
  <figcaption>Check out this page and learn about the difference between Mandelbrot and Julia sets!</figcaption>
</figure>
<figure class="right_image">
  <!-- SPACE RESERVED FOR FUTURE APPLICATION
    -->
</figure>
</div>
<p style="clear: both;"></p>


<a name="fractals"></a>
## Fractals
<div class="header_line"><br/></div>

<div class="double_image">
<figure class="left_image">
  <a href="fractals.html">
    <img alt="Dragon curve fractal" src="./images/dragon_curve.png" title="Click to animate"/>
  </a>
  <figcaption>Generation of two-dimensional fractal shapes.</figcaption>
</figure>
<figure class="right_image">
  <a href="chaos_game.html">
    <img alt="Vicsek fractal" src="./images/chaos_game.png" title="Click to animate"/>
  </a>
  <figcaption>The <a href="https://en.wikipedia.org/wiki/Vicsek_fractal">Vicsek fractal</a> 
  generated using a <a href="https://en.wikipedia.org/wiki/Chaos_game">chaos game</a>.</figcaption>
</figure>
</div>
<p style="clear: both;"></p>



<a name="3d_fractals"></a>
## Sierpiński&apos;s pyramid &amp; Menger&apos;s sponge
<div class="header_line"><br/></div>

<div class="double_image">
<figure class="left_image">
  <a href="sierpinski.html">
    <img alt="Sierpinski pyramid" src="./images/sierpinski.png" title="Click to animate"/>
  </a>
  <figcaption>Sierpiński pyramid is a 3D analogue of the 
  <a href="https://en.wikipedia.org/wiki/Sierpi%C5%84ski_triangle">Sierpiński triangle</a></figcaption>
</figure>
<figure class="right_image">
  <a href="menger_sponge.html">
    <img alt="Menger sponge" src="./images/menger_sponge.png" title="Click to animate"/>
  </a>
  <figcaption><a href="https://en.wikipedia.org/wiki/Menger_sponge">Menger Sponge</a> 
  is another famous three-dimensional fractal curve.</figcaption>
</figure>
</div>
<p style="clear: both;"></p>


<a name="strange_attractors"></a>
## Lorenz &amp; Rössler attractors 
<div class="header_line"><br/></div>

<div class="double_image">
<figure class="left_image">
  <a href="lorenz_attractor.html">
    <img alt="Lorenz attractor" src="./images/lorenz_attractor.png" title="Click to animate"/>
  </a>
  <figcaption><a href="https://vpython.org/">VPython program</a> that renders the 
  <a href="https://science.howstuffworks.com/math-concepts/chaos-theory4.htm">Lorenz attractor</a>.</figcaption>
</figure>
<figure class="right_image">
  <a href="roessler_attractor.html">
    <img alt="Rössler attractor" src="./images/roessler_attractor.png" title="Click to animate"/>
  </a>
  <figcaption><a href="https://vpython.org/">VPython program</a> that renders the 
  <a href="https://en.wikipedia.org/wiki/R%C3%B6ssler_attractor">Rössler</a> attractor.</figcaption>
</figure>
</div>
<p style="clear: both;"></p>


<a name="fractal_terrains"></a>
## Fractal terrains
<div class="header_line"><br/></div>

<div class="double_image">
<figure class="left_image">
  <a href="fractal_terrain_surface.html">
    <img alt="Fractal terrain" src="images/fractal_terrain_surface.png" title="Click to animate"/>
  </a>&nbsp;&nbsp;&nbsp;
  <figcaption>Fractal terrain surface.</figcaption>
</figure>
<figure class="right_image">
  <a href="fractal_terrain_contour.html">
    <img alt="Fractal terrain" src="images/fractal_terrain_contour.png" title="Click to animate"/>
  </a>
  <figcaption>Fractal terrain contour plot.</figcaption>
</figure>
</div>
<p style="clear: both;"></p>

<a name="harmonograph"></a>
## Dalton board and harmonograph
<div class="header_line"><br/></div>

<div class="double_image">
<figure class="left_image">
  <a href="galton_board.html">
    <img alt="Galton board" src="./images/galton_board.png" title="Click to animate"/>
  </a>
  <figcaption>A Galton board that demonstrates the binomial distribution.</figcaption>
</figure>
<figure class="right_image">
  <a href="harmonograph.html">
    <img alt="Harmonograph simulator" src="./images/harmonograph.png" title="Click to animate"/>
  </a>
  <figcaption>A three-dimensional harmonograph simulator.</figcaption>
</figure>
</div>
<p style="clear: both;"></p>


<a name="spherical_harmonics"></a>
## Spherical harmonics
<div class="header_line"><br/></div>


<div class="double_image">
<figure class="left_image">
  <a href="spherical_harmonics.html">
    <img alt="Spherical harmonics" src="gallery/images/spherical_harmonics.png" title="Click to animate"/>
  </a>
  <figcaption><a href="https://en.wikipedia.org/wiki/Spherical_harmonics">Spherical harmonics</a> 
  play an important role in both physics and mathematics.</figcaption>
</figure>
<figure class="right_image">
  <a href="spherical_harmonics.html">
    <img alt="Spherical harmonics" src="gallery/images/spherical_harmonic_3.png" title="Click to animate"/>
  </a>
  <figcaption><a href="https://en.wikipedia.org/wiki/Spherical_harmonics">Spherical harmonics</a> 
  play an important role in both physics and mathematics.</figcaption>
</figure>
</div>
<p style="clear: both;"></p>

<details>
  <summary><a>&dArr; Python code snippet for plotting spherical harmonics &uArr;</a></summary>

The spherical harmonic function is given by

$$\begin{cases} \rho &amp; = 4 \cos^2(2\theta)\sin^2(\phi) \\  \theta &amp; = [0, 2\pi] \\ \phi &amp; = [0, \pi]  \end{cases}$$

This can then easily be translated to the graphing software, that can also be 
seen in the mathematics section on this page:


<div class="language-python highlighter-rouge"><div class="highlight"><pre class="highlight"><code><span class="k">def</span> <span class="nf">sphere_harmonic</span><span class="p">():</span>
    <span class="n">theta</span> <span class="o">=</span> <span class="n">np</span><span class="p">.</span><span class="n">linspace</span><span class="p">(</span><span class="o">-</span><span class="mf">1.1</span> <span class="o">*</span> <span class="n">pi</span><span class="p">,</span> <span class="n">pi</span><span class="p">,</span> <span class="mi">100</span><span class="p">)</span>
    <span class="n">phi</span> <span class="o">=</span> <span class="n">np</span><span class="p">.</span><span class="n">linspace</span><span class="p">(</span><span class="mi">0</span><span class="p">,</span> <span class="n">pi</span><span class="p">,</span> <span class="mi">100</span><span class="p">)</span>
    <span class="n">U</span><span class="p">,</span> <span class="n">V</span> <span class="o">=</span> <span class="n">np</span><span class="p">.</span><span class="n">meshgrid</span><span class="p">(</span><span class="n">theta</span><span class="p">,</span> <span class="n">phi</span><span class="p">)</span><br/>
    <span class="n">R1</span> <span class="o">=</span> <span class="n">np</span><span class="p">.</span><span class="n">cos</span><span class="p">(</span><span class="n">U</span><span class="p">.</span><span class="n">multiply</span><span class="p">(</span><span class="mi">2</span><span class="p">)).</span><span class="n">multiply</span><span class="p">(</span><span class="n">np</span><span class="p">.</span><span class="n">cos</span><span class="p">(</span><span class="n">U</span><span class="p">.</span><span class="n">multiply</span><span class="p">(</span><span class="mi">2</span><span class="p">)))</span>
    <span class="n">R2</span> <span class="o">=</span> <span class="n">np</span><span class="p">.</span><span class="n">sin</span><span class="p">(</span><span class="n">V</span><span class="p">).</span><span class="n">multiply</span><span class="p">(</span><span class="n">np</span><span class="p">.</span><span class="n">sin</span><span class="p">(</span><span class="n">V</span><span class="p">))</span>
    <span class="n">R</span> <span class="o">=</span> <span class="n">R1</span><span class="p">.</span><span class="n">multiply</span><span class="p">(</span><span class="n">R2</span><span class="p">).</span><span class="n">multiply</span><span class="p">(</span><span class="mi">4</span><span class="p">)</span><br/>
    <span class="n">X</span> <span class="o">=</span> <span class="n">np</span><span class="p">.</span><span class="n">sin</span><span class="p">(</span><span class="n">U</span><span class="p">).</span><span class="n">multiply</span><span class="p">(</span><span class="n">np</span><span class="p">.</span><span class="n">cos</span><span class="p">(</span><span class="n">V</span><span class="p">)).</span><span class="n">multiply</span><span class="p">(</span><span class="n">R</span><span class="p">)</span>
    <span class="n">Y</span> <span class="o">=</span> <span class="n">np</span><span class="p">.</span><span class="n">sin</span><span class="p">(</span><span class="n">U</span><span class="p">).</span><span class="n">multiply</span><span class="p">(</span><span class="n">np</span><span class="p">.</span><span class="n">sin</span><span class="p">(</span><span class="n">V</span><span class="p">)).</span><span class="n">multiply</span><span class="p">(</span><span class="n">R</span><span class="p">)</span>
    <span class="n">Z</span> <span class="o">=</span> <span class="n">np</span><span class="p">.</span><span class="n">cos</span><span class="p">(</span><span class="n">U</span><span class="p">).</span><span class="n">multiply</span><span class="p">(</span><span class="n">R</span><span class="p">)</span>
    <span class="k">return</span> <span class="n">X</span><span class="p">,</span> <span class="n">Y</span><span class="p">,</span> <span class="n">Z</span><span class="p">,</span> <span class="bp">None</span><span class="p">,</span> <span class="bp">None</span>
</code></pre></div></div>

</details>
<p style="clear: both;"></p>

<a name="numerical_methods"></a>
## Numerical methods
<div class="header_line"><br/></div>

<div class="double_image">
<figure class="left_image">
  <a href="numerical_methods.html">
    <img alt="Numerical methods" src="./images/numerical_methods.png" title="Click to animate"/>
  </a>
  <figcaption>Comparison between an exact solution and those from various numerical methods, such as 
  <a href="https://en.wikipedia.org/wiki/Euler_method">Euler method</a> and
  <a href="https://en.wikipedia.org/wiki/Runge%E2%80%93Kutta_methods">Runge-Kutta</a> methods (2 and 4).
  </figcaption>
</figure>
<figure class="right_image">
  <a href="integration_with_polar_coordinates.html">
    <img alt="Numeric integration" src="../images/integration_with_polar_coordinates.png" title="Click to animate"/>
  </a>
  <figcaption>Illustration of using polar coordinates when numerically integrating spherically symmetric functions.</figcaption>
</figure>
</div>
<p style="clear: both;"></p>

## References
<div class="header_line"><br/></div>

### Computational Physics

- [Computational Physics](https://github.com/rubinhlandau/CompPhysicsNotebooks/blob/master/CP01.ipynb), a freely available online book!

### Mathematics

- [Geometry, Surfaces, Curves, Polyhedra](https://paulbourke.net/geometry/) on 
  [Paul Bourke](https://paulbourke.net/geometry/)&apos;s website.
- [Parametric surfaces gallery](https://vector-calculus.github.io/parametric-surfaces-gallery/),
  a slides presentation with live Three.js-based surfaces
- [Manim](https://github.com/3b1b/manim), an animation engine for explanatory math videos.
- [Sage](https://doc.sagemath.org/html/en/index.html), an open source MatLab
  on [GitHub](https://doc.sagemath.org/html/en/index.html).
  [Here](https://doc.sagemath.org/html/en/reference/plot3d/sage/plot/plot3d/parametric_plot3d.html) 
  are some 3D-plot examples.

{% include share_buttons.html %}
