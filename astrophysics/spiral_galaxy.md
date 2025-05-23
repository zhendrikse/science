{% include breadcrumbs.html %}

## Spiral galaxy visualization
<div class="header_line"><br/></div>

- Original [galaxy_3d_Medium.py](https://gist.github.com/rlvaugh/a49bf875890581f338a000c2b5c3a2bb) by [Lee Vaughan](https://towardsdatascience.com/author/lee_vaughan/)
- The (theory behind the) code is thoroughly explained in his [accompanying article](https://towardsdatascience.com/create-3-d-galactic-art-with-matplotlib-a7534148a319/)
- This [spiral_galaxy.html](https://github.com/zhendrikse/science/blob/main/astrophysics/code/spiral_galaxy.html) page is a port to Javascript and [Three.js](https://threejs.org/) 
- Javascript version has been extended with colouring and fading ([Zeger Hendrikse](https://www.hendrikse.name/))
  - **Core / Bulge** (Central Region): yellow-white to reddish color, since the core is
     populated mostly by older stars (Population II), which are cooler and more evolved.
  - **Mid-to-Outer Disk** (Arms): bluish-white color, because the spiral arms host young, hot,
    and massive stars (Population I), which are blue and short-lived. Also, star-forming regions 
    and nebulae contribute a diffuse glow.
  - **Outer Halo**: dim red to transparent, as this region contains very old stars and 
    globular clusters, often too dim to be noticeable.
- I have also ported the original code to [VPython](https://vpython.org), see [spiral_galaxy.py](https://github.com/zhendrikse/physics-in-python/blob/main/vpython/spiral_galaxy.py)

<p style="clear:both;"></p>
{% include_relative code/spiral_galaxy.html %}
<p style="clear:both;"></p>

## Spiral galaxy renderer
<div class="header_line"><br/></div>

On this site, you can also find a live demo of a way more advanced 2D spiral galaxy simulator
that is based on the density wave theory (on GitHub &rarr; 
[Galaxy renderer](https://github.com/beltoforion/Galaxy-Renderer-Typescript)). 
It is written by [Ingo Berg](https://github.com/beltoforion) in Typescript. 
Click on the image below to activate this demo!


<figure style="float: center; text-align: center;">
  <a href="spiral_galaxy_renderer.html">
    <img alt="Daylight variations" src="images/spiral_galaxy_renderer.png" title="Click to go to demo"/>
  </a>
  <figcaption>Click on the image to play with a live demo of a way more advanced 2D spiral galaxy renderer!
  </figcaption>
</figure>

<p style="clear: both;"></p>

## About spiral galaxies
<div class="header_line"><br/></div>

<blockquote>
Hubble distinguished between elliptical galaxies and spiral galaxies. 
The elliptical galaxies were rated based on their eccentricity and given identifiers ranging from E0 to E7 
with the eccentricity increasing towards E7.

The type S0 is an intermediary form of galaxy that marks the transition to the spiral galaxies. 
Spiral galaxies were separated into two categories on their own. The spiral galaxies and (Sa bis Sc) 
and the barred spiral galaxies (SBa bis SBc). &mdash; 
<a href="https://beltoforion.de/en/spiral_galaxy_renderer/">Rendering a Galaxy with the density wave theory</a>
</blockquote><br/>

<figure style="float: center; text-align: center;">
  <a href="https://beltoforion.de/en/spiral_galaxy_renderer/">
    <img alt="Hubble classification" width="100%" height="100%" src="images/hubble_classification.png"/>
  </a>
  <figcaption>Classification of galaxies according to Edwin Hubble; Courtesy of: Ville Koistinen (CC BY-SA 3.0) </figcaption>
</figure>

<p style="clear: both;"></p>

{% include share_buttons.html %}