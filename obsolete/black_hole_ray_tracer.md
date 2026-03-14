{% include breadcrumbs.html %}

## Black hole CPU ray tracing
<div class="header_line"><br/></div>

🔧 Based on the [blackhole_raytracer](https://github.com/silvaan/blackhole_raytracer/tree/master) project by Arman T, Casper Y, Lulu W.<br/>
⭐ See their accompanying [GitHub pages](https://cyang2020.github.io/BlackHoleRayTracer/) and [video](https://www.youtube.com/watch?v=VTodu1YTURY), where they explain the code.<br/>
👉 This [black hole ray tracer](https://github.com/zhendrikse/science/blob/main/obsolete/black_hole_raytrace_webworker.js) is a port to JavaScript executed by a [web worker](https://en.wikipedia.org/wiki/Web_worker).<br/>
🔥 Refactored and extended with realistic colour coding by [Zeger Hendrikse](https://www.hendrikse.name/).<br/>
👉 A [VPython](https://www.vpython.org/) version is also available as [black_hole_raytracer.py](https://github.com/zhendrikse/physics-in-python/blob/main/vpython/black_hole_raytracer.py).

<style>
    .blackhole-container {
        width: 100%;
        max-width: 800px;
        margin: auto;
        aspect-ratio: 2 / 1;
        background: black; /* letterbox */
    }

    .blackhole-container canvas {
        width: 100%;
        height: 100%;
        display: block;
    }
</style>
<div class="blackhole-container">
    <canvas id="blackHoleCanvas" width="600" height="300"></canvas>
</div>
<script src="./black_hole_raytracer.js"></script>

<p style="clear: both;"></p>

{% include share_buttons.html %}