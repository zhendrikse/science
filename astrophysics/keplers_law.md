{% include breadcrumbs.html %}

## Kepler&apos;s law of equal areas
<div class="header_line"><br/></div>

[Johannes Kepler](https://en.wikipedia.org/wiki/Johannes_Kepler) is without doubt one
of the founding fathers of astronomy. Above all, he became famous for his three laws:

1. The shape of each orbit is an ellipse, with the sun at one focus of the ellipse.
2. The planets move faster when they are closer to the sun, in such a way that a
   line drawn from the sun to any planet sweeps out equal areas in equal times.
3. The outer planets move slower than the inner ones, in such a way that the
    cube of the length of the ellipses semi-major axis is proportional to the square
    of the period of the orbit.

This app plots the orbit of a planet in an eccentric orbit to illustrate
the sweeping out of equal areas in equal times, with sun at focus.
The eccentricity of the orbit is random and determined by the 
initial velocity. The program uses normalised units ($G =1$).

{% include_relative code/KeplersLaw.html %}

<p style="clear:both;"></p>

{% include share_buttons.html %}