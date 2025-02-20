{% include breadcrumbs.html %}

<blockquote>
It is an entirely wonderful thing, that from one so abstract an idea comes
out such a conclusive clarification of the Mercury anomaly. &mdash; 
<a href="https://etienneklein.fr/wp-content/uploads/2016/01/Relativit%C3%A9-g%C3%A9n%C3%A9rale.pdf">Letter from K Schwarzschild to A Einstein</a>,
22 December 1915.
</blockquote>

## [Precession of the perihelion of Mercury](https://en.wikipedia.org/wiki/Tests_of_general_relativity) 
<div class="header_line"><br/></div>

This code simulates the movement of Mercury and displays its position and
trajectory at regular intervals.
The additional terms $\alpha/r^3$ and  $\beta/r^4$ are included in the force.
In order to simulate without it, simply set $\alpha$ and $\beta$ to zero using
the checkboxes.

{% include_relative code/PerihelionMercury.html %}

<p style="clear: both;"></p>

### Definitions of aphelion and perihelion
<div style="border-top: 1px solid #999999"><br/></div>

Because the planets don't orbit the sun in exact circles, but in ellipses,
there are two moments during this orbit when a planet is closest to the Sun 
or farthest from the Sun.

- Aphelion is the point in a planet’s orbit when it is farthest from the Sun.
- Perihelion is the point in a planet's orbit when it is closest to the Sun.

The words come from ancient Greek. Helios is Greek for sun, apo means far
and peri means close. 

The name of the chemical element helium is also derived from the Greek word helios, 
because when people started to analyse the spectrum of sunlight, they noticed that 
there was an element in the spectrum that had not been identified on Earth,  
so they named it helium.

### The (importance of the) perihelion precession explained
<div style="border-top: 1px solid #999999"><br/></div>

The _exact_ theoretical calculation of the observed
[precession of the perihelion of Mercury](https://en.wikipedia.org/wiki/Tests_of_general_relativity) 
is one of the [three classic tests](https://en.wikipedia.org/wiki/Tests_of_general_relativity) of 
general relativity, together with the bending of light and the gravitational redshift. 

<blockquote>
Of the planets in our solar system, Mercury orbits closest to the Sun and is thus most 
affected by the distortion of spacetime produced by the Sun’s mass. Einstein wondered if the 
distortion might produce a noticeable difference in the motion of Mercury that was not predicted 
by Newton’s law. It turned out that the difference was subtle, but it was definitely there. 
Most importantly, it had already been measured. &mdash; 
<a href="https://courses.lumenlearning.com/suny-astronomy/chapter/tests-of-general-relativity/">Tests of General Relativity</a>
</blockquote>

Various scientists had already tried to explain this subtle difference.

<blockquote>
According to Newtonian gravitation, the gravitational forces exerted by the planets will cause Mercury’s 
perihelion to advance by about 531 seconds of arc (arcsec) per century. In the nineteenth century, 
however, it was observed that the actual advance is 574 arcsec per century. 
The discrepancy was first pointed out in 1859 by Urbain Le Verrier, the codiscoverer of Neptune. &mdash;
<a href="https://courses.lumenlearning.com/suny-astronomy/chapter/tests-of-general-relativity/">Tests of General Relativity</a>
</blockquote>

However, the discrepancy of the final 43 arc seconds remained inexplicable, and inspired Einstein
[to make a calculation](https://etienneklein.fr/wp-content/uploads/2016/01/Relativit%C3%A9-g%C3%A9n%C3%A9rale.pdf) 
to see if the discrepancy could be explained by his general theory of relativity.

<blockquote>
General relativity [&hellip;] predicts that due to the curvature of spacetime around the Sun, 
the perihelion of Mercury should advance slightly more than is predicted by Newtonian gravity. 
The result is to make the major axis of Mercury’s orbit rotate slowly in space because of the 
Sun’s gravity alone. The prediction of general relativity is that the direction of perihelion 
should change by an additional 43 arcsec per century. This is remarkably close to the observed 
discrepancy, and it gave Einstein a lot of confidence as he advanced his theory. 
The relativistic advance of perihelion was later also observed in the orbits of 
several asteroids that come close to the Sun.&mdash;
<a href="https://courses.lumenlearning.com/suny-astronomy/chapter/tests-of-general-relativity/">Tests of General Relativity</a>
</blockquote>


{% include share_buttons.html %}

