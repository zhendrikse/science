{% include breadcrumbs.html %}

<a name="waves"></a>
# Vibrations &amp; Waves
<div class="header_line"><br/></div>

<blockquote>
Bring forward what is true. Write it so that it is clear. Defend it to your last breath. &mdash;
<a href="https://en.wikipedia.org/wiki/Ludwig_Boltzmann">Ludwig Boltzmann</a>
</blockquote><br/>

### Wave propagation in a pool
<div class="subsection_header_line"><br/></div>

<div class="double_image">
<figure class="left_image">
  <a href="pool_with_obstacle.html">
    <img alt="Swimming pool" src="images/pool_with_obstacle.png" title="Click to animate"/>
  </a>
  <figcaption><br/>
  <a href="https://en.wikipedia.org/wiki/Central_differencing_scheme">Central finite difference method</a> 
  used to model wave propagation in a pool with an obstruction. 
  </figcaption>
</figure>
<figure class="right_image">
  <a href="pool_with_moving_obstacle.html">
    <img alt="Swimming pool" src="images/pool_with_moving_obstacle.png" title="Click to animate"/>
  </a>
  <figcaption><a href="https://en.wikipedia.org/wiki/Central_differencing_scheme">Finite difference method</a> 
  applied to wave propagation in case of a moving obstruction. 
  </figcaption>
</figure>
</div>
<p style="clear: both;"></p>

<details>
  <summary><a>&dArr; The central finite difference method &uArr;</a></summary>

<p>The two-dimensional <a href="https://en.wikipedia.org/wiki/Wave_equation">scalar wave equation</a> is given by:</p>
<p>
$$\frac{\partial^2 u}{\partial t^2} = c^2 \left(
\frac{\partial^2 u}{\partial x^2} + \frac{\partial^2 u}{\partial y^2} \right)$$
</p>
<p>where</p>
<ul>
  <li>$c$ designates the speed of the wave</li>
  <li>$u$ is a scalar field representing the displacement</li>
  <li>$x$, $y$ are the two spatial coordinates and t the time coordinate.</li>
</ul>

<p>To solve this equation numerically, we create a grid of size $L_x \times L_y$
with equal spacings </p>
<p>$dx =\frac{L_x}{N_x-1}$ \text{ and } $dy = \frac{L_y}{N_y-1}$</p>

<p>There is a balance to be struck between the number of points $N_x$ and $N_y$
(the resolution) on the one hand and the computation time on the other.
Of course, the same holds for the time increment $dt$.</p>

<p>We denote the magnitude of $u$ at point $(i, j)$ on the grid at any given
time $n$ by $ u^{n}_{i, j}$, where $x_i = idx$ and $y_i = jdy$ for 
$i \in [0, \ldots, N_x)$ and $ j \in [0, 1, \ldots, N_y)$.</p>

<p>Note that the round brackets imply that in our code our for-next loops 
will only run to $N_x - 1$ and $N_y - 1$. This ensures that we arrive 
exactly at the endpoints $L_x$ and $L_y$ respectively.</p>

<p>As opposed to the <a href="https://en.wikipedia.org/wiki/Euler_method">Euler algorithm</a>,
that only uses the slope of a function at each point,
the central difference formula estimates the slope
by using points on either side of that point. Due to symmetry,
this results in a more accurate approximation.
So for each time step, we find a new scalar value by looking at 
the current point, and the previous point.</p>

<p>Bearing in mind the definition of a derivative of a function (in one dimension, so only dependent on $x$)</p>
<p>$$f'(x)=\lim_{h \rightarrow 0} \dfrac{f(x + h) - f(x)}{h}$$</p>

<p>we find for each point $x$ at a distance $h$ to both left and right:</p>
<p>$$f'(x) \approx \frac{f(x + h) - f(x - h)}{2h} $$</p>

<p>This implies that an estimate for the second derivative is given by:</p>
<p>$$f''(x) \approx \frac{f(x + h) - 2f(x) + f(x - h)}{h^2} $$</p>

<p>Our wave equation contains these second derivatives both in time</p>
<p>$$\frac{\partial^2 f}{\partial t^2} \approx \frac{f(x, t + h) - 2f(x, t) + f(x, t - h)}{h^2}$$</p>

<p>as well as in spatial coordinates:</p>
<p>$$\frac{\partial^2 f}{\partial x^2} \approx \frac{f(x + h, t) - 2f(x, t) + f(x - h, t)}{h^2}$$</p>

