{% include breadcrumbs.html %}

<a name="mathematics"></a>
# Mathematics
<div class="header_line"><br/></div>

<blockquote>
Mathematics directs the flow of the universe, lurks behind its shapes and curves, 
holds the reins of everything from tiny atoms to the biggest stars. &mdash; 
<a href="https://en.wikipedia.org/wiki/Edward_Frenkel">Edward Frenkel</a>
</blockquote><br/>

### Dynamic surface and contour plots for $f(x, y) \rightarrow \mathbb{R}$
<div style="border-top: 1px solid #999999"><br/></div>

<div class="double_image">
<figure class="left_image">
  <a href="multivariate_surface_plot.html">
    <img alt="Multivariate functions" src="../images/multivariate_surface_plot.png" title="Click to animate"/>
  </a>&nbsp;&nbsp;&nbsp;
  <figcaption>Surface plot for $f(x, y) = \sin(\pi x)\cos(\pi y)$.</figcaption>
</figure>
<figure class="right_image">
  <a href="multivariate_contour_plot.html">
    <img alt="Complex functions" src="../images/multivariate_contour_plot.png" title="Click to animate"/>
  </a>
  <figcaption><br/>Contour plot for $f(x, y) = \sin(\sqrt{x^2+y^2})$.</figcaption>
</figure>
</div>
<p style="clear: both;"></p>

### Dynamic surface and contour plots for $f(z) \rightarrow \mathbb{C}$
<div style="border-top: 1px solid #999999"><br/></div>

The colors in the 3D renderings of complex functions represent 
the phase of the complex function values, hence colors can't be
modified by the user.

<div class="double_image">
<figure class="left_image">
  <a href="complex_surface_plot.html">
    <img alt="Complex functions" src="../images/complex_function_plot.png" title="Click to animate"/>
  </a>
  <figcaption>Surface plot for $f(z) = \exp(-z^2)$.</figcaption>
</figure>
<figure class="right_image">
  <a href="complex_contour_plot.html">
    <img alt="Complex functions" src="../images/complex_function_contour_plot.png" title="Click to animate"/>
  </a>
  <figcaption>Contour plot for $f(z) = log(z)$.</figcaption>
</figure>
</div>
<p style="clear: both;"></p>

### Rendering vector fields $f(x, y, z) \rightarrow \mathbb{R}^3$
<div style="border-top: 1px solid #999999"><br/></div>

<div class="double_image">
<figure class="left_image">
  <a href="quiver_plot.html">
    <img alt="Vector field" src="../images/vector_field.png" title="Click to animate"/>
  </a>
  <figcaption>Rendering of 3D vector field and implied flow.</figcaption>
</figure>
<figure class="right_image">
  <!-- RESERVER FOR FUTURE APPLICATION 
    -->
</figure>
</div>
<p style="clear: both;"></p>

### Topology and my [Math Art Gallery](gallery/index.html)
<div style="border-top: 1px solid #999999"><br/></div>

<div class="double_image">
<figure class="left_image">
  <a href="topology_surface_plot.html">
    <img alt="Twisted torus" src="gallery/images/twisted_torus.png" title="Click to animate"/>
  </a>
  <figcaption>Surface plot of twisted torus. For more surfaces, visit the <a href="gallery/index.html">Math Art Gallery</a>.</figcaption>
</figure>
<figure class="right_image">
  <a href="topology_contour_plot.html">
    <img alt="Self-intersecting disk" src="gallery/images/self_intersecting_disk_contour.png" title="Click to animate"/>
  </a>
  <figcaption>Contour plot of <a href="https://en.wikipedia.org/wiki/Real_projective_plane">self-intersecting disk</a>.
  For more surfaces, visit the <a href="gallery/index.html">Math Art Gallery</a>.</figcaption>
</figure>
</div>
<p style="clear: both;"></p>

### Double shapes

<div class="double_image">
<figure class="left_image">
  <a href="double_shapes_surface_plot.html">
    <img alt="Double torus" src="gallery/images/double_torus.png" title="Click to animate"/>
  </a>
  <figcaption>Double torus surface plot. For more surfaces, visit the <a href="gallery/index.html">Math Art Gallery</a>.</figcaption>
</figure>
<figure class="right_image">
  <a href="double_shapes_contour_plot.html">
    <img alt="Klein&apos;s bottle" src="gallery/images/klein_bottle_contour.png" title="Click to animate"/>
  </a>
  <figcaption><a href="https://en.wikipedia.org/wiki/Klein_bottle">Klein&apos;s bottle</a> contour plot.
  For more surfaces, visit the <a href="gallery/index.html">Math Art Gallery</a>.</figcaption>
</figure>
</div>
<p style="clear: both;"></p>

### Polar coordinates &amp; spherical harmonics
<div style="border-top: 1px solid #999999"><br/></div>

Polar coordinates not only enable us to much more easily solve spherically symmetric problems in 
both physics and mathematics, they also provide us a way to parameterize complex topological surfaces, 
such  as [Klein&apos;s bottle](geometry#non_orientables) (shown below in the topology subsection). 


<div class="double_image">
<figure class="left_image">
  <a href="polar_coordinates.html">
    <img alt="Polar coordinates" src="../images/polar_coordinates.png" title="Click to animate"/>
  </a>
  <figcaption>Polar coordinates frequently simplify the tackling of rotationally symmetric problems.</figcaption>
</figure>
<figure class="right_image">
  <a href="spherical_harmonics_surface_plot.html">
    <img alt="Spherical harmonics" src="gallery/images/spherical_harmonics.png" title="Click to animate"/>
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


{% include share_buttons.html %}
