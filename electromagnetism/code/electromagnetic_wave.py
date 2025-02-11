#Web VPython 3.2

from vpython import *

title = """EM Wave by Rob Salgado (2022), robertoBsalgado@gmail.com

&#x2022; Refactored by <a href="https://www.hendrikse.name/">Zeger Hendrikse</a> to <a href="https://github.com/zhendrikse/science/blob/main/electromagnetism/code/electromagnetic_wave.py">electromagnetic_wave.py</a>

"""

calculus = 1  # key c
verbose = 1  # key v

showNeighboringWaves = 1  # key s
showGauss = 2  # key g

colorScheme = 0  # key n (negative background color)

highlightField = 1

initial_range = 10
initial_forward = vec(2.2012, -2.3109, -2.89429)  # see below
animation = canvas(background=color.gray(0.075), forward=initial_forward, range=initial_range, title=title)

colorBackground = [color.gray(0.075) * 0, color.white]
labelABackground = [color.black, 0.2 * vec(1, 1, 1)]  # opacity
labelFBackground = [0.0 * vec(1, 1, 1), vec(1, 1, 1)]  # opacity
labelAOpacity = [0.66, 0.9]  # opacity
labelFOpacity = [0.9, 0.9]  # opacity

Ecolor = [color.orange, vec(.4, 0, .0), color.yellow, vec(0, 1, 0)]
Bcolor = [color.cyan, vec(0, 0, .4), color.magenta, vec(1, 0., 1.0)]
ddtcolor = [Bcolor[2 + colorScheme], Ecolor[2 + colorScheme]]  # for Ampere and Faraday


ambient = [0.3, 0.7]
animation.ambient = vec(.4, .4, .4)
animation.background = colorBackground[colorScheme]

Emax = 4.
sep = 10.

magnify = 2.5
S = 20
omega = 0.1
wavelength = S
k = 2 * pi / wavelength




labelFontSizeSelected = 4
labelFontSizes = [8, 12, 16, 20, 24, 30]

class WaveFront:
    def __init__(self):
        self._front_color = [vec(0.5, 0.5, 0.5), vec(0.6, 1, 1)]

        field_index = wavelength / 2
        a = 1.
        fa = vertex(pos=vec(field_index, -sep * a, -sep * a))
        fb = vertex(pos=vec(field_index, -sep * a, sep * a))
        fc = vertex(pos=vec(field_index, sep * a, sep * a))
        fd = vertex(pos=vec(field_index, sep * a, -sep * a))
        quad_ = quad(vs=[fa, fb, fc, fd])
        self._front = compound([quad_])
        self._front.opacity = 0.75
        self._front.shininess = 1
        self._front.visible = False
        self._front.color = self._front_color[colorScheme]

        self._front_2 = self._front.clone(pos=vec(field_index + wavelength, 0, 0))
        self._front_2.visible = False

    def set_visibility_to(self, visible):
        self._front.visible = visible
        self._front_2.visible = visible

    def set_color_to_color_scheme(self, color_scheme):
        self._front.color = self._front_color[color_scheme]
        self._front_2.color = self._front_color[color_scheme]

    def update_by(self, t):
        phase0 = wavelength / 4.
        self._front.pos = vec((phase0 + (omega / k) * t) % (2 * S) - S, 0, 0)
        self._front_2.pos = vec((phase0 + wavelength + (omega / k) * t) % (2 * S) - S, 0, 0)


