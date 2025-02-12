#Web VPython 3.2
from random import uniform
from vpython import *

title="""Written by Jackson Bahr and Dominic Zirbel for Matter and Interactions I at Carnegie Mellon University, Fall 2013.
&#x2022; Repaired by <a href="https://github.com/zhendrikse/">Zeger Hendrikse</a> in <a href="https://github.com/zhendrikse/science/blob/main/thermodynamics/code/brownian_motion.py">brownian_motion.py</a>

"""

# https://github.com/dzirbel/brownian-motion/blob/master/main.py

animation = canvas(title=title, background=color.gray(0.075))

BOX_SIZE = 5e2  # distance from the origin to the edges of the box, in meters
PARTICLES = 200  # the number of particles in the simulation
dt = .25  # the timestep between ticks in seconds - smaller for more accuracy, larger to run more quickly
SLEEP = .001  # amount of time to spend idle each tick (if running in demo mode), in seconds
NUM_SIMS = 250  # the number of times to run the simulation (starting over each time)
SIM_TIME = 100  # how long each simulation should run, in seconds of simulation-time
DEMO = True  # toggle running the demo (show the window, run only one simulation)
P2P = True  # toggle whether particles collide with other particles (as opposed to colliding only with the mass)
# if this is true, particles are allowed to spawn while intersecting with other particles

d2 = False  # set to true to simulate in 2 dimensions (all z-fields are 0)
d1 = False  # set to true to simulate in 1 dimension (all y- and z-fields are 0)

scene.visible = False
scene.fullscreen = True
scene.visible = DEMO

if DEMO:
    box_bottom = box(pos=vec(0, -BOX_SIZE, 0), length=2 * BOX_SIZE, width=2 * BOX_SIZE, height=0.01, color=color.cyan,
                     opacity=0.2)
    box_top = box(pos=vec(0, BOX_SIZE, 0), length=2 * BOX_SIZE, width=2 * BOX_SIZE, height=0.01, color=color.cyan,
                  opacity=0.2)
    box_left = box(pos=vec(-BOX_SIZE, 0, 0), length=0.01, width=2 * BOX_SIZE, height=2 * BOX_SIZE, color=color.cyan,
                   opacity=0.2)
    box_right = box(pos=vec(BOX_SIZE, 0, 0), length=0.01, width=2 * BOX_SIZE, height=2 * BOX_SIZE, color=color.cyan,
                    opacity=0.2)
    box_back = box(pos=vec(0, 0, -BOX_SIZE), length=2 * BOX_SIZE, width=0.01, height=2 * BOX_SIZE, color=color.cyan,
                   opacity=0.2)


class Body:
    def __init__(self, pos=vector(0, 0, 0), radius=0, velocity=vector(0, 0, 0), colour=color.white):
        #sphere.__init__(self, color=color, radius=radius, pos=pos)
        self._sphere = sphere(pos=pos, color=colour, radius=radius)
        self.radius = radius
        self.velocity = velocity

    def __eq__(self, other):
        return self._sphere.pos == other._shere.pos

    def velocity(self):
        return self.velocity

    def set_velocity_to(self, value):
        self.velocity = value

    def volume(self):
        return 4 / 3 * pi * self.radius ** 3

    def mass(self):
        return self.volume()  # uniform density of 1 kg/m^3

    # def momentum(self):
    #     return self.mass * self.velocity

    # def set_momentum(self, value):
    #     self.velocity = value / self.mass

    def collide_edge(self):
        if abs(self._sphere.pos.x) > BOX_SIZE:
            self._sphere.pos.x *= -1
        if abs(self._sphere.pos.y) > BOX_SIZE:
            self._sphere.pos.y *= -1
        if abs(self._sphere.pos.z) > BOX_SIZE:
            self._sphere.pos.z *= -1

    def tick(self, objects, start, dt):
        self._sphere.pos += self.velocity * dt
        self.collide_edge()

        if P2P:
            other_particles = range(PARTICLES + 1 - start)
        else:
            other_particles = range(PARTICLES, PARTICLES + 1)

        for i in other_particles:
            o = objects[PARTICLES - i]

            # determine whether the two objects are colliding, using mag2 for
            #  performance
            tot_radius = self.radius + o.radius
            intersect_amount = tot_radius ** 2 - mag2(self._sphere.pos - o._sphere.pos)
            if intersect_amount > 1e-3:
                # the amount of overlap between the two colliding objects
                intersect_amount = tot_radius - mag(self._sphere.pos - o._sphere.pos)
                # the vector from self to o
                r = o._sphere.pos - self._sphere.pos

                # adjust the objects so they are no longer intersecting
                # if the radii of the objects are the same (i.e. two Particles)
                #  collided, each is adjusted by the same amount
                # otherwise, the larger object (i.e. the Mass) is held not
                #  adjusted, and the smaller object (i.e. the Particle) is moved
                #  to the edge of the larger object
                # this is done to preserve the position of the Mass, which is
                #  what we are attempting to measure
                self_adjust = .5
                o_adjust = .5

                if self.radius > o.radius:
                    self_adjust = 0
                    o_adjust = 1
                elif self.radius < o.radius:
                    self_adjust = 1
                    o_adjust = 0

                self._sphere.pos -= norm(r) * self_adjust * intersect_amount
                o._sphere.pos += norm(r) * o_adjust * intersect_amount

                # switch into the frame of reference of the other object
                frame = vector(o.velocity)

                self.velocity -= frame
                o.velocity -= frame

                p = proj(self.velocity, r)

                # calculate the new velocities for the two objects
                total_mass = (self.mass() + o.mass())
                self.velocity = (self.velocity - p) + (p * (self.mass() - o.mass()) / total_mass)
                o.velocity = p * ((2 * self.mass()) / total_mass)

                # switch back into the original frame of reference
                self.velocity += frame
                o.velocity += frame


