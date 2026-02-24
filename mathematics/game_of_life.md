{% include breadcrumbs.html %}

## Conway's game of life  🎮
<div class="header_line"><br/></div>

[Conway&apos;s Game of Life](https://conwaylife.com/) illustrates the same principle as
the [Mandelbrot set](https://www.hendrikse.name/science/mathematics/mandelbrot.html),
namely that complex structures can emerge from an astonishingly small and simple set of rules.

<div class="canvasWrapper2D" id="canvas-wrapper">
    <canvas class="applicationCanvas2D" id="gameOfLifeCanvas"></canvas>
</div>
<div class="buttonRow">
  <label for="cellSizeSelect">Cell size:</label>
  <select id="cellSizeSelect">
    <option value="2">1 px</option>
    <option value="2">2 px</option>
    <option value="4" selected>4 px</option>
    <option value="6">6 px</option>
    <option value="8">8 px</option>
    <option value="12">12 px</option>
    <option value="16">16 px</option>
  </select>
  <label for="frameRateSelect">Frame rate:</label>
  <select id="frameRateSelect">
    <option value="1">1 fps</option>
    <option value="2">2 fps</option>
    <option value="5">5 fps</option>
    <option value="10" selected>10 fps</option>
    <option value="25">25 fps</option>
    <option value="50">50 fps</option>
  </select>
</div>
<div class="buttonRow">
  <label for="acorn"></label><input type="radio" id="acorn"/>&nbsp;Acorn 🌰
  <label for="diehard"></label><input type="radio" id="diehard"/>&nbsp;Die hard 💀
</div>
<div class="buttonRow">
  <label for="doubleGunPulsar"></label><input type="radio" id="doubleGunPulsar"/>&nbsp;Double gun pulsar 🔫
  <label for="glider"></label><input type="radio" id="glider"/>&nbsp;Glider 🛩️
</div>
<div class="buttonRow">
  <label for="gliderGun"></label><input type="radio" id="gliderGun"/>&nbsp;Glider gun 🔫
  <label for="heavyweightSpaceship"></label><input type="radio" id="heavyweightSpaceship"/>&nbsp;Heavyweight spaceship 🚀
</div>
<div class="buttonRow">
  <label for="lightweightSpaceship"></label><input type="radio" id="lightweightSpaceship"/>&nbsp;Lightweight spaceship 🚀
  <label for="megaShowCase"></label><input type="radio" id="megaShowCase"/>&nbsp;Mega showcase 🚨
</div>
<div class="buttonRow">
  <label for="methusalahChaos"></label><input type="radio" id="methusalahChaos"/>&nbsp;Methusalah chaos 😵‍💫
  <label for="oscillatorWall"></label><input type="radio" id="oscillatorWall"/>&nbsp;Oscillator wall ⅏
</div>
<div class="buttonRow">
  <label for="pentadecathlon"></label><input type="radio" id="pentadecathlon"/>&nbsp;Pentadecathlon 🏃🏻
  <label for="pentomino"></label><input type="radio" id="pentomino"/>&nbsp;Pentomino ⚅
</div>
<div class="buttonRow">
  <label for="pulsar"></label><input type="radio" id="pulsar"/>&nbsp;Pulsar 🌟
  <label for="random"></label><input type="radio" id="random" checked/>&nbsp;Random 🎲
</div>
<script type="module" src="game_of_life.js"></script>
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