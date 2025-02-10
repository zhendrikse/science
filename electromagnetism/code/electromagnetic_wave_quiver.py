# Web VPython 3.2

from vpython import sphere, color, vec, arrow, slider, sin, pi, arange, cos, canvas, rate

# https://ocw.mit.edu/courses/nuclear-engineering/22-105-electromagnetic-interactions-fall-2005/readings/chap4.pdf

title = """
&#x2022; Taken from <a href="https://bphilhour.trinket.io/physics-through-glowscript-an-introductory-course#/5-vectors-fields-and-functions-electricity-and-magnetism/law-of-biot-savart-magnetism-playground">this tutorial</a> by B. Philhour
&#x2022; Refactored by <a href="https://www.hendrikse.name/">Zeger Hendrikse</a> to <a href="https://github.com/zhendrikse/science/blob/main/electromagnetism/code/electromagnetic_wave_quiver.py">electromagnetic_wave_quiver.py</a>
&#x2022; Read more on <a href="https://ocw.mit.edu/courses/22-105-electromagnetic-interactions-fall-2005/pages/readings/">electromagnetic interactions</a> on MIT OpenCourseWare

"""

animation = canvas(background=color.gray(0.075), forward=vec(-1, 0, -1), title=title)

refresh_rate = 750
q = 1.6e-19
k = 9e9
c = 3e8
frequency = 8e16
amplitude = 1.0e-10
step = c / frequency / 4
scale = 6 * step
electric_field_scale = 0.8e-17
magnetic_field_scale = 0.75 * c * electric_field_scale

electron = sphere(radius=step / 5, color=color.red)
electron.vel = vec(0, 0, 0)
electron.acc = vec(0, 0, 0)

proton = sphere(radius=step / 5, color=color.yellow)
proton.vel = vec(0, 0, 0)
proton.acc = vec(0, 0, 0)

dt = 2e-19
time = 0

electric_field = []
magnetic_field = []
index = 0

for x in arange(-scale, scale, step):
    for y in arange(-scale, scale, step):
        for z in arange(-scale, scale, step):
            electric_field += [arrow(pos=vec(x, y, z), axis=vec(0, 0, 0), color=color.yellow)]
            magnetic_field += [arrow(pos=vec(x, y, z), axis=vec(0, 0, 0), color=color.cyan)]


def change_frequency(event):
    global frequency
    frequency = event.value


animation.append_to_caption("\n")
frequencySlider = slider(bind=change_frequency, min=0.0, max=5 * frequency, value=frequency, left=10)
animation.append_to_caption("frequency")


def change_amplitude(event):
    global amplitude
    amplitude = event.value * 1e-10


animation.append_to_caption("\n\n")
ampSlider = slider(bind=change_amplitude, min=0.0, max=5, value=1, left=10)
animation.append_to_caption("amplitude")

while True:
    rate(refresh_rate)
    time += dt

    electron.pos.y = amplitude * sin(2 * pi * frequency * time)
    proton.pos.y = - amplitude * sin(2 * pi * frequency * time)

    for i in range(len(electric_field)):

        # contribution from electron
        r = electric_field[i].pos - vec(0, amplitude * sin(2 * pi * frequency * (time - electric_field[i].pos.mag / c)), 0)
        vel = vec(0, 2 * pi * frequency * amplitude * cos(2 * pi * frequency * (time - electric_field[i].pos.mag / c)), 0)
        acc = vec(0, - 4 * pi ** 2 * frequency ** 2 * amplitude ** 2 * sin(
            2 * pi * frequency * (time - electric_field[i].pos.mag / c)), 0)
        if r.mag <= 1.5 * step:  # this removes strongest nearby field vectors for visibility
            electric_field[i].axis = vec(0, 0, 0)
            magnetic_field[i].axis = vec(0, 0, 0)
            continue
        kappa = 1 - r.norm().dot(vel) / c
        E = k * (-q) * ((1 / (r.mag2 * kappa ** 3) * (r.norm() - (vel / c)) * (1 - (vel.mag2 / (c ** 2)))) + (
                    1 / (c * (kappa ** 3) * r.mag) * r.norm().cross((r.norm() - (vel / c)).cross(acc / c))))
        B = (1 / c) * r.norm().cross(E)

        # contribution from proton
        r = electric_field[i].pos - vec(0, - amplitude * sin(2 * pi * frequency * (time - electric_field[i].pos.mag / c)), 0)
        vel = vec(0, - 2 * pi * frequency * amplitude * cos(2 * pi * frequency * (time - electric_field[i].pos.mag / c)), 0)
        acc = vec(0, 4 * pi ** 2 * frequency ** 2 * amplitude ** 2 * sin(
            2 * pi * frequency * (time - electric_field[i].pos.mag / c)), 0)
        kappa = 1 - r.norm().dot(vel) / c
        E += k * q * ((1 / (r.mag2 * kappa ** 3) * (r.norm() - (vel / c)) * (1 - (vel.mag2 / (c ** 2)))) + (
                    1 / (c * (kappa ** 3) * r.mag) * r.norm().cross((r.norm() - (vel / c)).cross(acc / c))))
        B += (1 / c) * r.norm().cross(E)

        electric_field[i].axis = E * electric_field_scale
        magnetic_field[i].axis = B * magnetic_field_scale