<p>
We want to find $f(x+h,t)$, the 'new' point. Using the 1D Wave
Equation and plugging in the values into: $$\frac{\partial^2
f}{\partial t^2} = c^2 \frac{\partial^2 f}{\partial x^2}$$
</p>
<p>
We get $$f(x+h,t) = 2f(x,t) - f(x-h,t) + c^2 \frac{h^2}{\Delta
t^2} \left(f(x,t+h) - 2f(x,t) + f(x,t-h\right))$$
</p>
</details>
<p></p>

### The Doppler effect for sound waves
<div class="subsection_header_line"><br/></div>

<div class="double_image">
<figure class="left_image">
  <a href="doppler.html">
    <img alt="Doppler effect" src="images/doppler_effect.png" title="Click to animate"/>
  </a>
  <figcaption>Visualisation of the Doppler effect for sound waves.</figcaption>
</figure>
<figure class="right_image">
  <a href="doppler_waves.html">
    <img alt="Doppler effect" src="images/doppler_waves.png" title="Click to animate"/>
  </a>
  <figcaption>Visualisation of the Doppler effect for sound waves.</figcaption>
</figure>
</div>
<p style="clear: both;"></p>

### Traveling and longitudinal waves
<div style="border-top: 1px solid #999999"><br/></div>

<div class="double_image">
<figure class="left_image">
  <a href="traveling_wave.html">
    <img alt="Traveling wave" src="images/traveling_wave.png" title="Click to animate"/>
  </a>
  <figcaption>A simulation of a traveling wave in a string.</figcaption>
</figure>
<figure class="right_image">
    <a href="n_body_oscillator.html">
      <img alt="N-body coupled oscillator" src="images/n_body_coupled_oscillator.png" title="Click to animate"/>
    </a>
    <figcaption>Discover what happens by changing the number of bodies.</figcaption>
</figure>
</div>
<p style="clear: both;"></p>

### Harmonic oscillations
<div style="border-top: 1px solid #999999"><br/></div>

<div class="double_image">
<figure class="left_image">
  <a href="pendulum_wave.html">
    <img alt="Pendulum wave" src="images/pendulum_wave.png" title="Click to animate"/>
  </a>
  <figcaption>A simulation of a wave with pendulums.</figcaption>
</figure>
<figure class="right_image">
  <a href="suspended_spring.html">
    <img alt="Suspended spring" src="images/suspended_spring.png" title="Click to animate"/>
  </a>
  <figcaption>Visualization of the vibrations in a suspended spring.</figcaption>
</figure>
</div>
<p style="clear: both;"></p>

### 3D wave interference patterns
<div class="subsection_header_line"><br/></div>

<div class="double_image">
<figure class="left_image">
  <a href="pool.html">
    <img alt="Swimming pool" src="images/pool.png" title="Click to animate"/>
  </a>
  <figcaption>"[...] the light that comes out is … is waves, just like in the swimming pool" &mdash; 
  <a href="https://www.youtube.com/watch?v=1qQQXTMih1A">Richard P. Feynman</a>.
  </figcaption>
</figure>
<figure class="right_image">
  <a href="two-source-interference.html">
    <img alt="Interference pattern" src="images/interference_pattern_3d.png" title="Click to animate"/>
  </a>
  <figcaption>Three-dimensional interference pattern by two oscillating point sources.</figcaption>
</figure>
</div>
<p style="clear: both;"></p>

### Waves explained &amp; normal modes of rectangular vibrating membrane &amp;
<div class="subsection_header_line"><br/></div>

<div class="double_image">
<figure class="left_image">
  <a href="waves.html">
    <img alt="Longitudinal and transversal waves" src="images/waves.png" title="Click to animate"/>
  </a>
  <figcaption>Longitudinal and transversal waves.</figcaption>
</figure>
<figure class="right_image">
  <a href="vibrating_membrane.html">
    <img alt="Vibrating membrane" src="images/vibrating_membrane.png" title="Click to animate"/>
  </a>
  <figcaption>Visualization of the normal modes of a vibrating membrane.</figcaption>
</figure>
</div>
<p style="clear: both;"></p>

## References
<div class="header_line"><br/></div>

- [Acoustics and Vibration animations](https://www.acs.psu.edu/drussell/demos.html), by Dr. Daniel A. Russell!
- [The classic wave equation](https://chem.libretexts.org/Courses/Grinnell_College/CHM_364%3A_Physical_Chemistry_2_(Grinnell_College)/02%3A_The_Classical_Wave_Equation) in LibreTexts Chemistry


{% include share_buttons.html %}