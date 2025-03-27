#Web VPython 3.2

from vpython import *

# Parameters
amplitude = 1.00  # Amplitude
phi = 0.0  # Phase angle
x0 = amplitude  # Initial position
v0 = 0.0  # Initial velocity
m = 3.0  # Mass
k = 2  # Spring constant
omega = sqrt(k / m)  # Angular frequency (sqrt(k/m))
dt = 0.1  # Time step
time = 1000  # Number of steps
ilen = 1  # Rest length of spring


# Function for Block-Spring Setup Generation
class Oscillator:
    def __init__(self, block_height, spring_length, mass=3, k=2, colour=vector(0, 1, 1)):
        self._velocity = 0
        self._mass = mass
        self._spring_constant = k

        block = box(
            pos=vector(0.5, block_height, 0),
            length=0.3, width=0.3, height=0.3,
            color=colour,
            F=vector(0, 0, 0),
            p=vector(0, 0, 0)
        )

        spring = helix(
            pos=vector(block.pos.x - spring_length, block.pos.y, 0),
            axis=vector(1, 0, 0),
            length=spring_length,
            radius=block.width / 3,
            thickness=0.02,
            color=colour
        )

        self._osc = {
            'block': block,
            'spring': spring
        }

    def update_spring(self):
        self._osc['spring'].axis = self._osc['block'].pos - self._osc['spring'].pos
        self._osc['spring'].length = mag(self._osc['spring'].axis)

    def pos(self):
        return self._osc['block'].pos

    def time_lapse(self, num_method, dt):
        self._osc['block'].pos.x, self._velocity = num_method(self._osc['block'].pos.x, self._velocity, dt, self._spring_constant, self._mass)
        self.update_spring()


position_graph = graph(title="Position vs Time", xtitle='Time', ytitle='Pos_x', background=color.black)
exact_curve = gcurve(color=color.red)
euler_curve = gcurve(color=color.cyan)
implicit_curve = gcurve(color=color.orange)
rk2_curve = gcurve(color=color.purple)
rk4_curve = gcurve(color=color.green)

error_graph = graph(title="Errors: Euler [cyan] vs Implicit [orange] vs RK2 [purple] vs RK4 [green]", xtitle='Time', ytitle='Error', background=color.black)
rk4_error = gcurve(color=color.green)
rk2_error = gcurve(color=color.purple)
euler_error = gcurve(color=color.cyan)
implicit_error = gcurve(color=color.orange)

title = """&#x2022; Based on <a href="https://trinket.io/glowscript/1fe7d9cdd6">this code</a> and <a href="https://www.youtube.com/watch?v=dShtlMl69kY">accompanying video</a>
&#x2022; Refactored by <a href="https://www.hendrikse.name/">Zeger Hendrikse</a> to <a href="https://github.com/zhendrikse/science/blob/main/kinematics/code/numerical_methods.py">numerical_methods.py</a>

&#x2022; Comparison of accuracy of numerical methods:
   &#x2022; <span style="color: red">Exact solution (red))</span>
   &#x2022; <span style="color: cyan">Euler&apos;s method (cyan)</span>
   &#x2022; <span style="color: orange">Implicit method (orange)</span> 
   &#x2022; <span style="color: purple">Runge-Kutta 2 (purple)</span>
   &#x2022; <span style="color: green">Runge-Kutta 4 (green)</span>

"""

scene = canvas(title=title, background=color.gray(0.075))

# Spring and Mass Block
# spring = helix(pos=vector(0, 0, 0), axis=vector(0, 0, 0), radius=0.02, color=color.cyan, coils=10, thickness=0.01)
# block = box(pos=vector(x0, 0, 0), size=vector(0.1, 0.1, 0.1), color=color.red)

exact_setup = Oscillator(1, ilen + amplitude, colour=color.red)
euler_setup = Oscillator(0.5, ilen + amplitude, colour=color.cyan)
implicit_setup = Oscillator(0, ilen + amplitude, colour=color.orange)
rk2_setup = Oscillator(-0.5, ilen + amplitude, colour=color.purple)
rk4_setup = Oscillator(-1, ilen + amplitude, colour=color.green)



# Exact Solution
def exact_solution(t, A, omega, phi):
    x_new = A * cos(omega * t + phi)
    v_new = -A * omega * sin(omega * t + phi)

    return x_new, v_new