class ElectromagneticWave:
    def __init__(self, offset=vec(0, 0, 0)):
        self._magnetic_field, self._electric_field = [], []
        self._dimmed = False
        for index in arange(-S, S):
            self._electric_field.append(self._field_arrow_at(vec(index, 0, 0) + offset, Ecolor[0]))
            self._magnetic_field.append(self._field_arrow_at(vec(index, 0, 0) + offset, Bcolor[0]))

    def _field_arrow_at(self, position, colour):
        return arrow(pos=position, axis=vec(0, 0, 0), color=colour, shaftwidth=0.2, fixedwidth=1)

    def update_with(self, t):
        for index in arange(0, len(self._electric_field)):
            amplitude_ = Emax * sin(k * (index % (2 * S) - S) - omega * t)
            self._electric_field[index].axis.y = amplitude_
            self._magnetic_field[index].axis.z = amplitude_

    def set_dimmed(self, is_dimmed):
        self._dimmed = is_dimmed
        color_index = 1 if is_dimmed else 0
        color_index += 0 if colorScheme == 0 else 2

        for field in self._electric_field:
            field.color = Ecolor[color_index]
        for field in self._magnetic_field:
            field.color = Bcolor[color_index]

    def show_electric_field_is(self, visible):
        for field in self._electric_field:
            field.visible = visible

    def show_magnetic_field_is(self, visible):
        for field in self._magnetic_field:
            field.visible = visible

    def electric_field_arrow_at(self, index):
        return self._electric_field[index].axis, self._electric_field[index].pos

    def magnetic_field_arrow_at(self, index):
        return self._magnetic_field[index].axis, self._magnetic_field[index].pos

    def set_color_electric_field_arrow(self, index, colour):
        self._electric_field[index].color = colour

    def set_color_magnetic_field_arrow(self, index, colour):
        self._magnetic_field[index].color = colour

