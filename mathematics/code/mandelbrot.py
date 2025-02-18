#Web VPython 3.2
from vpython import vector, canvas, points, color, rate, radio

title = """&#x2022; Based on the original <a href="https://vpython.org/contents/contributed/pixelplot.py">pixelplot.py</a> by Bruce Sherwood, Jan. 1, 2008
&#x2022; Refactored by <a href="https://www.hendrikse.name/">Zeger Hendrikse</a> in <a href="https://github.com/zhendrikse/science/blob/main/mathematics/code/mandelbrot.py">mandelbrot.py</a>

"""

resolution = 600  # x and y range over 0 to XMAX

def create_canvas(resolution_):
    return canvas(width=resolution_, fov=0.01, center=vector(resolution_ / 2, 3 * resolution_ / 5, 0),
           height=resolution_, range=resolution_ / 2, background=color.gray(0.075))

display = create_canvas(resolution)
display.title = title

class RadioButton:
    def __init__(self, button_, function_):
        self._button = button_
        self._function = function_

    def uncheck(self):
        self._button.checked = False

    def push(self):
        mandelbrot.render(self._function)

    def check(self):
        self._button.checked = True

    def name(self):
        return self._button.name


class RadioButtons:
    def __init__(self):
        self._radio_buttons = []
        self._selected_button = None

    def add(self, button_, function_):
        self._radio_buttons.append(RadioButton(button_, function_))

        if (len(self._radio_buttons) % 5) == 0:
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
    def __init__(self):
        self._pixels = points()
        self._max_iteration = 100

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


def complex_(re, im):
    return re, im

def set_1(x, y):
    # from -2 to 1
    z = complex_(-2 + x * 3 / resolution, -2 + y * 3 / resolution)
    c = complex_(-2 + x * 3 / resolution, -2 + y * 3 / resolution)
    return z, c

def set_2(x, y):
    z = complex_(-1.5 + x * 3 / resolution, -2 + y * 3 / resolution)
    c = complex_(0.0019 * (z[0] - resolution / 2), 0.0019 * (z[1] - resolution / 2))
    return z, c

def toggle(event):
    global display
    display.delete()
    display = create_canvas(resolution)
    radio_buttons.toggle(event.name)

radio_buttons = RadioButtons()
radio_buttons.add(radio(bind=toggle, text="Set 1", name="set_1"), set_1)
radio_buttons.add(radio(bind=toggle, text="Set 2", name="set_2"), set_2)

display.delete()
display = create_canvas(resolution)

mandelbrot = Mandelbrot()
mandelbrot.render(set_1)

while True:
    rate(20)