# Euler Method
def euler_step(position, velocity, dt, spring_constant, mass):
    acceleration = - (spring_constant / mass) * position
    v_new = velocity + acceleration * dt
    x_new = position + velocity * dt

    return x_new, v_new


# Implicit Euler Method
def implicit_euler_step(x, v, dt, k, m):
    A = 1 + (dt ** 2 * k / m)
    B = -dt * k / m

    x_new = (x + dt * v) / A
    v_new = v + dt * (-k / m * x_new)

    return x_new, v_new


# RK2 Method
def rk2_step(x, v, dt, k, m):
    def derivatives(x, v):
        return v, - (k / m) * x

    k1x, k1v = derivatives(x, v)
    k2x, k2v = derivatives(x + dt * k1x, v + dt * k1v)

    x_new = x + (dt / 2) * (k1x + k2x)
    v_new = v + (dt / 2) * (k1v + k2v)

    return x_new, v_new


# RK4 Method
def rk4_step(x, v, dt, k, m):
    def derivatives(x, v):
        return v, - (k / m) * x

    k1x, k1v = derivatives(x, v)
    k2x, k2v = derivatives(x + 0.5 * dt * k1x, v + 0.5 * dt * k1v)
    k3x, k3v = derivatives(x + 0.5 * dt * k2x, v + 0.5 * dt * k2v)
    k4x, k4v = derivatives(x + dt * k3x, v + dt * k3v)

    x_new = x + (dt / 6) * (k1x + 2 * k2x + 2 * k3x + k4x)
    v_new = v + (dt / 6) * (k1v + 2 * k2v + 2 * k3v + k4v)

    return x_new, v_new


# Initialize arrays for storing results
positions_euler = [x0]
positions_rk4 = [x0]
velocities_euler = [v0]
velocities_rk4 = [v0]

# Set up initial conditions
x_euler, v_euler = x0, v0
x_implicit, v_implicit = x0, v0
x_rk2, v_rk2 = x0, v0
x_rk4, v_rk4 = x0, v0


# Interactivity
def set_dt(evt):
    global dt
    if evt.id == "dt":
        dt = evt.value

running = False
def run(button_):
    global running
    running = not running
    button_.text = "Stop" if running else "Run"

scene.append_to_caption("\n")
run_button = button(
    text="Run",
    pos=scene.caption_anchor,
    bind=run,
)

scene.append_to_caption("   ")
dt_slider = slider(
    bind=set_dt,
    max=0.5,
    min=0.0001,
    step=0.0001,
    value=0.1,
    id="dt"
)
scene.append_to_caption("animation speed\n\n")

temp = 0
delta_t = 0.001
while temp < 1000:
    rate(24)

    temp += delta_t
    if running:
        break

# Run simulation
t = 0
while t < time:
    if not running:
        rate(10)
        continue

    rate(50)
    x_euler, v_euler = euler_step(x_euler, v_euler, dt, k, m)
    x_implicit, v_implicit = implicit_euler_step(x_implicit, v_implicit, dt, k, m)
    x_rk2, v_rk2 = rk2_step(x_rk2, v_rk2, dt, k, m)
    x_rk4, v_rk4 = rk4_step(x_rk4, v_rk4, dt, k, m)

    positions_euler.append(x_euler)
    velocities_euler.append(v_euler)
    positions_rk4.append(x_rk4)
    velocities_rk4.append(v_rk4)

    exact_setup._osc['block'].pos.x = exact_solution(t, amplitude, omega, phi)[0]
    exact_setup.update_spring()

    euler_setup.time_lapse(euler_step, dt)
    implicit_setup.time_lapse(implicit_euler_step, dt)
    rk2_setup.time_lapse(rk2_step, dt)
    rk4_setup.time_lapse(rk4_step, dt)

    exact_curve.plot(t, exact_setup.pos().x)
    euler_curve.plot(t, euler_setup.pos().x)
    implicit_curve.plot(t, implicit_setup.pos().x)
    rk2_curve.plot(t, rk2_setup.pos().x)
    rk4_curve.plot(t, rk4_setup.pos().x)

    # euler_error.plot(t, abs(exact_setup['block'].pos.x - euler_setup['block'].pos.x))
    # implicit_error.plot(t, abs(exact_setup['block'].pos.x - implicit_setup['block'].pos.x))
    rk4_error.plot(t, abs(exact_setup.pos().x - rk4_setup.pos().x))
    rk2_error.plot(t, abs(exact_setup.pos().x - rk2_setup.pos().x))

    t += dt

