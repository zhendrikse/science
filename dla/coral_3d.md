{% include breadcrumbs.html %}

## Three-dimensional coral growth 🪸
<div class="header_line"><br/></div>

- Code in [coral_3d.js](https://github.com/zhendrikse/science/blob/main/dla/coral_3d.js)
  written by [Zeger Hendrikse](https://www.hendrikse.name/)
- Implemented in pure JavaScript using [Three.js &mdash; JavaScript 3D library](https://threejs.org/)
- Starts out with 3000 randomly walking nutrition particles!
- Inspired by [Easily Program Coral-like Fractals with Diffusion Limited Aggregation](https://www.youtube.com/watch?v=4_8a8JwXLp4) video

<canvas class="applicationCanvas" id="aquariumCanvas"></canvas>
<div class="buttonRow">
    <label for="aquariumToggle">Aquarium </label><input type="checkbox" id="aquariumToggle"/>
</div>
<script type="module" src="coral_3d.js"></script>
<p style="clear: both;"></p>

{% include share_buttons.html %}