#
# Gaussian surface tiled into strips, each strip centered on field-vector evaluation point
#
class GaussSurface:
    def __init__(self):
        self._pos_x = 15  # x-center of Gaussian (centered on a field-vector evaluation point)
        gdx = 1  # width of xstrip spacing (x-spacing of field vectors)
        self._gxsize = 5  # choose an odd number (number of xstrips)
        self._gxleft = -(self._gxsize / 2 - gdx / 2)  # displacement to center of left xstrip
        gxright = self._gxleft + (self._gxsize - 1)  # displacement to center of right xstrip

        self._GXflux = []
        self._GYflux = []
        self._GZflux = []

        self._GYfSeg = []
        self._GZfSeg = []
        self._GSegFlux = []

        for s in [1, -1]:
            for x in arange(self._pos_x + self._gxleft, self._pos_x + self._gxleft + self._gxsize):
                a_x = x - 0 * gdx / 2
                a_p = sep
                b_p = -sep

                self._GYfSeg.append([vertex(pos=vector(a_x, s * sep, a_p), color=Ecolor[0]),
                               vertex(pos=vector(a_x, s * sep, b_p), color=Ecolor[0])])
                self._GZfSeg.append([vertex(pos=vector(a_x, a_p, s * sep), color=Bcolor[0]),
                               vertex(pos=vector(a_x, b_p, s * sep), color=Bcolor[0])])

        sz = len(self._GYfSeg) / 2
        for s in [0, 1]:
            for i in arange(1, sz):
                quad_ = quad(
                    vs=[self._GYfSeg[int(s * sz + (i - 1))][0], self._GYfSeg[int(s * sz + (i - 1))][1],
                        self._GYfSeg[int(s * sz + i)][1], self._GYfSeg[int(s * sz + i)][0]])
                quad_.visible = (showGauss == 2)
                self._GSegFlux.append(quad_)
                quad_ = quad(
                    vs=[self._GZfSeg[int(s * sz + (i - 1))][0], self._GZfSeg[int(s * sz + (i - 1))][1],
                        self._GZfSeg[int(s * sz + i)][1], self._GZfSeg[int(s * sz + i)][0]])
                quad_.visible = (showGauss == 2)
                self._GSegFlux.append(quad_)

        for x in arange(self._pos_x + self._gxleft, self._pos_x + self._gxleft + self._gxsize):
            a_x = x - gdx / 2
            a_p = sep
            Bx = a_x + gdx
            b_p = -sep

            #########################################################

            gYplus = quad(vs=[vertex(pos=vector(a_x, sep, a_p)),
                              vertex(pos=vector(Bx, sep, a_p)),
                              vertex(pos=vector(Bx, sep, b_p)),
                              vertex(pos=vector(a_x, sep, b_p))])
            gYP = gYplus  # compound([gYplus])
            gYP.visible = (showGauss == 1)

            gYminus = quad(vs=[vertex(pos=vector(a_x, -sep, a_p)),
                               vertex(pos=vector(Bx, -sep, a_p)),
                               vertex(pos=vector(Bx, -sep, b_p)),
                               vertex(pos=vector(a_x, -sep, b_p))])
            gYM = gYminus  # compound([gYminus])
            gYM.visible = (showGauss == 1)

            self._GYflux.append(gYP)
            self._GYflux.append(gYM)

            #########################################################

            gZplus = quad(vs=[vertex(pos=vector(a_x, a_p, sep)),
                              vertex(pos=vector(Bx, a_p, sep)),
                              vertex(pos=vector(Bx, b_p, sep)),
                              vertex(pos=vector(a_x, b_p, sep))])
            gZP = gZplus  # compound([gZplus])
            gZP.visible = (showGauss == 1)

            gZminus = quad(vs=[vertex(pos=vector(a_x, a_p, -sep)),
                               vertex(pos=vector(Bx, a_p, -sep)),
                               vertex(pos=vector(Bx, b_p, -sep)),
                               vertex(pos=vector(a_x, b_p, -sep))])
            gZM = gZminus  # compound([gZminus])
            gZM.visible = (showGauss == 1)

            self._GZflux.append(gZP)
            self._GZflux.append(gZM)

            #################################################  ########

        a_x = self._pos_x + gxright + gdx / 2
        a_p = sep
        b_p = -sep
        gfa = vertex(pos=vector(a_x, a_p, sep))
        gfb = vertex(pos=vector(a_x, a_p, -sep))
        gfc = vertex(pos=vector(a_x, b_p, -sep))
        gfd = vertex(pos=vector(a_x, b_p, sep))
        gfQ = quad(vs=[gfa, gfb, gfc, gfd])
        gFORW = compound([gfQ])
        gFORW.opacity = 0.1
        gFORW.shininess = 1
        gFORW.color = color.white
        gFORW.visible = (showGauss > 0)
        gFORW.pos1 = vec(a_x, 0, 0)
        gFORW.pos2 = vec(a_x - gdx / 2, 0, 0)

        a_x = self._pos_x + self._gxleft - gdx / 2
        a_p = sep
        b_p = -sep
        gba = vertex(pos=vector(a_x, a_p, sep))
        gbb = vertex(pos=vector(a_x, a_p, -sep))
        gbc = vertex(pos=vector(a_x, b_p, -sep))
        gbd = vertex(pos=vector(a_x, b_p, sep))
        gbQ = quad(vs=[gba, gbb, gbc, gbd])
        gBACK = compound([gbQ])
        gBACK.opacity = 0.1
        gBACK.shininess = 1
        gBACK.color = color.white
        gBACK.visible = (showGauss > 0)
        gBACK.pos1 = vec(a_x, 0, 0)
        gBACK.pos2 = vec(a_x + gdx / 2, 0, 0)

        self._GXflux.append(gFORW)
        self._GXflux.append(gBACK)

    def toggle_visibility(self):
        for i in self._GYflux + self._GZflux:
            i.visible = (showGauss == 1)
        for i in self._GSegFlux:
            i.visible = (showGauss == 2)
        for i in self._GXflux:
            i.visible = (showGauss > 0)
        if showGauss == 1:
            self._GXflux[0].pos = self._GXflux[0].pos1
            self._GXflux[1].pos = self._GXflux[1].pos1
        else:
            self._GXflux[0].pos = self._GXflux[0].pos2
            self._GXflux[1].pos = self._GXflux[1].pos2

    def update_by(self, t):
        if showGauss > 0:
            self._update(t)

    def _update(self, t):
        if showGauss == 2:
            for s in [0, 1]:
                i = 0
                for x in arange(0, self._gxsize):
                    amp = sin(k * (x + self._pos_x + self._gxleft) - omega * t)
                    self._GYfSeg[s * self._gxsize + i][0].opacity = abs(amp)
                    self._GYfSeg[s * self._gxsize + i][1].opacity = abs(amp)
                    self._GZfSeg[s * self._gxsize + i][0].opacity = abs(amp)
                    self._GZfSeg[s * self._gxsize + i][1].opacity = abs(amp)
                    if (1 - 2 * s) * amp > 0:
                        self._GYfSeg[s * self._gxsize + i][0].color = Ecolor[0]
                        self._GYfSeg[s * self._gxsize + i][1].color = Ecolor[0]
                        self._GZfSeg[s * self._gxsize + i][0].color = Bcolor[0]
                        self._GZfSeg[s * self._gxsize + i][1].color = Bcolor[0]
                    else:
                        self._GYfSeg[s * self._gxsize + i][0].color = Ecolor[1]
                        self._GYfSeg[s * self._gxsize + i][1].color = Ecolor[1]
                        self._GZfSeg[s * self._gxsize + i][0].color = Bcolor[1]
                        self._GZfSeg[s * self._gxsize + i][1].color = Bcolor[1]

                    i += 1
        else:
            for x in arange(0, self._gxsize):
                amp = sin(k * (x + self._pos_x + self._gxleft) - omega * t)
                self._GYfSeg[0 + 2 * x][0].opacity = abs(amp)
                self._GYfSeg[0 + 2 * x][0].color = Ecolor[0] if amp > 0 else Ecolor[1]
                self._GYfSeg[1 + 2 * x][1].opacity = abs(amp)
                self._GYfSeg[1 + 2 * x][1].color = Ecolor[0] if (-amp) > 0 else Ecolor[1]

                self._GZfSeg[0 + 2 * x][0].opacity = abs(amp)
                self._GZfSeg[0 + 2 * x][0].color = Bcolor[0] if amp > 0 else Bcolor[1]
                self._GZfSeg[1 + 2 * x][1].opacity = abs(amp)
                self._GZfSeg[1 + 2 * x][1].color = Bcolor[0] if (-amp) > 0 else Bcolor[1]

