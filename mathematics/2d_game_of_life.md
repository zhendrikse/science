{% include breadcrumbs.html %}

## Conway's game of life  🎮
<div class="header_line"><br/></div>

[Conway&apos;s Game of Life](https://conwaylife.com/) illustrates the same principle as
the [Mandelbrot set](https://www.hendrikse.name/science/mathematics/mandelbrot.html),
namely that complex structures can emerge from an astonishingly small and simple set of rules.

{% include_relative code/2d_game_of_life.html %}

<p style="clear: both;"></p>

### Game of Life – 2D cellular automaton
<div class="header_line"><br/></div>

This visualization shows **Conway’s Game of Life**, a simple mathematical model 
where complex behavior emerges from very simple rules.

The space is divided into a grid of cells.
Each cell is either:

* **alive** (yellow pixel), or
* **dead** (black pixel).

---

### Rules of the game

At each time step, every cell updates simultaneously based on its **eight neighbors**:

1. A living cell survives if it has **2 or 3 living neighbors**
2. A dead cell becomes alive if it has **exactly 3 living neighbors**
3. All other cells die or remain dead

These rules can be written as:

$$
\text{alive}_{t+1}(x,y)
\begin{cases}
1 & \text{if } n=3 \\
1 & \text{if } n=2 \text{ and alive}_t=1 \\
0 & \text{otherwise}
\end{cases}
$$

---

### What you observe

* Stable structures
* Oscillating patterns
* Moving objects (gliders)
* Chaotic growth from simple beginnings

No randomness is added after the start — **all complexity emerges from the rules alone**.

---

### Why this matters

The Game of Life is a classic example of:

* emergent behavior
* cellular automata
* how local rules can produce global structure

It appears in physics, biology, computer science, and artificial life research.


{% include share_buttons.html %}