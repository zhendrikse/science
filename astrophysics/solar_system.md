{% include breadcrumbs.html %}

## Solar system
<div class="header_line"><br/></div>

[![Source](https://img.shields.io/badge/github-repo-green?logo=github&label=solar_system.js)](https://github.com/zhendrikse/science/blob/main/astrophysics/solar_system.js)&nbsp;&nbsp;
[![JavaScript](https://img.shields.io/badge/JavaScript-007ACC?logo=javascript&logoColor=white)](https://en.wikipedia.org/wiki/JavaScript)&nbsp;&nbsp;
[![Three.js](https://img.shields.io/badge/Three.js-000000?logo=three.js&logoColor=white)](https://threejs.org/)&nbsp;&nbsp;
[![WebGL](https://img.shields.io/badge/WebGL-990000?logo=webgl&logoColor=white)](https://www.khronos.org/webgl/)

🎯 Improved understanding of planetary motions and eclipses<br/>
🔧 [Newton-Raphson method](https://en.wikipedia.org/wiki/Newton%27s_method) for realistic (elliptic) orbits<br/>
🧠 Inspired on [solar-system](https://github.com/lukekulik/solar-system) by [Luke Kulik](https://github.com/lukekulik/), [threex.planets](https://github.com/jeromeetienne/threex.planets) by [Jemore Etienne](https://github.com/jeromeetienne/), and
[solarsystem](https://github.com/pint-drinker/solarsystem) by [Dana Wensberg](https://github.com/pint-drinker/)<br/>
👉 Includes tilt, spin and tidal locking of applicable moons e.g. Earth’s moon<br/>
🚀 Features advanced techniques for rendering earth clouds &amp; subtle corona breathing driven by magnetic turbulence<br/>
🐍 A [VPython demo](https://www.glowscript.org/#/user/zeger.hendrikse/folder/Astrophysics/program/SolarSystem) is available as well, see [solar_system.py](https://github.com/zhendrikse/physics-in-python/blob/main/vpython/solar_system.py)<br/>

<div id="planetControls">
  <div class="buttonRow">
    <button data-body="sun">🔅 Sun</button>
    <button data-body="mercury">Mercury</button>
    <button data-body="venus">Venus</button>
    <button data-body="earth">🌍 Earth</button>
    <button data-body="mars">Mars</button>
    <button id="farField1">🔭</button>
  </div>
  <canvas class="applicationCanvas" id="planetsCanvas" style="background: black; aspect-ratio: 19 / 12;"></canvas>
  <div class="buttonRow">
    <button id="farField2">💫</button>
    <button data-body="jupiter">Jupiter</button>
    <button data-body="saturn">🪐 Saturn</button>
    <button data-body="uranus">Uranus</button>
    <button data-body="neptune">🔱 Neptune</button>
    <button id="zoomIn">🔎</button>
  </div>
</div>
<div class="guiContainer" id="solarSystemGui"></div>
<script type="module" src="solar_system.js"></script>

<p style="clear:both;"></p>

## Our planets
<div class="header_line"><br/></div>

### Saturn
<div class="header_line"><br/></div>

<figure style="text-align: center;">
  <img alt="Saturn" src="images/saturn.jpg" />
  <figcaption>This excellent visual guide originates from 
    <a href="https://www.facebook.com/HouseOfPhysics/">House of Physics</a>.
  </figcaption>
</figure>

<p style="clear: both;"></p>

{% include share_buttons.html %}