class FaradayAmpereLoop:
    def __init__(self):
        height = sep / 2.
        field_index = int(wavelength / 2)
        self._FaradayLoop = curve(
            pos=[vec(-1, -height, 0), vec(-1, height, 0), vec(1, height, 0), vec(1, -height, 0), vec(-1, -height, 0)],
            color=ddtcolor[0])
        self._AmpereLoop = curve(
            pos=[vec(-1, 0, -height), vec(-1, 0, height), vec(1, 0, height), vec(1, 0, -height), vec(-1, 0, -height)],
            color=ddtcolor[1])

        self._dBdt = arrow(pos=vector(field_index, 0, 0), axis=vec(0, 0, 0), color=ddtcolor[0], shaftwidth=0.35,
                     headwidth=0.7, fixedwidth=1)
        self._dEdt = arrow(pos=vector(field_index, 0, 0), axis=vec(0, 0, 0), color=ddtcolor[1], shaftwidth=0.35,
                     headwidth=0.7, fixedwidth=1)
        self._dBdt_label = label(pos=vector(field_index, 0, 0), text='dB/dt', color=Bcolor[2],
                          opacity=labelFOpacity[colorScheme],
                          background=labelFBackground[colorScheme], xoffset=20, yoffset=12,
                          height=labelFontSizes[labelFontSizeSelected], border=6, font="sans")
        self._dEdt_label = label(pos=vector(field_index, 0, 0), text='dE/dt', color=Ecolor[2],
                          opacity=labelAOpacity[colorScheme],
                          background=labelABackground[colorScheme], xoffset=20, yoffset=12,
                          height=labelFontSizes[labelFontSizeSelected], border=6, font="sans")
        self._field_index = field_index
        self._highlight_field = True

    def shift(self, new_field_index):
        if self._field_index == new_field_index:
            return

        self._restore_color_field_arrows()
        self._field_index = new_field_index
        self._highlight_contained_field_arrows()

        self._FaradayLoop.modify(0, x=self._field_index - 1)
        self._FaradayLoop.modify(1, x=self._field_index - 1)
        self._FaradayLoop.modify(2, x=self._field_index + 1)
        self._FaradayLoop.modify(3, x=self._field_index + 1)
        self._FaradayLoop.modify(4, x=self._field_index - 1)

        self._AmpereLoop.modify(0, x=self._field_index - 1)
        self._AmpereLoop.modify(1, x=self._field_index - 1)
        self._AmpereLoop.modify(2, x=self._field_index + 1)
        self._AmpereLoop.modify(3, x=self._field_index + 1)
        self._AmpereLoop.modify(4, x=self._field_index - 1)

    def refresh(self):
        self._restore_color_field_arrows()
        self._highlight_contained_field_arrows()

    def _restore_color_field_arrows(self):
        color_index = 1 if dim_fields_checkbox.checked else 0
        central_electromagnetic_wave.set_color_electric_field_arrow(S + self._field_index - 1, Ecolor[color_index])
        central_electromagnetic_wave.set_color_electric_field_arrow(S + self._field_index + 1, Ecolor[color_index])

        central_electromagnetic_wave.set_color_magnetic_field_arrow(S + self._field_index - 1, Bcolor[color_index])
        central_electromagnetic_wave.set_color_magnetic_field_arrow(S + self._field_index + 1, Bcolor[color_index])

        if highlightField == 1 and faraday_checkbox.checked:
            central_electromagnetic_wave.set_color_magnetic_field_arrow(S + self._field_index, Bcolor[color_index])
        if highlightField == 1 and ampere_checkbox.checked:
            central_electromagnetic_wave.set_color_electric_field_arrow(S + self._field_index, Ecolor[color_index])

    def _highlight_contained_field_arrows(self):
        if not self._highlight_field:
            return

        if faraday_checkbox.checked:
            central_electromagnetic_wave.set_color_electric_field_arrow(S + self._field_index + 1, ddtcolor[0])
            central_electromagnetic_wave.set_color_electric_field_arrow(S + self._field_index - 1, ddtcolor[0])
            central_electromagnetic_wave.set_color_magnetic_field_arrow(S + self._field_index, ddtcolor[1])
        if ampere_checkbox.checked:
            central_electromagnetic_wave.set_color_magnetic_field_arrow(S + self._field_index + 1, ddtcolor[1])
            central_electromagnetic_wave.set_color_magnetic_field_arrow(S + self._field_index - 1, ddtcolor[1])
            central_electromagnetic_wave.set_color_electric_field_arrow(S + self._field_index, ddtcolor[0])

    def update_by(self, t):
        prefixAmpere = ["", "Ampere says\n", "Ampere:\nCurly-Bs say\n", ""]
        prefixFaraday = ["", "Faraday says\n", "Faraday:\nanti-Curly-Es say\n", ""]

        dBdtpos_text = [" |B| is increasing ", " d|B|/dt >0 "]
        dBdtneg_text = [" |B| is decreasing ", " d|B|/dt <0 "]
        dBdtzer_text = [" |B| is maintained ", " d|B|/dt =0 "]

        dEdtpos_text = [" |E| is increasing ", " d|E|/dt >0 "]
        dEdtneg_text = [" |E| is decreasing ", " d|E|/dt <0 "]
        dEdtzer_text = [" |E| is maintained ", " d|E|/dt =0 "]

        # UPDATE THE dB/dt
        phase = k * (self._field_index - S) - omega * t
        field_at_right, _ = central_electromagnetic_wave.electric_field_arrow_at(S + self._field_index + 1)
        field_at_left, _ = central_electromagnetic_wave.electric_field_arrow_at(S + self._field_index - 1)
        dot_prod = dot(field_at_right - field_at_left, vector(0, 1, 0))

        self._dBdt.axis.z = magnify * omega * Emax * abs(cos(phase)) * -sign(dot_prod)
        self._dBdt_label.text = prefixFaraday[verbose]

        magnetic_field, pos = central_electromagnetic_wave.magnetic_field_arrow_at(S + self._field_index)
        dot_prod = dot(self._dBdt.axis, magnetic_field)
        if dot_prod > 0:
            self._dBdt_label.text += dBdtpos_text[calculus]
            self._dBdt.pos = vector(self._field_index, 0, magnetic_field.z)
        elif dot_prod < 0:
            self._dBdt_label.text += dBdtneg_text[calculus]
            self._dBdt.pos = vector(self._field_index, 0, magnetic_field.z - self._dBdt.axis.z)
        else:
            self._dBdt_label.text += dBdtzer_text[calculus]
            self._dBdt.pos = vector(self._field_index, 0, magnetic_field.z)
        self._dBdt_label.pos = pos + magnetic_field

        # UPDATE THE dE/dt
        field_at_right, _ = central_electromagnetic_wave.magnetic_field_arrow_at(S + self._field_index + 1)
        field_at_left, _ = central_electromagnetic_wave.magnetic_field_arrow_at(S + self._field_index - 1)
        dot_prod = dot(field_at_right - field_at_left, vector(0, 0, -1))

        self._dEdt.axis.y = magnify * omega * Emax * abs(cos(phase)) * sign(dot_prod)
        self._dEdt_label.text = prefixAmpere[verbose]

        electric_field, pos = central_electromagnetic_wave.electric_field_arrow_at(S + self._field_index)
        dot_prod = dot(self._dEdt.axis, electric_field)
        if dot_prod > 0:
            self._dEdt_label.text += dEdtpos_text[calculus]
            self._dEdt.pos = vector(self._field_index, electric_field.y, 0)
        elif dot_prod < 0:
            self._dEdt_label.text += dEdtneg_text[calculus]
            self._dEdt.pos = vector(self._field_index, electric_field.y - self._dEdt.axis.y, 0)
        else:
            self._dEdt_label.text += dEdtzer_text[calculus]
            self._dEdt.pos = vector(self._field_index, electric_field.y, 0)
        self._dEdt_label.pos = pos + electric_field

    def adjust_font_size_to(self, font_size_index):
        self._dBdt_label.height = labelFontSizes[font_size_index]
        self._dEdt_label.height = labelFontSizes[font_size_index]

    def set_visibility_to(self, visible):
        self._dBdt_label.visible = visible
        self._dEdt_label.visible = visible

    def set_color_scheme_to(self, color_scheme):
        self._dEdt_label.background = labelABackground[color_scheme]
        self._dBdt_label.background = labelFBackground[color_scheme]
        self._dEdt_label.opacity = labelAOpacity[color_scheme]
        self._dBdt_label.opacity = labelFOpacity[color_scheme]
        ddtcolor[0] = Bcolor[2 + color_scheme]
        ddtcolor[1] = Ecolor[2 + color_scheme]

        self._FaradayLoop.color = ddtcolor[0]
        self._dBdt.color = ddtcolor[0]
        self._dBdt_label.color = Bcolor[2]  # using ddtcolor[1] will have darker text
        self._AmpereLoop.color = ddtcolor[1]
        self._dEdt.color = ddtcolor[1]
        self._dEdt_label.color = Ecolor[2]  # using ddtcolor[0] will have darker text

    def set_faraday_visibility_to(self, visible):
        self._FaradayLoop.visible = visible
        self._dBdt.visible = visible
        self._dBdt_label.visible = visible and verbose

    def set_ampere_visibility_to(self, visible):
        self._AmpereLoop.visible = visible
        self._dEdt.visible = visible
        self._dEdt_label.visible = visible and verbose

    def set_highlight_field_to(self, true_or_false):
        self._highlight_field = true_or_false


