{% include breadcrumbs.html %}

## Generating Mandelbrot images using VPython

<div class="header_line"><br/></div>

{% include_relative code/mandelbrot.html %}

<p style="clear: both;"></p>

## Background information
<div class="header_line"><br/></div>

### How is a Mandelbrot set defined?
<div style="border-top: 1px solid #999999"><br/></div>

A Mandelbrot set is defined as a two-dimensional set in the complex plane $\mathbb{C}$ 
for which an infinite sequence of numbers $z_n$, defined by the
recursive relation

$z_{n+1} = z_n^2 + c, z_0 = 0$

does _not_ diverge to infinity. The complex numbers that do remain bounded 
make up the inner glowing regions of the Mandelbrot set. Particularly interesting 
behaviour shows up near the edges of the set. The visualizations are realized by 
color-coding exactly this rate of divergence. 

The Mandelbrot set illustrates the same principle as 
[Conway&apos;s Game of Life](https://conwaylife.com/), namely
that complex structures can emerge from an astonishingly small and simple set of rules.

In addition, this set demonstrates another principle that is well-known from
[chaos theory](https://en.wikipedia.org/wiki/Chaos_theory), namely the so-called
[butterfly-effect](https://en.wikipedia.org/wiki/Butterfly_effect): a slight change 
in a value (in this case of the constant $c$)
causes the function to either diverge to infinity or remain bounded.

The butterfly-effect is more rigorously is defined as a deterministic 
non-linear response of a system that for its future state(s) is (extremely) 
sensitive on one or more of its initial conditions, such as a distant butterfly 
flapping its wings a few weeks ago, causing a tornado’s route to change its course.

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
from vpython import points, vector

class Mandelbrot:
    def __init__(self, max_iterations=100):
        self._pixels = points()
        # ...

    def set_color_for_pixel_at(self, x, y, colour):
        self._pixels.append(pos=vector(x, y, 0), color=colour)

```

Although the Mandelbrot pictures are purely two-dimensional, the fact that you can
rotate them and view them in three dimensions adds an extra dimension, no pun intended!

### References
<div style="border-top: 1px solid #999999"><br/></div>

- [What's so special about the Mandelbrot Set? &mdash; Numberphile](https://www.youtube.com/watch?v=FFftmWSzgmk)
- [The Feigenbaum Constant (4.669) &mdash; Numberphile](https://www.youtube.com/watch?v=ETrYE4MdoLQ)

<p style="clear: both;"></p>

{% include share_buttons.html %}