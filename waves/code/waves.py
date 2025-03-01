from vpython import simple_sphere, color, rate, vec, sin, pi, canvas, helix, slider, button, checkbox

title = """&#x2022; Written by <a href="https://github.com/zhendrikse/">Zeger Hendrikse</a>
&#x2022; Source code in <a href="https://github.com/zhendrikse/science/blob/main/waves/code/waves.py">waves.py</a>

"""

display = canvas(title=title, width=600, height=300, center=vec(25, 5, 0), background=color.gray(0.075))

class LongitudinalWave:
    def __init__(self, bead_total, bead_radius, frequency, amplitude):
        self._radius = bead_radius
        self._frequency = frequency
        self._amplitude = amplitude
        self._beads = []

        for i in range(bead_total):
            row = []
            for j in range(5):
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
            for j in range(5):
                self._beads[i][j].pos = vec(i, 10 + j, 0)

    def visible(self, event):
        for i in range(len(self._beads)):
            for bead in self._beads[i]:
                bead.visible = event.checked


class TransverseWave:
    def __init__(self, bead_total, bead_radius, frequency, amplitude):
        self._springs_visible = False
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
            spring.visible = True and self._springs_visible

    def update(self, time, t_0):
        omega = 2 * pi * self._frequency
        for i in range(len(self._beads)):
            self._update_bead(i, time, t_0, omega)

    def reset(self):
        for i in range(len(self._beads)):
            bead = self._beads[i]
            bead.pos = vec(bead.pos.x, 0, 0)
            self._springs[i].visible = False

    def visible(self, event):
        for i in range(len(self._beads)):
            self._beads[i].visible = event.checked
            self._springs[i].visible = event.checked

    def springs_visible(self, event):
        self._springs_visible = event.checked
        for spring in self._springs:
            spring.visible = event.checked and spring.visible



transverse_wave = TransverseWave(50, 0.45, .25, 4)
longitudinal_wave = LongitudinalWave(50, 0.25, .25, 1)

display.append_to_caption("\n")
_ = checkbox(text="Transversal wave ", bind=transverse_wave.visible, checked=True)
_ = checkbox(text="Longitudinal wave ", bind=longitudinal_wave.visible, checked=True)
_ = checkbox(text="Springs ", bind=transverse_wave.springs_visible, checked=False)

display.append_to_caption("\n\n")

def reset():
    global t0, t
    t0 = t = 0
    transverse_wave.reset()
    longitudinal_wave.reset()

button(text="Reset", bind=reset)

t0 = t = 0
delta_t = .01
while True:
    rate(1 / delta_t)
    longitudinal_wave.update(t, t0)
    transverse_wave.update(t, t0)
    t += delta_t
