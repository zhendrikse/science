#Web VPython 3.2

from vpython import vector, cos, sin, cylinder, sphere, box, color, rate, canvas, sqrt, exp, slider

title="""
&#x2022; Original <a href="https://www.leonhostetler.com/blog/newtons-cradle-in-visual-python-201702/">written by Leon Hostetler</a>
&#x2022; Refactored by <a href="https://www.hendrikse.name/">Zeger Hendrikse</a> to <a href="https://github.com/zhendrikse/science/blob/main/kinematics/code/newtons_pendulum.py">newtons_pendulum.py</a>

&#x2022; $\\theta(t)=\\theta_0 \\cos \\bigg( \\sqrt{  \\dfrac {g} {L}} t \\bigg)$

"""

# Constants
g = 9.80            # (m/s^2)
L = 10              # Length of the pendulums (m)
theta_0 = 1.2       # In radians
mu = 0              # Damping

display = canvas(color=color.gray(0.075), title=title, center=vector(-L / 2, -L / 2, 0))

# Create the pendulum bob and rod
ceiling = box(pos=vector(-4, 0, 0), size=vector(20, 1, 4), color=color.green)

balls = [sphere(pos=vector(0*-2 +L * sin(theta_0), -L * cos(theta_0), 0), radius=1, color=color.yellow)]
rods = [cylinder(pos=vector(0*-2, 0, 0), axis=vector(balls[0].pos.x, balls[0].pos.y, 0), radius=0.1)]

for i in range(1, 5):
  balls.append(sphere(pos=vector(i * -2, -L, 0), radius=1, color=color.red))
  rods.append(cylinder(pos=vector(i * -2, 0, 0), axis=vector(balls[i].pos.x + i * 2,balls[i].pos.y, 0), radius=0.1))
  
  
def position(right, t):
    """
    Only one of the pendulums is in motion at a given time. This function
    moves the moving pendulum to its new position. We use the equation:
        theta(t) = theta_0*cos(sqrt(g/L)*t)
    """
    theta = theta_0 * exp(-mu * t) * cos(sqrt(g / L) * t)

    if right:
        balls[0].pos = vector(L * sin(theta), -L * cos(theta), 0)
        balls[0].color = color.yellow
        balls[4].color = color.red
        rods[0].axis = vector(balls[0].pos.x, balls[0].pos.y, 0)
    else:
        balls[4].pos = vector(L * sin(theta) - 4 * 2, -L * cos(theta), 0)
        balls[0].color = color.red
        balls[4].color = color.yellow
        rods[4].axis = vector(balls[4].pos.x + 4 * 2, balls[4].pos.y, 0)
 
    # Once the moving pendulum reaches theta = 0, switch to the other one
    return theta > 0

def modify_damping(event):
    global mu
    mu = event.value

display.append_to_caption("\nDamping constant: ")
_ = slider(value=0, min=0, max=.1, bind=modify_damping)

MathJax.Hub.Queue(["Typeset", MathJax.Hub])

t = 0
dt = 0.01
right = True  # The right pendulum is the first in motion
while True:
    rate(200)
    right = position(right, t)
    t += dt
