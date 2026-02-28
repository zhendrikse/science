{% include breadcrumbs.html %}

## Free wave packet
<div class="header_line"><br/></div>

<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/uplot@1.6.24/dist/uPlot.min.css">
<script src="https://cdn.jsdelivr.net/npm/uplot@1.6.24/dist/uPlot.iife.min.js"></script>
<div class="canvasWrapper" id="freePacketWrapper" style="aspect-ratio: 2/1">
    <canvas id="freePacketCanvas" class="applicationCanvas" style="aspect-ratio: 2/1"></canvas>
</div>
<script type="module" src="free_wave_packet_3d.js"></script>
<div id="expectationPlot" style="margin:auto;"></div>
<p style="clear: both;"></p>


{% include share_buttons.html %}

