#Web VPython 3.2
from vpython import vector, canvas, points, color, rate, radio, button

title = """&#x2022; Based on the original <a href="https://vpython.org/contents/contributed/pixelplot.py">pixelplot.py</a> by Bruce Sherwood, Jan. 1, 2008
&#x2022; Refactored by <a href="https://www.hendrikse.name/">Zeger Hendrikse</a> in <a href="https://github.com/zhendrikse/science/blob/main/mathematics/code/mandelbrot.py">mandelbrot.py</a>

"""

resolution = 600  # x and y range over 0 to XMAX

def create_canvas(resolution_):
    new_display = canvas(width=resolution_, fov=0.01, center=vector(resolution_ / 2, 3 * resolution_ / 5, 0),
           height=resolution_, range=resolution_ / 2, background=color.gray(0.075))
    MathJax.Hub.Queue(["Typeset", MathJax.Hub])
    return new_display

display = create_canvas(resolution)
display.title = title

class RadioButton:
    def __init__(self, button_, function_, max_iterations):
        self._button = button_
        self._function = function_
        self._max_iterations = max_iterations

    def uncheck(self):
        self._button.checked = False

    def push(self):
        mandelbrot.set_max_iterations_to(self._max_iterations)
        mandelbrot.render(self._function)

    def check(self):
        self._button.checked = True

    def name(self):
        return self._button.name


class RadioButtons:
    def __init__(self):
        self._radio_buttons = []
        self._selected_button = None

    def add(self, button_, function_, max_iterations):
        self._radio_buttons.append(RadioButton(button_, function_, max_iterations))

        if (len(self._radio_buttons) % 4) == 0:
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

class Mandelbrot:
    def __init__(self, max_iterations=100):
        self._pixels = points()
        self._max_iteration = max_iterations

    def set_color_for_pixel_at(self, x, y, colour):
        self._pixels.append(pos=vector(x, y, 0), color=colour)

    def z_squared_minus_c(self, z_, c_):
        return z_[0] * z_[0] - z_[1] * z_[1] + c_[0], 2 * z_[0] * z_[1] + c_[1]

    def abs_z_squared(self, z_):
        return z_[0] * z_[0] + z_[1] * z_[1]

    def iteration_count(self, z_, c_):
        iteration = 0
        while self.abs_z_squared(z_) < 4 and iteration < self._max_iteration:
            z_ = self.z_squared_minus_c(z_, c_)
            iteration += 1
        return iteration

    def render(self, set_):
        # Mandelbrot set (see Wikipedia, for example):
        self._pixels = points()
        for ny in range(resolution):  # range over all pixel positions
            for nx in range(resolution):
                z, c = set_(nx, ny)

                # Leave points black if the iteration quickly escapes:
                iterations = self.iteration_count(z, c)
                if .1 < iterations / self._max_iteration < 1:
                    colour = color.hsv_to_rgb(vector(iterations / self._max_iteration - .1, 1, 1))
                    self.set_color_for_pixel_at(nx, ny, colour)

    def set_max_iterations_to(self, max_iterations):
        self._max_iteration = max_iterations


def complex_(re, im):
    return re, im

def fractal_1(x, y):
    # from -2 to 1
    z = complex_(-2.15 + x * 3 / resolution, -1.75 + y * 3 / resolution)
    c = complex_(-2.15 + x * 3 / resolution, -1.75 + y * 3 / resolution)
    return z, c

def fractal_2(x, y):
    z = complex_(-1.5 + x / 200, -1.5 + y / 200)
    c = complex_(0.0019 * (z[0] - 300), 0.0019 * (z[1] - 300))
    return z, c

def fractal_3(x, y):
    z = complex_(-1.50 + x * 3 / resolution, -1.50 + y * 3 / resolution)
    c = complex_(-0.5251993,  -0.5251993)
    return z, c

def fractal_4(x, y):
    z = complex_(-1.5 + x * 3 / resolution, -1.5 + y * 3 / resolution)
    c = complex_( 0.285,0.0035)
    return z, c

def fractal_5(x, y):
    z = complex_(-1.5 + x * 3 / resolution, -1.5 + y * 3 / resolution)
    c = complex_(-0.8, 0.156)
    return z, c

def toggle(event):
    global display
    display.delete()
    display = create_canvas(resolution)
    radio_buttons.toggle(event.name)

def download():
    display.capture("fractal")

radio_buttons = RadioButtons()
radio_buttons.add(radio(bind=toggle, text="Fractal 1 ", name="1"), fractal_1, 100)
radio_buttons.add(radio(bind=toggle, text="Fractal 1a ", name="1a"), fractal_1, 25)
radio_buttons.add(radio(bind=toggle, text="Fractal 2 ", name="2"), fractal_2, 100)
radio_buttons.add(radio(bind=toggle, text="Fractal 3 ", name="3"), fractal_3, 100)
radio_buttons.add(radio(bind=toggle, text="Fractal 3a ", name="3a"), fractal_3, 25)
radio_buttons.add(radio(bind=toggle, text="Fractal 4 ", name="4"), fractal_4, 100)
radio_buttons.add(radio(bind=toggle, text="Fractal 5 ", name="5"), fractal_5, 100)
radio_buttons.add(radio(bind=toggle, text="Fractal 5a ", name="5a"), fractal_5, 25)
_ = button(text="Download", bind=download, align="right")
display.append_to_caption("\n\n")

display.delete()
display = create_canvas(resolution)

mandelbrot = Mandelbrot(100)
mandelbrot.render(fractal_1)

while True:
    rate(20)