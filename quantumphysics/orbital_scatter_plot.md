{% include breadcrumbs.html %}

# Atomic orbital scatter plots

## Two-dimensional orbitals
<div class="header_line"><br/></div>

<canvas id="atomCanvas" class="applicationCanvas"></canvas>
<script type="module" src="./orbital_scatter_plot_2d.js"></script>
<p style="clear: both;"></p>


## Three-dimensional orbitals
<div class="header_line"><br/></div>

<div class="header_line"><br/></div>
<div id="ui">
    <!-- TODO: maak event listeners voor buttons! -->
    <button onclick="setOrbital('1s')">1s</button>
    <button onclick="setOrbital('2p')">2p</button>
    <button onclick="setOrbital('3d')">3d</button>
</div>
<script type="module" src="./orbital_scatter_plot_3d.js"></script>
<p style="clear: both;"></p>


{% include share_buttons.html %}