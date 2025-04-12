{% include breadcrumbs.html %}

## [Galton board](https://en.wikipedia.org/wiki/Galton_board)
<div class="header_line"><br/></div>

<p style="clear: both;"></p>

{% include_relative code/galton_board.html %}

<p style="clear: both;"></p>

## Probability distributions
<div class="header_line"><br/></div>

### [Binomial distribution](https://en.wikipedia.org/wiki/Binomial_distribution)
<div style="border-top: 1px solid #999999"><br/></div>

A Galton board with 10 rows can be thought of as a binomial experiment, where a ball has 50% chance of 
moving to the left or right at each row. The number of steps the ball takes to the right follows a 
binomial distribution.

In a binomial distribution, the number of successes (steps to the right) in $n=10$ trials is represented by:

$𝑋 \approx \text{Binomial}(n=10, p=0.5) = \begin{pmatrix}n \\ k\end{pmatrix}p^k(1 - p)^{n-k} = \begin{pmatrix}n \\ k\end{pmatrix}p^n =  \begin{pmatrix}10 \\ k\end{pmatrix}0.5^{10}$

For higher and higher $n$, we gradually approach the normal distribution. This is also known as
the [central limit theorem](https://en.wikipedia.org/wiki/Central_limit_theorem)

### Approaching the [normal distribution](https://en.wikipedia.org/wiki/Normal_distribution)
<div style="border-top: 1px solid #999999"><br/></div>

The probability density function that is known as the normal or Gaussian distribution is given by

$f(x) = \dfrac{1}{\sqrt{2\pi\sigma^2}}e^-\dfrac{(x-\mu)^2}{2\sigma^2}$

The parameter $\mu$ is the mean or expectation of the distribution, the parameter $\sigma$ is the variance.

For our binomial distribution, the mean $\mu$ is given by

$\mu=n \cdot p = 10 \cdot 0.5 = 5$

The variance $\sigma^2$ is given by

$\sigma^2=n \cdot p \cdot (1 - p) = 10 \cdot 0.5 \cdot 0.5 = 2.5 \Rightarrow \sigma = \sqrt{2.5}$

So we finally obtain:

$X = \text{Normal}(\mu=5, \sigma=\sqrt{2.5})$

<p style="clear: both;"></p>

{% include share_buttons.html %}
