{% include breadcrumbs.html %}

## Overhead power lines
<div class="header_line"><br/></div>

Overhead power lines (and in fact any catenary) can be modelled as
a string of beads connected by springs. The total mass of the catenary
is divided over the number of beads $N$, while the length of the catenary is
divided over the number springs $N - 1$ in between.

{% include_relative code/Catenary.html %}

<p style="clear: both;"></p>

{% include share_buttons.html %}