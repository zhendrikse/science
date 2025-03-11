{% include breadcrumbs.html %}

## Chaos game
<div class="header_line"><br/></div>

The chaos game is an iterative process of placing dots on a canvas
using certain fixed locations (vertices) that are chosen randomly. For example,
in the animation in the section [Why do fractals arise from the chaos game](#chaos_game_explanation) below,
the position of each new dot is halfway between the current position and one of the three
fixed corners of a triangle.

{% include_relative code/ChaosGame.html %}

<p style="clear: both;"></p>

<a name="chaos_game_explanation"></a>
### Why do fractals arise from the chaos game
<div style="border-top: 1px solid #999999"><br/></div>

<figure>
  <a href="https://en.wikipedia.org/wiki/Chaos_game#/media/File:Sierpinski_Chaos.gif">
    <img alt="Sierpinksy chaos" src="images/Sierpinski_Chaos.gif"/>
  </a>
  <figcaption>
    Source <a href="https://en.wikipedia.org/wiki/Chaos_game#/media/File:Sierpinski_Chaos.gif">Wikipedia</a>
  </figcaption>
</figure>

<p style="clear: both;"></p>

Let's assume we start with a point that is located in one of the areas that will eventually be empty, 
see the figure below.

<figure>
  <a href="https://math.bu.edu/DYSYS/chaos-game/node3.html">
    <img alt="Sierpinksy chaos" src="images/sierpinski.gif"/>
  </a>
  <figcaption>
    Source <a href="https://math.bu.edu/DYSYS/chaos-game/node3.html">BU Math</a>
  </figcaption>
</figure>

After one iteration, the point will jump to either one of the three smaller empty triangles. 
Eventually after a couple of iterations, the point will enter a small triangle that is so small that, 
given the finite resolution of the screen and the pixels it contains, it will disappear.


### References
<div style="border-top: 1px solid #999999"><br/></div>

- Chaos game [Wikipedia page](https://en.wikipedia.org/wiki/Chaos_game)
- [Chaos Game &mdash; Numberphile](https://www.youtube.com/watch?v=kbKtFN71Lfs)
- [A 1.58-Dimensional Object &mdash; Numberphile](https://www.youtube.com/watch?v=FnRhnZbDprE)
- [Fractal Dimensions (extra footage) - Numberphile](https://www.youtube.com/watch?v=Yz06NW6DwsE)

<p style="clear: both;"></p>

{% include share_buttons.html %}