class Particle(Body):
    RADIUS = 10  # radius of each Particle, in meters
    MAX_SPEED = 100  # the maximum magnitude of the velocity of a Particle when it is created, in meters/second
    MIN_SPEED = 15  # the minimum magnitude of the velocity of a Particle when it is created, in meters/second

    def __init__(self, objects):
        Body.__init__(self, colour=color.yellow, radius=Particle.RADIUS)
        self.velocity = self.generate_velocity()
        self._sphere.pos = self.generate_position(objects)

    def generate_velocity(self):
        return uniform(Particle.MIN_SPEED, Particle.MAX_SPEED) * norm(
            vector(uniform(-1, 1),
                   0 if d1 else uniform(-1, 1),
                   0 if d2 or d1 else uniform(-1, 1)))

    def generate_position(self, objects):
        if P2P:
            other_particles = range(len(objects))
        else:
            other_particles = range(len(objects) - 1, len(objects))

        while True:
            candidate = vector(uniform(-BOX_SIZE, BOX_SIZE),
                               0 if d1 else uniform(-BOX_SIZE, BOX_SIZE),
                               0 if d1 or d2 else uniform(-BOX_SIZE, BOX_SIZE))

            for i in other_particles:
                o = objects[len(objects) - i - 1]
                if mag(candidate - o._sphere.pos) <= o.radius + Particle.RADIUS:
                    break
                else:
                    return candidate


class Mass(Body):
    RADIUS = 100  # radius of the Mass, in meters

    def __init__(self):
        Body.__init__(self, colour=color.blue, radius=Mass.RADIUS)
        self.trace = curve(color=color.red)
        self.velocity = vector(0, 0, 0)  # FIXME: why is this necessary?

    def collide_edge(self):
        if self._sphere.pos.x + self.radius > BOX_SIZE or self._sphere.pos.x - self.radius < -BOX_SIZE:
            self._sphere.pos.x = BOX_SIZE - self.radius if self._sphere.pos.x > 0 else -BOX_SIZE + self.radius
            self.velocity.x *= -1
        if self._sphere.pos.y + self.radius > BOX_SIZE or self._sphere.pos.y - self.radius < -BOX_SIZE:
            self._sphere.pos.y = BOX_SIZE - self.radius if self._sphere.pos.y > 0 else -BOX_SIZE + self.radius
            self.velocity.y *= -1
        if self._sphere.pos.z + self.radius > BOX_SIZE or self._sphere.pos.z - self.radius < -BOX_SIZE:
            self._sphere.pos.z = BOX_SIZE - self.radius if self._sphere.pos.z > 0 else -BOX_SIZE + self.radius
            self.velocity.z *= -1

    def tick(self, objects, start, dt):
        Body.tick(self, objects, start, dt)
        self.trace.append(self._sphere.pos)


def run_sim(total_time=-1):
    objects = list()
    mass = Mass()
    objects.append(mass)
    for _ in range(PARTICLES):
        objects.append(Particle(objects))

    t = 0

    while total_time < 0 or t < total_time:
        for i in range(len(objects)):
            objects[i].tick(objects, i + 1, dt)

        t += dt

        if scene.visible:
            time.sleep(SLEEP)

    return mag(mass._sphere.pos)


if DEMO:
    run_sim()
else:
    distances = list()
    for i in range(NUM_SIMS):
        print("running simulation " + str(i + 1) + "/" + str(NUM_SIMS))
        distances.append(run_sim(SIM_TIME))

    avg = 0

    for d in distances:
        avg += d
    avg /= len(distances)

    sd = 0
    for d in distances:
        sd += (d - avg) ** 2
    sd /= len(distances)
    sd = sqrt(sd)

    datetime = time.strftime("%Y-%m-%d-%H:%M:%S", time.localtime())
    filename = "data/data-" + str(datetime) + ".txt"
    f = open(filename, 'w')
    f.write("Brownian Motion Simulation\n")
    f.write(datetime + "\n\n")
    f.write("Simulation Parameters:\n")
    f.write("   times run: " + str(NUM_SIMS) + "\n")
    f.write("   number of particles: " + str(PARTICLES) + "\n")
    f.write("   simulation time (s): " + str(SIM_TIME) + "\n")
    f.write("   dt (s): " + str(dt) + "\n")
    f.write("   box size (m): " + str(BOX_SIZE) + "\n")
    f.write("   mass radius: " + str(Mass.RADIUS) + "\n")
    f.write("   particle radius: " + str(Particle.RADIUS) + "\n")
    f.write("   particle speed interval: [" + str(Particle.MIN_SPEED) + "," + str(Particle.MAX_SPEED) + "]\n")
    f.write("\n")
    f.write("Average displacement: " + str(avg) + "\n")
    f.write("Standard deviation: " + str(sd) + "\n\n")
    f.write("Displacement data:\n")

    # for d in distances:
    #     f.write(str(d) + "\n")
    #
    # f.close()
    #
    # print
    # "Output written to " + filename