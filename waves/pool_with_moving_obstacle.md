{% include breadcrumbs.html %}

# Wave propagation around a moving obstacle
<div class="header_line"><br/></div>

{% include_relative code/pool_with_moving_obstacle.html %}

<p style="clear: both;"></p>

## A more sophisticated simulation in pure Javascript
<div class="header_line"><br/></div>

[Matthias Müller](https://www.matthiasMueller.info/tenMinutePhysics) wrote
a more sophisticated water simulation that is implemented using a so-called grid-based 
or Eulerian approach. He personally elaborates on this simulation 
in [this video](https://www.youtube.com/watch?v=XmzBREkK8kY) 
on his [Ten Minute Physics](https://www.youtube.com/c/TenMinutePhysics) YouTube channel.

<figure style="float: center; text-align: center;">
  <a href="water.html">
    <img alt="Euler water simulation" src="images/water.png" title="Click to animate"/>
  </a>
  <figcaption>Click on the above image to activate the Euler-based water simulation 
  which was implemented using pure Javascript by 
  <a href="https://www.matthiasMueller.info/tenMinutePhysics">Matthias Müller</a>.</figcaption>
</figure>

<p style="clear: both;"></p>

{% include share_buttons.html %}