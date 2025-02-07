# Web VPython 3.2

from vpython import sphere, rate, color, vec, arange, canvas, sqrt, sin, cos, slider, wtext, pi, radio

title="""&#x2022; Written by <a href="https://www.hendrikse.name/">Zeger Hendrikse</a>
&#x2022; Visualization concept with spheres by <a href="https://jexpearce.github.io/jex/">Jex Pearce</a>

"""

Lx, Ly = 3 * pi, 3 * pi
dx, dy = 0.1, 0.1
animation = canvas(forward=vec(-2.5, -2.2, -2.2), center=vec(5.5, 5.3, -2.25),
                   up=vec(0, 0, 1), title=title,
                   background=color.gray(0.075), range=5.5)


class Membrane:
    def __init__(self, x, y, f_x_y_t):
        self._x, self._y, self._f_x_y_t = x, y, f_x_y_t

        self._hue = 0.1
        self._radius = 0.075
        self._amplitude = 1.0

        self._init_droplets()

    def _init_droplets(self):
        self._surface = []
        for i in range(len(self._x)):
            droplets_row = []
            for j in range(len(self._y)):
                colour = color.hsv_to_rgb(vec(self._hue, 1, 1))
                position = vec(self._x[i], self._y[j], 0)
                droplets_row.append(sphere(pos=position, radius=self._radius, color=colour))
            self._surface.append(droplets_row)

    def update(self, t):
        for i in range(0, len(self._x)):
            for j in range(0, len(self._y)):
                self._surface[i][j].pos.z = self._amplitude * self._f_x_y_t(self._x[i], self._y[j], t)
                self._surface[i][j].color = color.hsv_to_rgb(vec(.1 * abs(self._surface[i][j].pos.z) + self._hue, 1, 1))

    def set_hue_value_to(self, new_hue_value):
        self._hue = new_hue_value

    def set_amplitude_to(self, new_value):
        self._amplitude = new_value

    def set_wave_function_to(self, normal_mode):
        self._f_x_y_t = normal_mode

    def set_droplet_radius_to(self, new_radius):
        self._radius = new_radius
        for i in range(len(self._x)):
            for j in range(len(self._y)):
                self._surface[i][j].radius = new_radius


class RadioButton:
    def __init__(self, button_, membrane_):
        self._button = button_
        self._membrane = membrane_

    def uncheck(self):
        self._button.checked = False

    def push(self, button_name):
        i = int(button_name[0])
        j = int(button_name[-1])
        self._membrane.set_wave_function_to(modes[i][j])

    def check(self):
        self._button.checked = True

    def name(self):
        return self._button.name

class RadioButtons:
    def __init__(self):
        self._radio_buttons = []
        self._selected_button = None

    def add(self, button_, membrane_):
        self._radio_buttons.append(RadioButton(button_, membrane_))

        if (len(self._radio_buttons) % 3) == 0:
            animation.append_to_caption("\n\n")

        if (len(self._radio_buttons)) == 1:
            self._radio_buttons[0].check()
            self._selected_button = self._radio_buttons[0]

    def _uncheck_buttons_except(self, button_name):
        for button_ in self._radio_buttons:
            if button_.name() != button_name: button_.uncheck()

    def _get_button_by(self, button_name):
        for button_ in self._radio_buttons:
            if button_.name() == button_name: return button_

    def toggle(self, button_name):
        self._uncheck_buttons_except(button_name)
        self._selected_button = self._get_button_by(button_name)
        self._selected_button.push(button_name)

    def get_selected_button_name(self):
        return self._selected_button.name()


omega = 2 * sqrt(5)

def mode_1_1(x, y, t):
    return cos(omega * t) * sin(1 * x / 3) * sin(1 * y / 3)

def mode_2_1(x, y, t):
    return cos(omega * t) * sin(2 * x / 3) * sin(1 * y / 3)

def mode_3_1(x, y, t):
    return cos(omega * t) * sin(x) * sin(1 * y / 3)

def mode_1_2(x, y, t):
    return cos(omega * t) * sin(1 * x / 3) * sin(2 * y / 3)

def mode_2_2(x, y, t):
    return cos(omega * t) * sin(2 * x / 3) * sin(2 * y / 3)

def mode_3_2(x, y, t):
    return cos(omega * t) * sin(x) * sin(2 * y / 3)

def mode_1_3(x, y, t):
    return cos(omega * t) * sin(1 * x / 3) * sin(y)

def mode_2_3(x, y, t):
    return cos(omega * t) * sin(2 * x / 3) * sin(y)

def mode_3_3(x, y, t):
    return cos(omega * t) * sin(x) * sin(y)

x_range = arange(0, Lx + dx, dx)
y_range = arange(0, Ly + dy, dy)
modes = [[mode_1_1, mode_2_1, mode_3_1], [mode_1_2, mode_2_2, mode_3_2], [mode_1_3, mode_2_3, mode_3_3]]
membrane = Membrane(x_range, y_range, modes[0][0])

################
# GUI controls #
################

def adjust_offset():
    membrane.set_hue_value_to(offset_slider.value)
    hue_offset_text.text = "{:1.2f}".format(offset_slider.value, 2)


def adjust_amplitude():
    membrane.set_amplitude_to(amplitude_slider.value)
    amplitude_text.text = "{:1.2f}".format(amplitude_slider.value, 2)


def adjust_droplet_radius():
    membrane.set_droplet_radius_to(radius_slider.value * .01)
    droplet_radius_text.text = "{:1.2f}".format(radius_slider.value, 2)


def toggle(event):
    radio_buttons.toggle(event.name)

animation.append_to_caption("\n")
radius_slider = slider(min=1, max=10, value=7.5, step=.1, bind=adjust_droplet_radius)
animation.append_to_caption("droplet radius = ")
droplet_radius_text = wtext(text="7.50")

animation.append_to_caption("\n\n")
offset_slider = slider(min=0, max=1, value=0.1, bind=adjust_offset)
animation.append_to_caption("hue offset = ")
hue_offset_text = wtext(text="0.10")

animation.append_to_caption("\n\n")
amplitude_slider = slider(min=0.1, max=2, value=1, bind=adjust_amplitude)
animation.append_to_caption("Amplitude = ")
amplitude_text = wtext(text="1.00")

animation.append_to_caption("\n\n")
radio_buttons = RadioButtons()
for i in range(3):
    for j in range(3):
        radio_buttons.add(radio(bind=toggle, text=" Mode " + str(i + 1) + "," + str(j + 1) + " ", name=str(i) + "_" + str(j)), membrane)

#MathJax.Hub.Queue(["Typeset", MathJax.Hub])

time = 0
dt = 0.025
while True:
    rate(20)
    membrane.update(time)
    time += dt
