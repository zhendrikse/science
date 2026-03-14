{% include breadcrumbs.html %}

## Rendering black holes using ray tracing
<div class="header_line"><br/></div>

[![Source](https://img.shields.io/badge/github-repo-green?logo=github&label=black_hole_space_time.js)](https://github.com/zhendrikse/science/blob/main/relativity/black_hole_space_time.js)&nbsp;&nbsp;
[![JavaScript](https://img.shields.io/badge/JavaScript-007ACC?logo=javascript&logoColor=white)](https://en.wikipedia.org/wiki/JavaScript)&nbsp;&nbsp;
[![Three.js](https://img.shields.io/badge/Three.js-000000?logo=three.js&logoColor=white)](https://threejs.org/)&nbsp;&nbsp;
[![WebGL](https://img.shields.io/badge/WebGL-990000?logo=webgl&logoColor=white)](https://www.khronos.org/webgl/)

### Space-time ray tracing
<div class="header_line"><br/></div>

🔧 Source can be found in [black_hole_space_time.js](https://github.com/zhendrikse/science/blob/main/relativity/black_hole_space_time.js)<br/>
⭐ Based on [Simulating a Schwarzschild Black Hole: Part 1 — The Background and Raytracer](https://medium.com/@cadenmarinozzi/simulating-a-schwarzschild-black-hole-part-1-the-background-and-raytracer-7de436a56b7e) by [Caden Marinozzi](https://medium.com/@cadenmarinozzi)<br/>
👉 Extended with the relativistic formula used for real-time black hole shaders (null geodesic approximation of the Schwarzschild metric):

$$
\frac{d\vec v}{ds} = -\frac{3GM}{r^3}\left(\vec v \times (\vec r \times \vec v)\right) \text{,}
$$

$$
\begin{cases} \vec{v} &= \text{ray direction} \\ 
\vec{r} &= \text{position with respect to the black hole} \\
GM &= \text{gravitational parameter} 
\end{cases}
$$

👉 Result: correct photon orbit behavior, stronger bending near the hole and realistic 
[Einstein ring](https://en.wikipedia.org/wiki/Einstein_ring).

<canvas id="spaceTimeBendingCanvas" style="width: 100%; aspect-ratio: 2/1;"></canvas>
<div class="buttonRow">
    <label for="massSlider">Mass:&nbsp;</label>
    <input type="range" id="massSlider" style="width: 55%;" min="0.01" max="0.25" step="0.01" value="0.1" />
</div>
<script type="module" src="./black_hole_space_time.js"></script>
<p style="clear: both;"></p>

{% include_relative black_hole_background_info.md %}

{% include share_buttons.html %}


    