ampere_faraday_loop = FaradayAmpereLoop()
wave_front = WaveFront()
gauss_surface = GaussSurface()
central_electromagnetic_wave = ElectromagneticWave()

neighbouring_electromagnetic_waves = [ElectromagneticWave(vec(0, sep, 0))]
neighbouring_electromagnetic_waves += [ElectromagneticWave(vec(0, -sep, 0))]
for j in arange(1, 3):
    neighbouring_electromagnetic_waves += [ElectromagneticWave(vec(0, 0, j * sep))]
    neighbouring_electromagnetic_waves += [ElectromagneticWave(vec(0, 0, -j * sep))]

def toggle_font_size(event):
    global labelFontSizeSelected
    labelFontSizeSelected += 1
    labelFontSizeSelected %= len(labelFontSizes)
    ampere_faraday_loop.adjust_font_size_to(labelFontSizeSelected)

def toggle_technical_labels(event):
    global calculus
    calculus = 1 if event.checked else 0

def toggle_wave_fronts(event):
    wave_front.set_visibility_to(event.checked)

def toggle_verbose(event):
    global verbose
    verbose += 1
    verbose %= 4
    ampere_faraday_loop.set_visibility_to((1 if faraday_checkbox.checked else 0) * min(verbose, 1))

def toggle_dim_fields(event):
    central_electromagnetic_wave.set_dimmed(event.checked)
    for wave_ in neighbouring_electromagnetic_waves:
        wave_.set_dimmed(event.checked)
    ampere_faraday_loop.refresh()

