<a name="mathematics"></a>
# Mathematics
<div style="border-top: 2px solid #cccccc"><br/></div>

<blockquote>
Mathematics directs the flow of the universe, lurks behind its shapes and curves, 
holds the reins of everything from tiny atoms to the biggest stars. &mdash; 
<a href="https://en.wikipedia.org/wiki/Edward_Frenkel">Edward Frenkel</a>
</blockquote><br/>

The code pertaining to the demos in this section is available under the 
[mathematics tab](https://glowscript.org/#/user/zeger.hendrikse/folder/Math/)
on [glowscript.org](https://glowscript.org/#/user/zeger.hendrikse/).

### Dynamic 3D-plots of multivariate and complex functions
<div style="border-top: 1px solid #999999"><br/></div>

<div style="display: flex; align-items: flex-end;">
<figure style="float: left; width: 50%; text-align: center">
  <a href="glowscript/NumpyMatplot3D.html">
    <img alt="Multivariate functions" src="./images/3d_plot.png" title="Click to animate"/>
  </a>&nbsp;&nbsp;&nbsp;
  <figcaption>Plotting <a href="https://en.wikipedia.org/wiki/Function_of_several_real_variables">multivariate functions</a> 
  where $F(x, y) \rightarrow \mathbb{R}, (x, y) \in \mathbb{R} $.</figcaption>
</figure>
<figure style="float: right; width: 50%; text-align: center">
  <a href="glowscript/Complexfunctionplot.html">
    <img alt="Complex functions" src="./images/complex_function_plot.png" title="Click to animate"/>
  </a>
  <figcaption>3D-visualizations of <a href="https://en.wikipedia.org/wiki/Complex_analysis">complex functions</a> 
  where $F(z) \rightarrow \mathbb{C}, z \in \mathbb{C}$.</figcaption>
</figure>
</div>
<p style="clear: both;"></p>

<details>
  <summary><a>&dArr; Code snippets used for these plots &uArr;</a></summary>

The formula for the above image is given by:

$$\psi(x, y, t) = \sin\left(\sqrt{x^2+y^2}\right)$$

<p>The following Python code was used to plot the graph belonging to this multivariate function:<br/></p>

<div class="language-python highlighter-rouge"><div class="highlight"><pre class="highlight"><code><span class="k">def</span> <span class="nf">sine_sqrt</span><span class="p">():</span>
    <span class="n">resolution</span> <span class="o">=</span> <span class="mi">50</span>
    <span class="n">x</span> <span class="o">=</span> <span class="n">y</span> <span class="o">=</span> <span class="n">np</span><span class="p">.</span><span class="n">linspace</span><span class="p">(</span><span class="o">-</span><span class="mi">2</span> <span class="o">*</span> <span class="n">pi</span><span class="p">,</span> <span class="mi">2</span> <span class="o">*</span> <span class="n">pi</span><span class="p">,</span> <span class="n">resolution</span><span class="p">)</span>
    <span class="n">xx</span><span class="p">,</span> <span class="n">yy</span> <span class="o">=</span> <span class="n">np</span><span class="p">.</span><span class="n">meshgrid</span><span class="p">(</span><span class="n">x</span><span class="p">,</span> <span class="n">y</span><span class="p">)</span>
    <span class="n">x_2_plus_y_2</span> <span class="o">=</span> <span class="n">xx</span><span class="p">.</span><span class="n">multiply</span><span class="p">(</span><span class="n">xx</span><span class="p">).</span><span class="n">add</span><span class="p">(</span><span class="n">yy</span><span class="p">.</span><span class="n">multiply</span><span class="p">(</span><span class="n">yy</span><span class="p">))</span>
    <span class="n">zz</span> <span class="o">=</span> <span class="n">np</span><span class="p">.</span><span class="n">sin</span><span class="p">(</span><span class="n">np</span><span class="p">.</span><span class="n">sqrt</span><span class="p">(</span><span class="n">x_2_plus_y_2</span><span class="p">)).</span><span class="n">multiply</span><span class="p">(</span><span class="mi">5</span><span class="p">)</span>

    <span class="k">return</span> <span class="n">xx</span><span class="p">,</span> <span class="n">yy</span><span class="p">,</span> <span class="n">zz</span>

<span class="n">xx</span><span class="p">,</span> <span class="n">yy</span><span class="p">,</span> <span class="n">zz</span> <span class="o">=</span> <span class="n">sine_sqrt</span><span class="p">()</span>
<span class="n">plot</span> <span class="o">=</span> <span class="n">Plot3D</span><span class="p">(</span><span class="n">xx</span><span class="p">,</span> <span class="n">yy</span><span class="p">,</span> <span class="n">zz</span><span class="p">)</span>
</code></pre></div></div>


<p>The 
<a href="https://matplotlib.org/stable/gallery/mplot3d/surface3d_radial.html#sphx-glr-gallery-mplot3d-surface3d-radial-py">mexican hat</a> 
is most easily obtained by using polar coordinates:</p>

$$\begin{pmatrix} x \\ y \\ z \end{pmatrix}=\begin{pmatrix} r\cos(\phi) \\ \sin(\phi)) \\ (r^2 - 1)^2 \end{pmatrix}$$

<p><br/>This leads to the following Python code<br/></p>


<div class="language-python highlighter-rouge"><div class="highlight"><pre class="highlight"><code><span class="k">def</span> <span class="nf">mexican_hat</span><span class="p">():</span>
    <span class="n">r</span> <span class="o">=</span> <span class="n">np</span><span class="p">.</span><span class="n">linspace</span><span class="p">(</span><span class="mi">0</span><span class="p">,</span> <span class="mf">1.25</span><span class="p">,</span> <span class="mi">50</span><span class="p">)</span>
    <span class="n">p</span> <span class="o">=</span> <span class="n">np</span><span class="p">.</span><span class="n">linspace</span><span class="p">(</span><span class="o">-</span><span class="n">pi</span><span class="p">,</span> <span class="mf">1.05</span> <span class="o">*</span> <span class="n">pi</span><span class="p">,</span> <span class="mi">50</span><span class="p">)</span>
    <span class="n">R</span><span class="p">,</span> <span class="n">P</span> <span class="o">=</span> <span class="n">np</span><span class="p">.</span><span class="n">meshgrid</span><span class="p">(</span><span class="n">r</span><span class="p">,</span> <span class="n">p</span><span class="p">)</span>
    <span class="n">Z</span> <span class="o">=</span> <span class="n">R</span><span class="p">.</span><span class="n">multiply</span><span class="p">(</span><span class="n">R</span><span class="p">).</span><span class="n">subtract</span><span class="p">(</span><span class="mi">1</span><span class="p">).</span><span class="n">multiply</span><span class="p">(</span><span class="n">R</span><span class="p">.</span><span class="n">multiply</span><span class="p">(</span><span class="n">R</span><span class="p">).</span><span class="n">subtract</span><span class="p">(</span><span class="mi">1</span><span class="p">))</span>
    <span class="n">X</span><span class="p">,</span> <span class="n">Y</span> <span class="o">=</span> <span class="n">np</span><span class="p">.</span><span class="n">cos</span><span class="p">(</span><span class="n">P</span><span class="p">).</span><span class="n">multiply</span><span class="p">(</span><span class="n">R</span><span class="p">),</span> <span class="n">np</span><span class="p">.</span><span class="n">sin</span><span class="p">(</span><span class="n">P</span><span class="p">).</span><span class="n">multiply</span><span class="p">(</span><span class="n">R</span><span class="p">)</span>
    <span class="k">return</span> <span class="n">X</span><span class="p">,</span> <span class="n">Y</span><span class="p">,</span> <span class="n">Z</span>

<span class="n">xx</span><span class="p">,</span> <span class="n">yy</span><span class="p">,</span> <span class="n">zz</span> <span class="o">=</span> <span class="n">mexican_hat</span><span class="p">()</span>
<span class="n">plot</span> <span class="o">=</span> <span class="n">Plot3D</span><span class="p">(</span><span class="n">xx</span><span class="p">,</span> <span class="n">yy</span><span class="p">,</span> <span class="n">zz</span><span class="p">)</span>
</code></pre></div></div>


<p>Similarly, many different geometric shapes such as a <a href="https://www.mattiagiuri.com/2020/11/20/plotting-a-torus-with-python/">torus</a> 
can be generated (select the torus from the drop-down menu in the application):</p>

$$\begin{pmatrix} x \\ y \\ z\end{pmatrix}=\begin{pmatrix} (c + a \cos(v))\cdot\cos(u) \\ (c + a \cos(v))\cdot\sin(u) \\ a \sin(v) \end{pmatrix}$$

<p><br/>This leads to the following Python code<br/></p>

<div class="language-python highlighter-rouge"><div class="highlight"><pre class="highlight"><code><span class="k">def</span> <span class="nf">torus</span><span class="p">():</span>
    <span class="n">c</span> <span class="o">=</span> <span class="mi">3</span>
    <span class="n">a</span> <span class="o">=</span> <span class="mi">1</span>
    <span class="n">xx</span> <span class="o">=</span> <span class="n">yy</span> <span class="o">=</span> <span class="n">np</span><span class="p">.</span><span class="n">linspace</span><span class="p">(</span><span class="o">-</span><span class="n">pi</span><span class="p">,</span> <span class="mf">1.05</span> <span class="o">*</span> <span class="n">pi</span><span class="p">,</span> <span class="mi">75</span><span class="p">)</span>
    <span class="n">U</span><span class="p">,</span> <span class="n">V</span> <span class="o">=</span> <span class="n">np</span><span class="p">.</span><span class="n">meshgrid</span><span class="p">(</span><span class="n">xx</span><span class="p">,</span> <span class="n">yy</span><span class="p">)</span>
    <span class="n">X</span> <span class="o">=</span> <span class="p">(</span><span class="n">np</span><span class="p">.</span><span class="n">cos</span><span class="p">(</span><span class="n">V</span><span class="p">).</span><span class="n">multiply</span><span class="p">(</span><span class="n">a</span><span class="p">).</span><span class="n">add</span><span class="p">(</span><span class="n">c</span><span class="p">)).</span><span class="n">multiply</span><span class="p">(</span><span class="n">np</span><span class="p">.</span><span class="n">cos</span><span class="p">(</span><span class="n">U</span><span class="p">))</span>
    <span class="n">Y</span> <span class="o">=</span> <span class="p">(</span><span class="n">np</span><span class="p">.</span><span class="n">cos</span><span class="p">(</span><span class="n">V</span><span class="p">).</span><span class="n">multiply</span><span class="p">(</span><span class="n">a</span><span class="p">).</span><span class="n">add</span><span class="p">(</span><span class="n">c</span><span class="p">)).</span><span class="n">multiply</span><span class="p">(</span><span class="n">np</span><span class="p">.</span><span class="n">sin</span><span class="p">(</span><span class="n">U</span><span class="p">))</span>
    <span class="n">Z</span> <span class="o">=</span> <span class="n">np</span><span class="p">.</span><span class="n">sin</span><span class="p">(</span><span class="n">V</span><span class="p">).</span><span class="n">multiply</span><span class="p">(</span><span class="n">a</span><span class="p">)</span>
    <span class="k">return</span> <span class="n">X</span><span class="p">,</span> <span class="n">Y</span><span class="p">,</span> <span class="n">Z</span>

<span class="n">xx</span><span class="p">,</span> <span class="n">yy</span><span class="p">,</span> <span class="n">zz</span> <span class="o">=</span> <span class="n">torus</span><span class="p">()</span>
<span class="n">plot</span> <span class="o">=</span> <span class="n">Plot3D</span><span class="p">(</span><span class="n">xx</span><span class="p">,</span> <span class="n">yy</span><span class="p">,</span> <span class="n">zz</span><span class="p">)</span>
</code></pre></div></div>

</details>

<p></p>

### Polar coordinates &amp; spherical harmonics
<div style="border-top: 1px solid #999999"><br/></div>

Polar coordinates not only enable us to much more easily solve spherically symmetric problems in 
both physics and mathematics, they also provide us a way to parameterize complex topological surfaces, 
such  as [Klein&apos;s bottle](geometry#non_orientables) (shown below in the topology subsection). 


<div style="display: flex; align-items: flex-end;">
<figure style="float: left; width: 50%; text-align: center">
  <a href="glowscript/PolarCoordinates">
    <img alt="Polar coordinates" src="./images/polar_coordinates.png" title="Click to animate"/>
  </a>
  <figcaption>Polar coordinates frequently simplify the tackling of rotationally symmetric problems.</figcaption>
</figure>
<figure style="float: right; width: 50%; text-align: center">
  <a href="glowscript/AtomicOrbitals.html">
    <img alt="Spherical harmonics" src="./images/geometry/spherical_harmonics.png" title="Click to animate"/>
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


<div class="language-python highlighter-rouge"><div class="highlight"><pre class="highlight"><code><span class="k">def</span> <span class="nf">sphere_harmonics</span><span class="p">():</span>
    <span class="n">theta</span> <span class="o">=</span> <span class="n">np</span><span class="p">.</span><span class="n">linspace</span><span class="p">(</span><span class="o">-</span><span class="mf">1.1</span> <span class="o">*</span> <span class="n">pi</span><span class="p">,</span> <span class="n">pi</span><span class="p">,</span> <span class="mi">100</span><span class="p">)</span>
    <span class="n">phi</span> <span class="o">=</span> <span class="n">np</span><span class="p">.</span><span class="n">linspace</span><span class="p">(</span><span class="mi">0</span><span class="p">,</span> <span class="n">pi</span><span class="p">,</span> <span class="mi">100</span><span class="p">)</span>
    <span class="n">U</span><span class="p">,</span> <span class="n">V</span> <span class="o">=</span> <span class="n">np</span><span class="p">.</span><span class="n">meshgrid</span><span class="p">(</span><span class="n">theta</span><span class="p">,</span> <span class="n">phi</span><span class="p">)</span>
    
    <span class="n">R1</span> <span class="o">=</span> <span class="n">np</span><span class="p">.</span><span class="n">cos</span><span class="p">(</span><span class="n">U</span><span class="p">.</span><span class="n">multiply</span><span class="p">(</span><span class="mi">2</span><span class="p">)).</span><span class="n">multiply</span><span class="p">(</span><span class="n">np</span><span class="p">.</span><span class="n">cos</span><span class="p">(</span><span class="n">U</span><span class="p">.</span><span class="n">multiply</span><span class="p">(</span><span class="mi">2</span><span class="p">)))</span>
    <span class="n">R2</span> <span class="o">=</span> <span class="n">np</span><span class="p">.</span><span class="n">sin</span><span class="p">(</span><span class="n">V</span><span class="p">).</span><span class="n">multiply</span><span class="p">(</span><span class="n">np</span><span class="p">.</span><span class="n">sin</span><span class="p">(</span><span class="n">V</span><span class="p">))</span>
    <span class="n">R</span> <span class="o">=</span> <span class="n">R1</span><span class="p">.</span><span class="n">multiply</span><span class="p">(</span><span class="n">R2</span><span class="p">).</span><span class="n">multiply</span><span class="p">(</span><span class="mi">4</span><span class="p">)</span>
    
    <span class="n">X</span> <span class="o">=</span> <span class="n">np</span><span class="p">.</span><span class="n">sin</span><span class="p">(</span><span class="n">U</span><span class="p">).</span><span class="n">multiply</span><span class="p">(</span><span class="n">np</span><span class="p">.</span><span class="n">cos</span><span class="p">(</span><span class="n">V</span><span class="p">)).</span><span class="n">multiply</span><span class="p">(</span><span class="n">R</span><span class="p">)</span>
    <span class="n">Y</span> <span class="o">=</span> <span class="n">np</span><span class="p">.</span><span class="n">sin</span><span class="p">(</span><span class="n">U</span><span class="p">).</span><span class="n">multiply</span><span class="p">(</span><span class="n">np</span><span class="p">.</span><span class="n">sin</span><span class="p">(</span><span class="n">V</span><span class="p">)).</span><span class="n">multiply</span><span class="p">(</span><span class="n">R</span><span class="p">)</span>
    <span class="n">Z</span> <span class="o">=</span> <span class="n">np</span><span class="p">.</span><span class="n">cos</span><span class="p">(</span><span class="n">U</span><span class="p">).</span><span class="n">multiply</span><span class="p">(</span><span class="n">R</span><span class="p">)</span>
    <span class="k">return</span> <span class="n">X</span><span class="p">,</span> <span class="n">Y</span><span class="p">,</span> <span class="n">Z</span><span class="p">,</span> <span class="bp">None</span><span class="p">,</span> <span class="bp">None</span>

<span class="n">xx</span><span class="p">,</span> <span class="n">yy</span><span class="p">,</span> <span class="n">zz</span> <span class="o">=</span> <span class="n">sphere_harmonics</span><span class="p">()</span>
<span class="n">plot</span> <span class="o">=</span> <span class="n">Plot3D</span><span class="p">(</span><span class="n">xx</span><span class="p">,</span> <span class="n">yy</span><span class="p">,</span> <span class="n">zz</span><span class="p">)</span>

</code></pre></div></div>

</details>
<p style="clear: both;"></p>

### [Topology](geometry.html)
<div style="border-top: 1px solid #999999"><br/></div>

<div style="display: flex; align-items: flex-end;">
<figure style="float: left; width: 50%; text-align: center">
  <a href="glowscript/GeometricShapes">
    <img alt="Twisted torus" src="./images/geometry/twisted_torus.png" title="Click to animate"/>
  </a>
  <figcaption>A twisted torus. For more surfaces, visit the <a href="geometry.html">Math Art Gallery</a>.</figcaption>
</figure>
<figure style="float: right; width: 50%; text-align: center">
  <a href="glowscript/GeometricShapes.html">
    <img alt="Klein&apos;s bottle" src="./images/geometry/klein_bottle.png" title="Click to animate"/>
  </a>
  <figcaption><a href="https://en.wikipedia.org/wiki/Klein_bottle">Klein&apos;s bottle</a>.
  For more surfaces, visit the <a href="geometry.html">Math Art Gallery</a>.</figcaption>
</figure>
</div>
<p style="clear: both;"></p>
