{% include breadcrumbs.html %}

## Fluid simulation in pure Javascript
<div class="header_line"><br/></div>

- Copyright 2022 [Matthias Müller](www.matthiasMueller.info/tenMinutePhysics) &mdash; [Ten Minute Physics](www.youtube.com/c/TenMinutePhysics)
- See also his [GitHub pages](matthias-research.github.io/pages/tenMinutePhysics/index.html)
- Move the obstacle about with your mouse!

<button class="button" onclick="setupScene(1)">Wind Tunnel</button>
<button class="button" onclick="setupScene(3)">Hires Tunnel</button>
<button class="button" onclick="setupScene(0)">Tank</button>
<button class="button" onclick="setupScene(2)">Paint</button>

<input type = "checkbox" id = "streamButton" onclick = "scene.showStreamlines = !scene.showStreamlines">Streamlines
<input type = "checkbox" id = "velocityButton" onclick = "scene.showVelocities = !scene.showVelocities">Velocities
<input type = "checkbox" name = "field" id = "pressureButton" onclick = "scene.showPressure = !scene.showPressure;" checked> Pressure
<input type = "checkbox" name = "field" id = "smokeButton" onclick = "scene.showSmoke = !scene.showSmoke;" checked> Smoke
<input type = "checkbox" id = "overrelaxButton" onclick = "scene.overRelaxation = scene.overRelaxation == 1.0 ? 1.9 : 1.0" checked> Overrelax
<canvas id="myCanvas" style="border: none;"></canvas>

{% include_relative code/fluid_simulation.html %}

<p style="clear: both;"></p>

{% include share_buttons.html %}