def toggle_show_electric_field(event):
    central_electromagnetic_wave.show_electric_field_is(event.checked)
    for wave_ in neighbouring_electromagnetic_waves:
        wave_.show_electric_field_is(event.checked)
    ampere_faraday_loop.refresh()

def toggle_show_magnetic_field(event):
    central_electromagnetic_wave.show_magnetic_field_is(event.checked)
    for wave_ in neighbouring_electromagnetic_waves:
        wave_.show_magnetic_field_is(event.checked)
    ampere_faraday_loop.refresh()

def toggle_show_neighbouring_waves(event):
    global showNeighboringWaves
    for wave_ in neighbouring_electromagnetic_waves:
        wave_.show_magnetic_field_is(event.checked)
        wave_.show_electric_field_is(event.checked)

def toggle_show_gauss(event):
    global  showGauss
    showGauss += 1
    showGauss %= 3
    gauss_surface.toggle_visibility()

def toggle_color_scheme(event):
    global colorScheme
    colorScheme = 0 if event.checked else 1
    animation.background = colorBackground[colorScheme]
    ampere_faraday_loop.set_color_scheme_to(colorScheme)
    wave_front.set_color_to_color_scheme(colorScheme)
    animation.ambient = vector(1, 1, 1) - vector(animation.ambient)

