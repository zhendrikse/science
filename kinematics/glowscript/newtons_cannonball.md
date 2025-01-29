```python
#Web VPython 3.2
from vpython import text, vec, sphere, color, mag, vector, canvas, cos, sin, radians, textures, rate, norm, label, slider, wtext

title = """
&#x2022; Based on <a href="https://www.siue.edu/~lhorner/VPython/Newton-Cannon2.py">Newton-Cannon2.py</a> by Lenore Horner SIUE October 22, 2009
&#x2022; Version 2 - March 26, 2010: real radius, can start from arbitrary position, show time to crash in
&#x2022; Refactored by <a href="https://www.hendrikse.name/">Zeger Hendrikse</a>

&#x2022; Cyan cannon ball is coming out of Newton's cannon
&#x2022; Red ball is dropped through the center of the earth
&#x2022; Green ball is dropped toward an earth-equivalent point mass at earth's center
&#x2022; Speeds of around 8000 send cannonball into orbit

"""

  # this is the useful variable to adjust; 8000 does a good orbit
angle = 90  # degrees up from positive x-axis

earth_radius = 6371000
ball_radius = 0.02 * earth_radius

animation = canvas(background=color.gray(0.075), fov=0.001, range=1.25*earth_radius, title=title)
earth = sphere(pos=vector(0, 0, 0), radius=earth_radius, opacity=0.3, texture=textures.earth)

# initialize the cannonball coming out of Newton's cannon
class Cannonball:
    def __init__(self, speed = 7800):
        self._speed = speed
        self._initial_position = earth_radius * 1.05 * vector(cos(radians(90)), sin(radians(90)), 0)
        self._ball = sphere(pos=vector(self._initial_position), radius=ball_radius, color=color.cyan, make_trail=True)
        self._initial_speed()

    def _initial_speed(self):
        self._velocity = -self._speed * vector(self._initial_position.y, -self._initial_position.x, self._initial_position.z) / mag(self._initial_position)

    def update(self, dt):
        acceleration = - 9.8 * norm(self._ball.pos)
        self._velocity += acceleration * dt
        self._ball.pos += self._velocity * dt + 0.5 * acceleration * dt * dt

    def pos(self):
        return self._ball.pos

    def initial_speed_becomes(self, new_speed):
        self._speed = new_speed
        self._initial_speed()

    def reset(self):
        self._ball.clear_trail()
        self._ball.pos = self._initial_position
        self._initial_speed()

class UniformEarthCenterBall:
    def __init__(self):
        self._velocity = vector(0, 0, 0)
        self._initial_position = earth_radius * 1.05 * vector(cos(radians(90)), sin(radians(90)), 0)
        self._ball = sphere(pos=vector(self._initial_position), radius=ball_radius, color=color.red, make_trail=True)

    # Cubed term scales gravity by mass enclosed (Gauss' law) assuming
    # constant density Earth (which is not the case in reality).
    def _acceleration(self):
        return  - 9.8 * (min(mag(self._ball.pos), earth_radius) / earth_radius) ** 3 * self._ball.pos / mag(self._ball.pos)

    def update(self, dt):
        self._velocity += self._acceleration() * dt
        self._ball.pos += self._velocity * dt + 0.5 * self._acceleration() * dt * dt

    def reset(self):
        self._ball.clear_trail()
        self._ball.pos = self._initial_position
        self._velocity = vector(0, 0, 0)

class PointMassEarthCenterBall:
    def __init__(self):
        self._velocity = vector(0, 0, 0)
        self._initial_position = earth_radius * 1.05 * vector(cos(radians(90)), sin(radians(90)), 0)
        self._ball = sphere(pos=vector(self._initial_position), radius=ball_radius, color=color.green, make_trail=True)

    # Earth-equivalent point mass at Earth's center
    def _acceleration(self):
        return  -9.8 * self._ball.pos / mag(self._ball.pos)

    def update(self, dt):
        self._velocity += self._acceleration() * dt
        self._ball.pos += self._velocity * dt + 0.5 * self._acceleration() * dt * dt

    def reset(self):
        self._ball.clear_trail()
        self._ball.pos = self._initial_position
        self._velocity = vector(0, 0, 0)


# initialize the cannonball dropped through the center of the Earth
uniform_earth_center_ball = UniformEarthCenterBall()
# initialize the cannonball dropped toward an Earth-equivalent point mass at Earth's center
point_mass_earth_center_ball = PointMassEarthCenterBall()
cannonball = Cannonball()

def adjust_shoot_velocity():
    cannonball.initial_speed_becomes(speed_slider.value * 1000)
    speed_slider_text.text = "{:1.2f}".format(speed_slider.value, 2) + " * 1000"

animation.append_to_caption("\n")
speed_slider = slider(min=1, max=10, value=7.8, step=.1, bind=adjust_shoot_velocity)
animation.append_to_caption("speed cannonball = ")
speed_slider_text = wtext(text="7.8 * 1000")


popup = text(text="Click mouse to start", pos=vec(-earth_radius, 0, 0), billboard=True, color=color.yellow, height=earth_radius/5)
popup.visible = True
animation.waitfor("click")
popup.visible = False
dt = 5
time_elapsed = 0  # we want to keep track of elapsed time, so zero the variable now
while True:
    while mag(cannonball.pos()) >= earth_radius:
        rate(100)
        cannonball.update(dt)
        uniform_earth_center_ball.update(dt)
        point_mass_earth_center_ball.update(dt)
        time_elapsed += dt

    total_time = time_elapsed / 60
    info = label(pos=vector(earth_radius * 1.1, earth_radius * 1.1, 0), text='elapsed time = ' + str(round(total_time, 3)) + " minutes", box=False)
    popup.visible = True
    animation.waitfor("click")
    cannonball.reset()
    point_mass_earth_center_ball.reset()
    uniform_earth_center_ball.reset()
    popup.visible = False
    info.visible = False

```