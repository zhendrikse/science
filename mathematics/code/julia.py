#Web VPython 3.2
from vpython import simple_sphere, color, vector, rate, box, canvas, radio, button

title = """&#x2022; <a href="https://github.com/zhendrikse/science/blob/main/mathematics/code/julia.py">julia.py</a> by <a href="https://www.hendrikse.name/">Zeger Hendrikse</a>

"""

width, height = 600, 400
display = canvas(title=title, width=width, height=height, background=color.gray(0.075), range=150)
MathJax.Hub.Queue(["Typeset", MathJax.Hub])

resolution = 0.005
zoom = 1.5
max_iter = 100
scale = 20


class RadioButton:
    def __init__(self, button_, c):
        self._button = button_
        self._c = c

    def uncheck(self):
        self._button.checked = False

    def push(self):
        generate_julia_set(self._c)

    def check(self):
        self._button.checked = True

    def name(self):
        return self._button.name


class RadioButtons:
    def __init__(self):
        self._radio_buttons = []
        self._selected_button = None

    def add(self, button_, c):
        self._radio_buttons.append(RadioButton(button_, c))

        if (len(self._radio_buttons) % 2) == 0:
            display.append_to_caption("\n\n")

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
        self._selected_button.push()

    def get_selected_button_name(self):
        return self._selected_button.name()


def get_color(iteration):
    t = iteration / max_iter
    return vector(t, t * t, 1 - t)


def complex_(re_, im_):
    return re_, im_


def z_squared_minus_c(z_, c_):
    return z_[0] * z_[0] - z_[1] * z_[1] + c_[0], 2 * z_[0] * z_[1] + c_[1]


def abs_z_squared(z_):
    return z_[0] * z_[0] + z_[1] * z_[1]


def generate_julia_set(c):
    # Plotting region
    x_min, x_max = -zoom, zoom
    y_min, y_max = -zoom, zoom
    y = y_min
    step = 0
    while y <= y_max:
        x = x_min
        if step % 20 == 0:
            # Do a screen refresh so that the user sees what's going on
            rate(10000)
        while x <= x_max:
            z = complex_(x, y)
            iteration = 0
            while abs_z_squared(z) < 4 and iteration < max_iter:
                z = z_squared_minus_c(z, c)
                iteration += 1

            if iteration < max_iter: # and .075 < iteration / max_iter < 1:
                colour = get_color(iteration)
                box(pos=vector(x * width / 4, y * height / 4, 0), color=colour, shininess=0)

            x += resolution
        y += resolution
        step += 1


def toggle(event):
    for obj in display.objects:
        obj.visible = False
        del obj

    radio_buttons.toggle(event.name)


def download():
    display.capture("fractal")


radio_buttons = RadioButtons()
radio_buttons.add(radio(bind=toggle, text="c = -0.7 + 0.27015i  ", name="1"), complex_(-0.7, 0.27015))
radio_buttons.add(radio(bind=toggle, text="c = 0.355 + 0.355i  ", name="2"), complex_(0.355, 0.355))
radio_buttons.add(radio(bind=toggle, text="c = -0.5251993 - 0.5251993i  ", name="3"), complex_(-0.5251993, -0.5251993))
radio_buttons.add(radio(bind=toggle, text="c = 0.285 + 0.0035i  ", name="4"), complex_(0.285, 0.0035))
radio_buttons.add(radio(bind=toggle, text="c = -0.8 + 0.156i  ", name="5"), complex_(-0.8, 0.156))

display.append_to_caption("\n\n")
_ = button(text="Download", bind=download, align="right")

generate_julia_set(c=complex_(-0.7, 0.27015))

while True:
    rate(20)
