{% include breadcrumbs.html %}

## Generating Mandelbrot images using VPython

<div class="header_line"><br/></div>

{% include_relative code/mandelbrot.html %}

<p style="clear: both;"></p>

## Background information
<div class="header_line"><br/></div>


### Mandelbrot set explained visually
<div style="border-top: 1px solid #999999"><br/></div>

The Mandelbrot set is a type of shape, known as a fractal. This fractal can 
be drawn on a piece of paper, or on a computer screen, i.e. a plane. Each point
in this plane actually represents a (two-dimensional) value/number, called a
complex number.

The collection of points, or numbers that lie "inside" the fractal (black part), 
_is_ the actual Mandelbrot set. The remaining points are said to be 
"outside" the Mandelbrot set. 

Whether a point is on the inside or outside, is associated with a mathematical
concept called convergence (and divergence). For example, if you multiply a number again
and again by itself, it runs away to infinity if your starting value is greater than one,
i.e. it diverges, and it approaches zero if your starting value is less than one, i.e. it
converges. And, of course, if you start with 1, it always remains one.

So summarizing, the Mandelbrot set depicts which set of (two-dimensional) numbers diverge
when multiplied by itself (the Mandelbrot set, or the inside), and which set of numbers
converges when multiplied by itself (the outside).

A more thorough visual explanation is given in the video 
[The Mandelbrot Set Explained](https://www.youtube.com/watch?v=7MotVcGvFMg).

### Mandelbrot set defined mathematically
<div style="border-top: 1px solid #999999"><br/></div>

A Mandelbrot set is defined as a two-dimensional set in the complex plane $\mathbb{C}$ 
for which an infinite sequence of numbers $z_n$, defined by the
recursive relation

$z_{n+1} = z_n^2 + c, z_0 = 0$

does _not_ diverge to infinity. The parameter $c$ is also known as point of interest.

The complex numbers that do remain bounded 
make up the inner glowing regions of the Mandelbrot set. Particularly interesting 
behaviour shows up near the edges of the set. The visualizations are realized by 
color-coding exactly this rate of divergence. 

The Mandelbrot set illustrates the same principle as 
[Conway&apos;s Game of Life](https://www.hendrikse.name/science/mathematics/2d_game_of_life.html), 
namely  that complex structures can emerge from an astonishingly small and simple set of rules.

There are certain regions of values for the parameter $c$ (point of interest), where
a tiny change in the value of this parameter $c$ results in a completely different
(convergence) behaviour of our function. Any system that responds completely differently
to any such a tiny change in its parameter(s) is said to behave chaotically.

[Chaos theory](https://en.wikipedia.org/wiki/Chaos_theory) studies exactly these kind of systems. They are said to behave chaotically, 
as they turn out to behave unpredictably given there sensitivity on their initial/boundary condition(s).

Chaotic systems are quite well known because of the so-called [butterfly-effect](https://en.wikipedia.org/wiki/Butterfly_effect): 
a distant butterfly flapping its wings a few weeks ago, may be causing a tornado’s route to change 
its course, similar to a slight change in a parameter value (in this case of the constant $c$)
that causes the function to either diverge to infinity or remain bounded.

The butterfly-effect is more rigorously is defined as a deterministic 
non-linear response of a system that for its future state(s) is (extremely) 
sensitive on one or more of its initial conditions.

### Some history
<div style="border-top: 1px solid #999999"><br/></div>

Robert W. Brooks &amp; Peter Matelski first described and illustrated this set in 
1978 as a part of a study on Kleinian groups. Two years later, 
[Benoît Mandelbrot](https://en.wikipedia.org/wiki/Benoit_Mandelbrot) managed to create 
the first now well-known visualizations of the set, 
while working at IBM’s Thomas J. Watson Research Center in New York:

<blockquote>
Because of his access to IBM's computers, Mandelbrot was one of the first to use computer 
graphics to create and display fractal geometric images, leading to his discovery of the 
Mandelbrot set in 1980. He showed how visual complexity can be created from simple rules. 
He said that things typically considered to be "rough", a "mess", or "chaotic", 
such as clouds or shorelines, actually had a "degree of order". &mdash; 
<a href="https://en.wikipedia.org/wiki/Benoit_Mandelbrot">Wikipedia</a>
</blockquote><br/>

The term fractal was coined by [Benoît Mandelbrot](https://en.wikipedia.org/wiki/Benoit_Mandelbrot) 
himself, and is derived from the Latin word ‘fractus’, which means broken or fractured.

### Implementation in VPython / Glowscript
<div style="border-top: 1px solid #999999"><br/></div>

A so-called escape-time algorithm is used to generate the visualizations. This is a very
straight forward algorithm, that simply counts the number of 
iterations that is needed to detect whether a divergence has occurred or not.
This value is subsequently used for color-coding the pixels.

The Visualization with VPython is based on an extremely simple technique, namely by representing
each dot as coordinate in the `points()` object. Everytime the divergence of 
a pixel has been calculated, it is simply added to this `points()` object 
with the appropriate color coding:

```python
for x in range(width):
    for y in range(height):
        # Map pixel to complex plane
        re = x_min + (x / width) * (x_max - x_min)
        im = y_min + (y / height) * (y_max - y_min)
        c = complex_(re, im)
        z = complex_(0, 0)
        n = 0
        while abs_z_squared(z) <= 4 and n < max_iter:
            z = z_squared_minus_c(z, c)
            n += 1
        brightness = n / max_iter
        if .01 < brightness < 1:
            colour = vector(brightness, sqrt(brightness), brightness**0.2)
            size = vector(pixel_width, pixel_height, 0.01)
            box(pos=vector(re, im, 0), color=colour, size=size, shininess=0)
```

Although the Mandelbrot pictures are purely two-dimensional, the fact that you can
rotate them and view them in three dimensions adds an extra dimension, no pun intended!

### References
<div style="border-top: 1px solid #999999"><br/></div>

- [What's so special about the Mandelbrot Set? &mdash; Numberphile](https://www.youtube.com/watch?v=FFftmWSzgmk)
- [The Feigenbaum Constant (4.669) &mdash; Numberphile](https://www.youtube.com/watch?v=ETrYE4MdoLQ)

<p style="clear: both;"></p>

{% include share_buttons.html %}