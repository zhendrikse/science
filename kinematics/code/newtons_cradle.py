from vpython import sphere, canvas, rate, color, vec, cylinder, dot, tan, acos, mag, graph, gcurve

#
# https://www.youtube.com/watch?v=eEb3seVrJHQ
#

display = canvas(width=600, height=600, background=color.gray(0.075), center=vec(0, -1, 1))


ball_count = 5
lift_count = 3

k = 150000
g = 9.8

pivot_size = 0.06
ball_size = .2
ball_mass = 1
rope_length = 2.

pivots, balls, ropes = [], [], []
for i in range(ball_count):
    pivots.append(sphere(radius=pivot_size, color=color.orange, pos=vec(-.4 * (ball_count / 2) + i * .4, 0, 0)))
    balls.append(sphere(radius=ball_size, color=color.yellow, pos=vec(-.4 * (ball_count / 2) + i * .4, -2. - ball_mass * g / k, 0), m=ball_mass, v=vec(0, 0, 0), make_trail=True))
    ropes.append(cylinder(radius=0.05, pos=pivots[i].pos, axis=balls[i].pos - pivots[i].pos))


# Lift balls
amplitude = 1.90 # The smaller, the larger the amplitude!
amplitude /= 2.0
for i in range(lift_count):
    balls[i].pos.y = (-2. - ball_mass * g * amplitude / k) * amplitude
    balls[i].pos.x -= abs(balls[i].pos.y) * tan(acos(amplitude))
    ropes[i].axis = balls[i].pos - pivots[i].pos

def after_collision_velocities(m1, m2, v1, v2, x1, x2):
    v1_prime = v1 + 2 * (m2 / (m1 + m2)) * (x1 - x2) * dot(v2 - v1, x1 - x2) / dot(x1 - x2, x1 - x2)
    v2_prime = v2 + 2 * (m1 / (m1 + m2)) * (x2 - x1) * dot(v1 - v2, x2 - x1) / dot(x2 - x1, x2 - x1)
    return v1_prime, v2_prime

def collision_happen(pos1, pos2, size1, size2, v1, v2):
    return mag(pos1 - pos2) <= size1 + size2 and dot(pos1 - pos2, v1 - v2) <= 0

h = -2. - ball_mass * g / k # gravitational potential = 0
KE, GP = [], [] # Gravitational potential and kinetic energy

display.append_to_caption("\n")
energy = graph(width=450, align="left", background=color.black)
kinetic_energy = gcurve(graph=energy, color=color.blue, width=4)
gravitational_potential = gcurve(graph=energy, color=color.red, width=4)

averaged_energy = graph(width=450, align="right", background=color.black)
avg_kinetic_energy = gcurve(graph=averaged_energy, color=color.blue, width=4)
avg_gravitational_potential = gcurve(graph=averaged_energy, color=color.red, width=4)

t= 0
dt = 0.001
while True:
    rate(250)
    t += dt

    for i in range(ball_count):

        # analyze external forces: tension from the rope(spring with large k) and gravity
        ropes[i].axis = balls[i].pos - ropes[i].pos
        tension = -k * (mag(ropes[i].axis) - rope_length) * ropes[i].axis.norm()
        balls[i].a = vec(0, -g, 0) + tension / balls[i].m

        balls[i].v += balls[i].a * dt
        balls[i].pos += balls[i].v * dt

        if i == 0:
            if collision_happen(balls[0].pos, balls[1].pos, balls[0].radius, balls[1].radius, balls[0].v, balls[1].v):
                balls[0].v, balls[1].v = after_collision_velocities(balls[0].m, balls[1].m, balls[0].v, balls[1].v, balls[0].pos, balls[1].pos)
            else:
                continue

        elif i == ball_count - 1:
            if collision_happen(balls[ball_count - 1].pos, balls[ball_count - 2].pos, balls[ball_count - 1].radius, balls[ball_count - 2].radius, balls[ball_count - 1].v, balls[ball_count - 2].v):
                balls[ball_count - 1].v, balls[ball_count - 2].v = after_collision_velocities(balls[ball_count - 1].m, balls[ball_count - 2].m, balls[ball_count - 1].v, balls[ball_count - 2].v, balls[ball_count - 1].pos, balls[ball_count - 2].pos)
            else:
                continue

        else:
            if collision_happen(balls[i].pos, balls[i + 1].pos, balls[i].radius, balls[i + 1].radius, balls[i].v, balls[i + 1].v):
                balls[i].v, balls[i + 1].v = after_collision_velocities(balls[i].m, balls[i + 1].m, balls[i].v, balls[i + 1].v, balls[i].pos, balls[i + 1].pos)
            elif collision_happen(balls[i].pos, balls[i - 1].pos, balls[i].radius, balls[i - 1].radius, balls[i].v, balls[i - 1].v):
                balls[i].v, balls[i - 1].v = after_collision_velocities(balls[i].m, balls[i - 1].m, balls[i].v, balls[i - 1].v, balls[i].pos, balls[i - 1].pos)
            else:
                continue

    ke_total = 0
    gp_total = 0
    for i in range(ball_count):
        ke_total += .5 * balls[i].m * dot(balls[i].v, balls[i].v)
        gp_total += balls[i].m * g * (balls[i].pos.y - h)

    KE.append(ke_total)
    GP.append(gp_total)
    ke_avg = sum(KE) / len(KE)
    gp_avg = sum(GP) / len(GP)

    kinetic_energy.plot(t, ke_total)
    gravitational_potential.plot(t, gp_total)

    avg_kinetic_energy.plot(t, ke_avg)
    avg_gravitational_potential.plot(t, gp_avg)
