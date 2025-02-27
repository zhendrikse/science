{% include breadcrumbs.html %}

## Sierpinski pyramid
<div class="header_line"><br/></div>

{% include_relative code/Sierpinski.html %}

<p style="clear: both;"></p>

### Original [student assignment](https://isoptera.lcsc.edu/~seth/cs111/project5.pdf) by [S. Seth Long](https://isoptera.lcsc.edu/~seth/)

Below you find a copy of the original student assignment written by S. Seth Long.

#### Introduction 

Fractals are generated figures which can be highly complex, but are created using algorithms which are
somewhat simplistic. For this project, write a program that uses vpython to generate a Pyramid fractal.

#### The Pyramid Fractal

\[ &hellip; reference to reading material on recursion &hellip; \]

The pyramid fractal is produced by subdividing a pyramid into 5 smaller pyramids, 
and then subdividing each smaller pyramid, continuing until a depth limit is reached. 

This is a recursive fractal. That is, a fractal generated using an algorithm which includes 
itself as a potential step. In general, your program will look something like this:

```
Set up initial pyramid

def subdivide(big_pyramid, subdivisions_remaining)
    if subdivisions_remaining < 1:
        draw big_pyramid
    Create 5 small pyramids based on big_pyramid
    for each small pyramid:
        subdivide(the small pyramid, subdivisions_remaining - 1)

subdivide(initial pyramid, number of subdivisions)
```

Obviously the above is not correct Python code, and some of the steps require some elaboration. 

A pyramid consists of 5 points: A top, and four lower corners. To draw a pyramid, draw lines along each
edge. Look at the curve object in vpython for line drawing. To find a point midway between two other
points (for example, between the top point and one of the lower corners) average each of the three values
that describes the point. You may find it convenient to create a point class. 

Alternatively, there is a `vector` class provided with VPython which supports vector operations. 
It is also possible to represent points as a simple list of three items &amp; x, y, and z coordinate. 
Any of these three methods will work, and it is up to you to choose between them.

The number of subdivisions will be limited by your computer’s capacity, but 3 or 4 should be within
the capacity of most modern laptops. High-end gaming computers may handle many more than this.

<p style="clear: both;"></p>

{% include share_buttons.html %}
