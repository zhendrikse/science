# Web VPython 3.2

title="""
Plots the orbit of a planet in an eccentric orbit to illustrate
the sweeping out of equal areas in equal times, with sun at focus.
The eccentricity of the orbit is random and determined by the 
initial velocity. The program uses normalised units (G =1).

&#x2022; Original by program by Peter Borcherds, University of Birmingham, England
&#x2022; Refactored by <a href="https://github.com/zhendrikse/">Zeger Hendrikse</a> in this <a href="https://github.com/zhendrikse/physics-in-python/">GitHub repository</a>

"""

caption = """<ol><li>The shape of each orbit is an ellipse, with the sun at one focus of the ellipse.</li>
  <li>The planets move faster when they are closer to the sun, in such a way that a
 line drawn from the sun to any planet sweeps out equal areas in equal times.</li>
  <li>The outer planets move slower than the inner ones, in such a way that the
 cube of the length of the ellipses semimajor axis is proportional to the square
 of the period of the orbit</li></ol>
"""

from vpython import *

animation = canvas(title=title, width=800, height=600, range=1, forward=vector(0.0222862, 0.928369, -0.370991), caption=caption)

# Default velocity gives a satisfactory range of eccentricities
# velocity = -vector(0.984,0,0)   # gives period of 12.0 "months"
class Planet:
    def __init__(self, scale=1.0, velocity = -vector(0.7 + 0.5 * random(), 0, 0)  ):
        poss = vector(0, scale, 0)
        self._velocity = velocity
        self._planet = sphere(pos=poss, color=color.cyan, radius=0.05)
        self._last_position = poss

    def month_step(self, time, offset=20, whole=1):  # mark the end of each "month"
        global colour  # have to make it global, since label uses it before it is updated
        if whole:
            label_text = str(
                int(time * 2 + dt))  # end of 'month', printing twice time gives about 12 'months' in 'year'
        else:
            label_text = str('Period: ') + str(round(time * 2, 2)) + ' "months"\n Initial speed: ' + str(
                round(self.speed(), 3))
            colour = color.white
        label(pos=self.pos(), text=label_text, color=colour, xoffset=offset * self.pos().x,
              yoffset=offset * self.pos().y)
        return vector(0.5 * (1 + random()), random(), random())  # randomise colour of radial vector

    def revolve_one_period(self):
        steps = 20
        step = 0
        time = 0
        global colour
        while not (self._last_position.x > 0 > self.pos().x):

            rate(steps * 2)  # keep rate down so that development of orbit can be followed
            time += dt
            planet.update()

            step += 1
            if step == steps:
                step = 0
                colour = self.month_step(time)
                curve(pos=[sun.pos, self.pos()], color=color.white)
                continue

            # plot radius vector
            curve(pos=[sun.pos, self.pos()], color=colour)

        planet.month_step(time, 50, 0)

    def update(self):
        self._last_position = vector(self._planet.pos)  # construction vector(planet.pos) makes oldpos a varible in its own right
        # plot orbit
        curve(pos=[self._last_position, self._planet.pos], color=color.red)

        denominator = mag(self._planet.pos) ** 3
        self._velocity -= self._planet.pos * dt / denominator  # inverse square law; force points toward sun
        self._planet.pos += self._velocity * dt

    def pos(self):
        return self._planet.pos

    def speed(self):
        return mag(self._velocity)


sun = sphere(color=color.yellow, radius=0.1, texture="http://i.imgur.com/yoEzbtg.jpg")  # motion of sun is ignored (or centre of mass coordinates)
colour = color.white

dt = 0.025
while True:
    planet = Planet(velocity=-vector(0.7 + 0.5 * random(), 0, 0)  )
    colour = planet.month_step(0)
    curve(pos=[sun.pos, planet.pos()], color=colour)

    planet.revolve_one_period()

    label(pos=vector(2.5, -2.5, 0), text='Click for another orbit')
    _ = animation.waitfor('click')

    for obj in animation.objects:
        if obj is sun or obj is planet: continue
        obj.visible = 0  # clear the screen to do it again
        #obj.delete()
