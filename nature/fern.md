{% include breadcrumbs.html %}

## [Barnsley&apos;s fern](https://rosettacode.org/wiki/Barnsley_fern) &mdash; an iterated function system (IFS) fractal
<div class="header_line"><br/></div>

[Michael Barnsley](https://en.wikipedia.org/wiki/Michael_Barnsley)&apos;s fern 
is a fractal that is named after British Mathematician Michael Barnsley, 
because he described this fractal in his book “Fractals Everywhere”. 
It is an example of a so-called “iterated function system” (IFS) fractal, which means
that the construction of this fractal makes use of matrices.

{% include_relative code/Fern.html %}

<p style="clear: both;"></p>

### Background information
<div style="border-top: 1px solid #999999"><br/></div>

<blockquote>
In mathematics, iterated function systems (IFSs) are a method of constructing 
<a href="https://en.wikipedia.org/wiki/Fractal">fractals</a>; 
the resulting fractals are often <a href="https://en.wikipedia.org/wiki/Self-similar">self-similar</a>. 
IFS fractals are more related to set theory 
than fractal geometry. They were introduced in 1981. &mdash;
<a href="https://en.wikipedia.org/wiki/Iterated_function_system">Wikipedia</a>
</blockquote>

From [Michael Barnsley](https://en.wikipedia.org/wiki/Michael_Barnsley)&apos;s own article we quote:

<p style="clear: both;"></p>

<blockquote>
IFSs provide models for certain plants, leaves, and ferns, by virtue of the self-similarity which often occurs 
in branching structures in nature. But nature also exhibits randomness and variation from one level to the next; 
no two ferns are exactly alike, and the branching fronds become leaves at a smaller scale. 
V-variable fractals allow for such randomness and variability across scales, while at the same time 
admitting a continuous dependence on parameters which facilitates geometrical modelling. 
These factors allow us to make the hybrid biological models... ...we speculate that when a V -variable 
geometrical fractal model is found that has a good match to the geometry of a given plant, 
then there is a specific relationship between these code trees and the information 
stored in the genes of the plant. &mdash; 
<a href="https://en.wikipedia.org/wiki/Michael_Barnsley">Michael Barnsley</a>, <i>et al.</i> in
<a href="https://maths-people.anu.edu.au/~barnsley/pdfs/V-var_super_fractals.pdf">V -variable fractals and superfractals</a>
</blockquote>

<p style="clear: both;"></p>

As stated above, the Barnsley Fern is created using a matrix transformation:

$f(x, y)=\begin{pmatrix} a & b \\ c & d \end{pmatrix}\begin{pmatrix}x \\ y\end{pmatrix} + \begin{pmatrix}e \\ f\end{pmatrix}$

Four different transformations are used, illustrated in the table below. 
Variables $a$ to $f$ are the coefficients, 
and $p$ is the probability factor.

| a     | b     | c     |   d  |  e   | f    | p    | Part generated       | 
|-------|-------|-------|------|------|------|------|----------------------|
|  0.00 | 0.00  | 0.00  | 0.16 |  0   | 0    | 0.01 | Stem                 |
| 0.85  | 0.04  | -0.04 | 0.85 |   0  | 1.60 | 0.85 | Small leaflet        |
| 0.20  | -0.26 | 0.23  | 0.22 |  0   | 1.60 | 0.07 | Left large leaflet   | 
| -0.15 | 0.28  | 0.26  | 0.24 |  0   | 0.44 | 0.07 | Right large leaflet  |


From this table, we can create the 4 functions for our program:

```python
def transform(self, x, y):
    rand = uniform(0, 100)
    if rand < 1:
        return 0, 0.16 * y
    elif 1 <= rand < 86:
        return 0.85 * x + 0.04 * y, -0.04 * x + 0.85 * y + 1.6
    elif 86 <= rand < 93:
        return 0.2 * x - 0.26 * y, 0.23 * x + 0.22 * y + 1.6
    else:
        return -0.15 * x + 0.28 * y, 0.26 * x + 0.24 * y + 0.44
```

<p style="clear: both;"></p>

{% include share_buttons.html %}