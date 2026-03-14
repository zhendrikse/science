{% include breadcrumbs.html %}

## Rendering black holes using ray tracing
<div class="header_line"><br/></div>

[![Source](https://img.shields.io/badge/github-repo-green?logo=github&label=black_hole_raytracer_glsl.js)](https://github.com/zhendrikse/science/blob/main/relativity/black_hole_raytracer_glsl.js)&nbsp;&nbsp;
[![JavaScript](https://img.shields.io/badge/JavaScript-007ACC?logo=javascript&logoColor=white)](https://en.wikipedia.org/wiki/JavaScript)&nbsp;&nbsp;
[![Three.js](https://img.shields.io/badge/Three.js-000000?logo=three.js&logoColor=white)](https://threejs.org/)&nbsp;&nbsp;
[![WebGL](https://img.shields.io/badge/WebGL-990000?logo=webgl&logoColor=white)](https://www.khronos.org/webgl/)


### Black hole GPU ray tracing 
<div style="border-top: 1px solid #999999"><br/></div>

🔧 Source can be found in [black_hole_raytracer_glsl.js](https://github.com/zhendrikse/science/blob/main/relativity/black_hole_raytracer_glsl.js)<br/>
⭐ Based on [NASA-BlackHole](https://github.com/cadenmarinozzi/NASA-BlackHole) by [Caden Marinozzi](https://medium.com/@cadenmarinozzi)<br/>
👉 Extended with realistic accretion disk coloring<br/>
👉 See also my previous [(_static_) black hole ray tracer](../obsolete/black_hole_ray_tracer.html)

<canvas class="applicationCanvas" id="glslBlackHoleCanvas" style="background: black; aspect-ratio: 16/9"></canvas>
<script type='module' src="./black_hole_raytracer_glsl.js"></script>
<p style="clear: both;"></p>

{% include_relative code/black_hole_background_info.html %}

{% include share_buttons.html %}


    

