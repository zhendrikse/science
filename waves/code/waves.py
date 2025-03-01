from vpython import simple_sphere, color, rate, vec, sin, pi, canvas, helix, slider, button

title = """&#x2022; Written by <a href="https://github.com/zhendrikse/">Zeger Hendrikse</a>
&#x2022; Source code in <a href="https://github.com/zhendrikse/science/blob/main/waves/code/waves.py">waves.py</a>

"""

display = canvas(title=title, width=600, height=300, center=vec(30, 5, 0), background=color.gray(0.075))

class TransversalWave:
    def __init__(self, bead_total, bead_radius, frequency, amplitude):
        self._radius = bead_radius
        self._frequency = frequency
        self._amplitude = amplitude
        self._beads = []

        for i in range(bead_total):
            row = []
            for j in range(6):
                row.append(simple_sphere(pos=vec(i, 10 + j, 0), radius=bead_radius, color=color.red if i == 0 else color.green))
            self._beads.append(row)

    def _update_bead_row(self, index, time, t_0, omega):
        bead_row = self._beads[index]
        phase = bead_row[0].pos.x * self._frequency
        if phase <= (time - t_0):
            for bead in bead_row:
                bead.pos.x = index + self._amplitude * sin(omega * (time - phase))

    def update(self, time, t_0):
        omega = 2 * pi * self._frequency
        for i in range(len(self._beads)):
            self._update_bead_row(i, time, t_0, omega)

    def reset(self):
        for i in range(len(self._beads)):
            bead_row = self._beads[i]
            for j in range(6):
                bead_row[j].pos = vec(i, 10 + j, 0)


class LongitudinalWave:
    def __init__(self, bead_total, bead_radius, frequency, amplitude):
        self._radius = bead_radius
        self._frequency = frequency
        self._amplitude = amplitude
        self._springs, self._beads = [], []

        for i in range(bead_total):
            self._beads.append(simple_sphere(pos=vec(i, 0, 0), radius=bead_radius, color=color.green))
            self._springs.append(helix(pos=vec(i, 0, 0), radius=.7 * bead_radius, thickness=.075, axis=vec(0, 0, 0), coils=10, color=color.white, visible=False))

        self._beads[0].color = color.red

    def _update_bead(self, index, time, t_0, omega):
        bead = self._beads[index]
        spring = self._springs[index]
        phase = bead.pos.x * self._frequency
        if phase <= (time - t_0):
            bead.pos.y = self._amplitude * sin(omega * (time - phase))
            spring.axis = bead.pos - vec(index, -.5 * self._radius if bead.pos.y < 0 else .5 * self._radius, 0)
            spring.visible = True

    def update(self, time, t_0):
        omega = 2 * pi * self._frequency
        for i in range(len(self._beads)):
            self._update_bead(i, time, t_0, omega)

    def reset(self):
        for i in range(len(self._beads)):
            bead = self._beads[i]
            bead.pos = vec(bead.pos.x, 0, 0)
            self._springs[i].visible = False


transversal_wave = TransversalWave(60, 0.25, .25, 1)
longitudinal_wave = LongitudinalWave(60, 0.45, .25, 5)

display.append_to_caption("\n")

def reset():
    global t0, t
    t0 = t = 0
    transversal_wave.reset()
    longitudinal_wave.reset()

button(text="Reset", bind=reset)

t0 = t = 0
delta_t = .01
while True:
    rate(1 / delta_t)
    longitudinal_wave.update(t, t0)
    transversal_wave.update(t, t0)
    t += delta_t