def toggle_run(event):
    pass

def toggle_faraday(event):
    ampere_faraday_loop.set_faraday_visibility_to(event.checked)
    ampere_faraday_loop.refresh()

def toggle_ampere(event):
    ampere_faraday_loop.set_ampere_visibility_to(event.checked)
    ampere_faraday_loop.refresh()

def toggle_highlight_field(event):
    ampere_faraday_loop.set_highlight_field_to(event.checked)
    ampere_faraday_loop.refresh()

animation.append_to_caption("\n")
ampere_checkbox = checkbox(text="Ampere ", bind=toggle_ampere, checked=True)
faraday_checkbox = checkbox(text="Faraday ", bind=toggle_faraday, checked=True)
highlight_field_checkbox = checkbox(text="Highlight field ", bind=toggle_highlight_field, checked=True)
technical_labels_checkbox = checkbox(text="Technical labels ", bind=toggle_technical_labels, checked=True)

animation.append_to_caption("\n\n")
dark_background_checkbox = checkbox(text="Dark background", bind=toggle_color_scheme, checked=True)
wave_front_checkbox = checkbox(text="Wave front ", bind=toggle_wave_fronts, checked=False)
neighbouring_waves = checkbox(text="Neighbouring waves ", bind=toggle_show_neighbouring_waves, checked=True)
pause_checkbox = checkbox(text="Pause ", bind=toggle_run, checked=False)

animation.append_to_caption("\n\n")
electric_field_checkbox = checkbox(text="Electric field ", bind=toggle_show_magnetic_field, checked=True)
magnetic_field_checkbox = checkbox(text="Magnetic field ", bind=toggle_show_electric_field, checked=True)
dim_fields_checkbox = checkbox(text="Dim fields ", bind=toggle_dim_fields, checked=False)

animation.append_to_caption("\n\n")
show_gauss_button = button(text=" Show Gauss", bind=toggle_show_gauss)
font_size_button= button(text=" Font size ", bind=toggle_font_size)
verbose_button= button(text=" Verbose ", bind=toggle_verbose)
MathJax.Hub.Queue(["Typeset", MathJax.Hub])


time = 1
while True:
    rate(60)
    mouse_pos_x = int(animation.mouse.pos.x)
    field_arrow_index = max(min(mouse_pos_x, S - 2), -(S - 2))
    ampere_faraday_loop.shift(field_arrow_index)

    central_electromagnetic_wave.update_with(time)
    for wave in neighbouring_electromagnetic_waves:
        wave.update_with(time)

    gauss_surface.update_by(time)
    wave_front.update_by(time)
    ampere_faraday_loop.update_by(time)

    if not pause_checkbox.checked:
        time += 0.1




