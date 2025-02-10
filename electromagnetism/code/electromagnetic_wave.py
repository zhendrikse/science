#Web VPython 3.2

### Rob Salgado
### (2022) robertoBsalgado@gmail.com

### previous VPython version: http://www.visualrelativity.com/vpython/EMWave-Maxwell_v277.py
###
### v0.5  2001-11-07 tested on Windows 2000
### v0.51 2003-02-16 tested on Windows 2000
###         with Python-2.1.1.exe and VPython-2001-10-31.exe
### v1.00 2004-03-21 tested on Windows 2000
###         with Python-2.3.3.exe and VPython-2003-10-15.exe
### v2.00 2006-04-30 tested on Windows 2000
### v2.50 2006-06-01 tested on Windows 2000/XP-TabletPC
###         with Python-2.3.4.exe and VPython-2003-10-15.exe
### v2.51 2006-06-13 tested on Windows 2000/XP-TabletPC
###         with Python-2.3.4.exe and VPython-2003-10-15.exe #fixed minor loop color problem

### v2.75 2008-01-18 tested on Windows XP
###         with Python-2.3.4.exe and VPython-2003-10-15.exe #colors adjusted (key 'n'), keys 'e' and 'b'
###  Updated 3/24/2009 by mmason to run under Vpython 2.4
###
###       Thanks mmason!!! --rs

### v2.77 2009-05-06 modifed minor text labels; appears to work with Python 2.5
### v2.80 2015-10-31 corrected by scene.ambient (works on Python 2.6)
### v3.00 2021-04-10 converted to Glowscript 3.0
### v3.50 2022-04-05 revised color schemes

from vpython import *

calculus = 1  # key c
verbose = True  # key v

showNeighboringWaves = 1  # key s
showWavefronts = 0  # key w
showGauss = 2  # key g
showE = 1  # key e
showB = 1  # key b

# INITIALrange=10
# INITIALforward=vec( 2.2012, -2.3109, -2.89429    )  #see below


dimFields = 0  # key d
colorScheme = 0  # key n (negative background color)

highlightAmpere = 1
highlightFaraday = 1
highlightField = 1

instructions = """
Electromagnetic Plane Wave visualization 
(v3.00) 2021-04-09 RS  [ Glowscript 3.0 ] 
(v2.80) 2015-10-31 RS  [ VPython 2.6] 
(v0.50) 2001-11-07     [ VPython 2001-10-31/Windows 2000]
Rob Salgado


      MOVE the mouse to reposition the loops
      TAP SPACEBAR to start and stop the animation
      TOGGLE: (a)mpere     (f)araday  (g)auss  (w)avefront
              (d)im-fields (s)how-neighboring-waves
              (c)alculus   (v)erbose  (n) color-scheme (z) fontSize

"""

initial_range = 10
initial_forward = vec(2.2012, -2.3109, -2.89429)  # see below
animation = canvas(background=color.gray(0.075), forward=initial_forward, range=initial_range, title="EM Wave v3.00 (Rob Salgado)")
#MathJax.Hub.Queue(["Typeset", MathJax.Hub])

colorBackground = [color.gray(0.075) * 0, color.white]
labelABackground = [color.black, 0.2 * vec(1, 1, 1)]  # opacity
labelFBackground = [0.0 * vec(1, 1, 1), vec(1, 1, 1)]  # opacity
labelAOpacity = [0.66, 0.9]  # opacity
labelFOpacity = [0.9, 0.9]  # opacity
label_epsV = vector(.1, .1, .1)

Ecolor = [color.orange, vec(.4, 0, .0), color.yellow, vec(0, 1, 0)]
Bcolor = [color.cyan, vec(0, 0, .4), color.magenta, vec(1, 0., 1.0)]
ddtcolor = [Bcolor[2 + colorScheme], Ecolor[2 + colorScheme]]  # for Ampere and Faraday

Gcolor1 = vec(0.0, 0.27e-9, 0.0)
Gcolor2 = Gcolor1;
Gcolor_boundary = [color.white, color.black]  # GAUSS
Frontcolor = [vec(0.5, 0.5, 0.5), vec(0.6, 1, 1)]

ambient = [0.3, 0.7]
animation.ambient = vec(.4, .4, .4)
animation.background = colorBackground[colorScheme]

EField = []
EField2 = []

BField = []
BField2 = []
Emax = 4.
sep = 10.

magnify = 2.5
S = 20
omega = 0.1
wavelength = S
k = 2 * pi / wavelength

t = 1
fi = 0 + wavelength / 2

prefixAmpere = ["", "Ampere says\n", "Ampere:\nCurly-Bs say\n", ""]
prefixFaraday = ["", "Faraday says\n", "Faraday:\nanti-Curly-Es say\n", ""]

dBdtpos_text = [" |B| is increasing ", " d|B|/dt >0 "]
dBdtneg_text = [" |B| is decreasing ", " d|B|/dt <0 "]
dBdtzer_text = [" |B| is maintained ", " d|B|/dt =0 "]

dEdtpos_text = [" |E| is increasing ", " d|E|/dt >0 "]
dEdtneg_text = [" |E| is decreasing ", " d|E|/dt <0 "]
dEdtzer_text = [" |E| is maintained ", " d|E|/dt =0 "]

labelFontSizeSelected = 4
labelFontSizes = [8, 12, 16, 20, 24, 30]

######################################################################################################
######################################################################################################
##
## WAVEFRONT
##
fi = wavelength / 2
a = 1.

phase0 = 0
phase1 = fi
phase2 = fi + wavelength

fa = vertex(pos=vec(fi, -sep * a, -sep * a))
fb = vertex(pos=vec(fi, -sep * a, sep * a))
fc = vertex(pos=vec(fi, sep * a, sep * a))
fd = vertex(pos=vec(fi, sep * a, -sep * a))
fQ = quad(vs=[fa, fb, fc, fd])
FRONT = compound([fQ])
FRONT.opacity = 0.75
FRONT.shininess = 1
FRONT.visible = showWavefronts
FRONT.color = Frontcolor[colorScheme]

FRONT2 = FRONT.clone(pos=vec(fi + wavelength, 0, 0))
FRONT2.visible = showWavefronts

######################################################################################################


## FIELDS
for i in arange(-S, S):
    Ev = arrow(pos=vec(i, 0, 0), axis=vec(0, 0, 0), color=Ecolor[dimFields], shaftwidth=0.2, fixedwidth=1, nbw=0)
    EField.append(Ev)

for i in arange(-S, S):
    Bv = arrow(pos=vec(i, 0, 0), axis=vec(0, 0, 0), color=Bcolor[dimFields], shaftwidth=0.2, fixedwidth=1, nbw=0)
    BField.append(Bv)

if showNeighboringWaves >= 0:
    for i in arange(-S, S):
        Ev = arrow(pos=vec(i, sep, 0), axis=vec(0, 0, 0), color=Ecolor[0], shaftwidth=0.2, fixedwidth=1, nbw=3,
                   visible=showNeighboringWaves)
        EField.append(Ev)
    for i in arange(-S, S):
        Bv = arrow(pos=vec(i, sep, 0), axis=vec(0, 0, 0), color=Bcolor[0], shaftwidth=0.2, fixedwidth=1, nbw=3,
                   visible=showNeighboringWaves)
        BField.append(Bv)

    for i in arange(-S, S):
        Ev = arrow(pos=vec(i, -sep, 0), axis=vec(0, 0, 0), color=Ecolor[0], shaftwidth=0.2, fixedwidth=1, nbw=3,
                   visible=showNeighboringWaves)
        EField.append(Ev)
    for i in arange(-S, S):
        Bv = arrow(pos=vec(i, -sep, 0), axis=vec(0, 0, 0), color=Bcolor[0], shaftwidth=0.2, fixedwidth=1, nbw=3,
                   visible=showNeighboringWaves)
        BField.append(Bv)

    for j in arange(1, 3):
        for i in arange(-S, S):
            Ev = arrow(pos=vec(i, 0, j * sep), axis=vec(0, 0, 0), color=Ecolor[dimFields], shaftwidth=0.2, fixedwidth=1,
                       nbw=1, visible=showNeighboringWaves)
            EField.append(Ev)
        for i in arange(-S, S):
            Bv = arrow(pos=vec(i, 0, j * sep), axis=vec(0, 0, 0), color=Bcolor[dimFields], shaftwidth=0.2, fixedwidth=1,
                       nbw=1, visible=showNeighboringWaves)
            BField.append(Bv)

        for i in arange(-S, S):
            Ev = arrow(pos=vec(i, 0, -j * sep), axis=vec(0, 0, 0), color=Ecolor[dimFields], shaftwidth=0.2,
                       fixedwidth=1, nbw=1, visible=showNeighboringWaves)
            EField.append(Ev)
        for i in arange(-S, S):
            Bv = arrow(pos=vec(i, 0, -j * sep), axis=vec(0, 0, 0), color=Bcolor[dimFields], shaftwidth=0.2,
                       fixedwidth=1, nbw=1, visible=showNeighboringWaves)
            BField.append(Bv)

######################################################################################################
######################################################################################################
# FARADAY AMPERE

height = sep / 2.
FaradayLoop = curve(
    pos=[vec(-1, -height, 0), vec(-1, height, 0), vec(1, height, 0), vec(1, -height, 0), vec(-1, -height, 0)],
    color=ddtcolor[0])
AmpereLoop = curve(
    pos=[vec(-1, 0, -height), vec(-1, 0, height), vec(1, 0, height), vec(1, 0, -height), vec(-1, 0, -height)],
    color=ddtcolor[1])

dBdt = arrow(pos=vector(fi, 0, 0), axis=vec(0, 0, 0), color=ddtcolor[0], shaftwidth=0.35, headwidth=0.7, fixedwidth=1)
dEdt = arrow(pos=vector(fi, 0, 0), axis=vec(0, 0, 0), color=ddtcolor[1], shaftwidth=0.35, headwidth=0.7, fixedwidth=1)
dBdtlabel = label(pos=vector(fi, 0, 0) + label_epsV, text='dB/dt', color=Bcolor[2], opacity=labelFOpacity[colorScheme],
                  background=labelFBackground[colorScheme], xoffset=20, yoffset=12,
                  height=labelFontSizes[labelFontSizeSelected], border=6, font="sans")
dEdtlabel = label(pos=vector(fi, 0, 0), text='dE/dt', color=Ecolor[2], opacity=labelAOpacity[colorScheme],
                  background=labelABackground[colorScheme], xoffset=20, yoffset=12,
                  height=labelFontSizes[labelFontSizeSelected], border=6, font="sans")

#
# Gaussian surface tiled into strips, each strip centered on field-vector evaluation point
#


gposx = 15  # x-center of Gaussian (centered on a field-vector evaluation point)
gdx = 1  # width of xstrip spacing (x-spacing of field vectors)
gxsize = 5  # choose an odd number (number of xstrips)
gxleft = -(gxsize / 2 - gdx / 2)  # displacement to center of left xstrip
gxright = gxleft + (gxsize - 1)  # displacement to center of right xstrip

GXflux = []
GYflux = []
GZflux = []

GYfSeg = []
GZfSeg = []
GSegFlux = []

for s in [1, -1]:
    for x in arange(gposx + gxleft, gposx + gxleft + gxsize):
        Ax = x - 0 * gdx / 2
        Ap = sep
        Bx = Ax + gdx
        Bp = -sep

        GYfSeg.append([vertex(pos=vector(Ax, s * sep, Ap), color=Ecolor[0]),
                       vertex(pos=vector(Ax, s * sep, Bp), color=Ecolor[0])])
        GZfSeg.append([vertex(pos=vector(Ax, Ap, s * sep), color=Bcolor[0]),
                       vertex(pos=vector(Ax, Bp, s * sep), color=Bcolor[0])])

sz = len(GYfSeg) / 2
for s in [0, 1]:
    for i in arange(1, sz):
        Q = quad(
            vs=[GYfSeg[int(s * sz + (i - 1))][0], GYfSeg[int(s * sz + (i - 1))][1], GYfSeg[int(s * sz + i)][1], GYfSeg[int(s * sz + i)][0]])
        Q.visible = (showGauss == 2)
        GSegFlux.append(Q)
        Q = quad(
            vs=[GZfSeg[int(s * sz + (i - 1))][0], GZfSeg[int(s * sz + (i - 1))][1], GZfSeg[int(s * sz + i)][1], GZfSeg[int(s * sz + i)][0]])
        Q.visible = (showGauss == 2)
        GSegFlux.append(Q)

for x in arange(gposx + gxleft, gposx + gxleft + gxsize):
    Ax = x - gdx / 2
    Ap = sep
    Bx = Ax + gdx
    Bp = -sep

    #########################################################

    gYplus = quad(vs=[vertex(pos=vector(Ax, sep, Ap)),
                      vertex(pos=vector(Bx, sep, Ap)),
                      vertex(pos=vector(Bx, sep, Bp)),
                      vertex(pos=vector(Ax, sep, Bp))])
    gYP = gYplus  # compound([gYplus])
    gYP.visible = (showGauss == 1)

    gYminus = quad(vs=[vertex(pos=vector(Ax, -sep, Ap)),
                       vertex(pos=vector(Bx, -sep, Ap)),
                       vertex(pos=vector(Bx, -sep, Bp)),
                       vertex(pos=vector(Ax, -sep, Bp))])
    gYM = gYminus  # compound([gYminus])
    gYM.visible = (showGauss == 1)

    GYflux.append(gYP)
    GYflux.append(gYM)

    #########################################################

    gZplus = quad(vs=[vertex(pos=vector(Ax, Ap, sep)),
                      vertex(pos=vector(Bx, Ap, sep)),
                      vertex(pos=vector(Bx, Bp, sep)),
                      vertex(pos=vector(Ax, Bp, sep))])
    gZP = gZplus  # compound([gZplus])
    gZP.visible = (showGauss == 1)

    gZminus = quad(vs=[vertex(pos=vector(Ax, Ap, -sep)),
                       vertex(pos=vector(Bx, Ap, -sep)),
                       vertex(pos=vector(Bx, Bp, -sep)),
                       vertex(pos=vector(Ax, Bp, -sep))])
    gZM = gZminus  # compound([gZminus])
    gZM.visible = (showGauss == 1)

    GZflux.append(gZP)
    GZflux.append(gZM)

    #################################################  ########

if 1:
    Ax = gposx + gxright + gdx / 2
    Ap = sep
    Bx = Ax + gdx
    Bp = -sep
    gfa = vertex(pos=vector(Ax, Ap, sep))
    gfb = vertex(pos=vector(Ax, Ap, -sep))
    gfc = vertex(pos=vector(Ax, Bp, -sep))
    gfd = vertex(pos=vector(Ax, Bp, sep))
    gfQ = quad(vs=[gfa, gfb, gfc, gfd])
    gFORW = compound([gfQ])
    gFORW.opacity = 0.1
    gFORW.shininess = 1
    gFORW.color = color.white
    gFORW.visible = (showGauss > 0)
    gFORW.pos1 = vec(Ax, 0, 0)
    gFORW.pos2 = vec(Ax - gdx / 2, 0, 0)

    Ax = gposx + gxleft - gdx / 2
    Ap = sep
    Bx = Ax + gdx
    Bp = -sep
    gba = vertex(pos=vector(Ax, Ap, sep))
    gbb = vertex(pos=vector(Ax, Ap, -sep))
    gbc = vertex(pos=vector(Ax, Bp, -sep))
    gbd = vertex(pos=vector(Ax, Bp, sep))
    gbQ = quad(vs=[gba, gbb, gbc, gbd])
    gBACK = compound([gbQ])
    gBACK.opacity = 0.1
    gBACK.shininess = 1
    gBACK.color = color.white
    gBACK.visible = (showGauss > 0)
    gBACK.pos1 = vec(Ax, 0, 0)
    gBACK.pos2 = vec(Ax + gdx / 2, 0, 0)

    GXflux.append(gFORW)
    GXflux.append(gBACK)


##########################################################################################################
##########################################################################################################

def keyInput(evt):
    global AmpereLoop, dEdt, dEdtlabel, BField, fi, ddtcolor, dimFields
    global FaradayLoop, dBdt, dBdtLabel, Efield, labelFontSizes, labelFontSizeSelected
    global showE, showB, showNeighboringWaves
    global verbose, calculus
    global showWavefronts, showGauss, GaussElements
    global colorScheme, gaussSurface, Gcolor_boundary
    global animation, colorBackground, Ecolor, Bcolor
    global frontFrame, front, front2, Frontcolor
    global highlightfield

    if 1:  # evt.event== 'click': #CLICK TOGGLE PAUSE

        #        scene.waitfor('click')
        #        trun = (trun+1)%2
        #
        #    else:  #process key instead
        s = evt.key

        # print(" ki",s)
        # if 0: if scene.kb.keys: # is there an event waiting to be processed?
        # s = scene.kb.getkey() # obtain keyboard information


        if s == 'v':
            verbose += 1
            verbose %= len(prefixAmpere);
            dBdtlabel.visible = showFaraday * min(verbose, 1)
            dEdtlabel.visible = showAmpere * min(verbose, 1)


        if s == 'x':
            print("scene.center=", animation.center)
            print("scene.forward=", animation.forward)
            print("scene.range=", animation.range)
            print("t={}\n".format(t))

        if faraday_checkbox.checked: EField[S + fi - 1].color = EField[S + fi + 1].color = ddtcolor[0]
        if ampere_checkbox.checked:  BField[S + fi - 1].color = BField[S + fi + 1].color = ddtcolor[1]
        if highlightField:
            BField[S + fi].color = Bcolor[0] if faraday_checkbox.checked else Bcolor[dimFields]
            EField[S + fi].color = Ecolor[0] if ampere_checkbox.checked else Ecolor[dimFields]


# scene.bind('keydown click', keyInput)
animation.bind('keydown', keyInput)

def toggle_font_size(event):
    global labelFontSizeSelected
    labelFontSizeSelected += 1
    labelFontSizeSelected %= len(labelFontSizes)
    dBdtlabel.height = labelFontSizes[labelFontSizeSelected]
    dEdtlabel.height = labelFontSizes[labelFontSizeSelected]

def toggle_calculus(event):
    global calculus
    calculus += 1
    calculus %= 2

def toggle_wavefronts(event):
    global showWavefronts
    showWavefronts += 1
    showWavefronts %= 2
    FRONT.visible = showWavefronts
    FRONT2.visible = showWavefronts

def toggle_dim_fields(event):
    global dimFields
    dimFields += 1
    dimFields %= 2

    for i in EField:
        i.color = Ecolor[dimFields]
    for i in BField:
        i.color = Bcolor[dimFields]

def toggle_show_electric_field(event):
    global showE
    showE += 1
    showE %= 2

    for i in EField:
        i.visible = showE * (1 - showNeighboringWaves * (i.nbw % 2))

def toggle_show_magnetic_field(event):
    global showB
    showB += 1
    showB %= 2

    for i in BField:
        i.visible = showB * (1 - showNeighboringWaves * (i.nbw % 2))

def toggle_show_neighbouring_waves(event):
    global showNeighboringWaves
    for i in arange(0, len(EField)):
        EField[i].visible = 1 - showNeighboringWaves * (EField[i].nbw % 2)
        BField[i].visible = 1 - showNeighboringWaves * (BField[i].nbw % 2)
    showNeighboringWaves += 1
    showNeighboringWaves %= 2

def toggle_show_gauss(event):
    global  showGauss
    print("Ik kom hier", showGauss)
    showGauss += 1
    showGauss %= 3
    for i in GYflux + GZflux:
        i.visible = (showGauss == 1)
    for i in GSegFlux:
        i.visible = (showGauss == 2)
    for i in GXflux:
        i.visible = (showGauss > 0)
    if showGauss == 1:
        GXflux[0].pos = GXflux[0].pos1
        GXflux[1].pos = GXflux[1].pos1
    else:
        GXflux[0].pos = GXflux[0].pos2
        GXflux[1].pos = GXflux[1].pos2

def toggle_color_scheme(event):
    global colorScheme
    colorScheme = 0 if event.checked else 1
    animation.background = colorBackground[colorScheme]
    dEdtlabel.background = labelABackground[colorScheme]
    dBdtlabel.background = labelFBackground[colorScheme]
    dEdtlabel.opacity = labelAOpacity[colorScheme]
    dBdtlabel.opacity = labelFOpacity[colorScheme]
    ddtcolor[0] = Bcolor[2 + colorScheme]
    ddtcolor[1] = Ecolor[2 + colorScheme]

    FaradayLoop.color = ddtcolor[0]
    dBdt.color = ddtcolor[0]
    dBdtlabel.color = Bcolor[2]  # using ddtcolor[1] will have darker text
    AmpereLoop.color = ddtcolor[1]
    dEdt.color = ddtcolor[1]
    dEdtlabel.color = Ecolor[2]  # using ddtcolor[0] will have darker text

    FRONT.color = Frontcolor[colorScheme]
    FRONT2.color = Frontcolor[colorScheme]

    animation.ambient = vector(1, 1, 1) - vector(animation.ambient)

def toggle_run(event):
    pass

def toggle_faraday(event):
    FaradayLoop.visible = dBdt.visible = event.checked
    dBdtlabel.visible = faraday_checkbox.checked and verbose
    if event.checked:
        EField[S + fi - 1].color = ddtcolor[1]
        EField[S + fi + 1].color = ddtcolor[1]
    else:
        EField[S + fi - 1].color = Ecolor[dimFields]
        EField[S + fi + 1].color = Ecolor[dimFields]


def toggle_ampere(event):
    AmpereLoop.visible = dEdt.visible = event.checked
    dEdtlabel.visible = ampere_checkbox.checked and verbose
    if event.checked:
        BField[S + fi - 1].color = ddtcolor[0]
        BField[S + fi + 1].color = ddtcolor[0]
    else:
        BField[S + fi - 1].color = Bcolor[dimFields]
        BField[S + fi + 1].color = Bcolor[dimFields]

ampere_checkbox = checkbox(text="Show Ampere ", bind=toggle_ampere, checked=True)
faraday_checkbox = checkbox(text="Show Faraday ", bind=toggle_faraday, checked=True)
pause_checkbox = checkbox(text="Pause ", bind=toggle_run, checked=False)
dark_background_checkbox = checkbox(text="Dark background", bind=toggle_color_scheme, checked=True)
animation.append_to_caption("\n\n")
show_gauss_button = button(text="Show Gauss", bind=toggle_show_gauss)

phase0 = wavelength / 4.
fi = 0
while 1:
    rate(60)

    newfi = int(animation.mouse.pos.x)
    newfi = max(min(newfi, S - 2), -(S - 2))

    phase = k * (newfi - S) - omega * t
    if fi != newfi:  # MOVE THE LOOPS
        EField[S + fi - 1].color = EField[S + fi + 1].color = Ecolor[dimFields]
        BField[S + fi - 1].color = BField[S + fi + 1].color = Bcolor[dimFields]

        if highlightField == 1:
            if faraday_checkbox.checked: BField[S + fi].color = Bcolor[dimFields]
            if ampere_checkbox.checked:  EField[S + fi].color = Ecolor[dimFields]
        fi = newfi
        if faraday_checkbox.checked: EField[S + fi - 1].color = EField[S + fi + 1].color = ddtcolor[0]
        if ampere_checkbox.checked:  BField[S + fi - 1].color = BField[S + fi + 1].color = ddtcolor[1]

        if highlightField == 1 and faraday_checkbox.checked: BField[S + fi].color = Bcolor[0]
        if highlightField == 1 and ampere_checkbox.checked:  EField[S + fi].color = Ecolor[0]

        FaradayLoop.modify(0, x=fi - 1)
        FaradayLoop.modify(1, x=fi - 1)
        FaradayLoop.modify(2, x=fi + 1)
        FaradayLoop.modify(3, x=fi + 1)
        FaradayLoop.modify(4, x=fi - 1)

        AmpereLoop.modify(0, x=fi - 1)
        AmpereLoop.modify(1, x=fi - 1)
        AmpereLoop.modify(2, x=fi + 1)
        AmpereLoop.modify(3, x=fi + 1)
        AmpereLoop.modify(4, x=fi - 1)

        # for i in arange(0,len(gaussPos)):
        #    gaussPos0[i][0] +=(newfi-fi)
        #    gaussPos1[i][0] +=(newfi-fi)

    # UPDATE THE FIELDS
    for i in arange(0, len(EField)):
        amp = Emax * sin(k * (i % (2 * S) - S) - omega * t)
        EField[i].axis.y = amp
        BField[i].axis.z = amp
    #        print (i%(2*S)-S), EField[i].pos[0]

    # UPDATE THE FLUX

    if showGauss > 0:
        if showGauss == 2:
            for s in [0, 1]:
                i = 0
                for x in arange(0, gxsize):
                    amp = sin(k * (x + gposx + gxleft) - omega * t)
                    # print(x+ gposx+gxleft,GYfSeg[i][0].pos)
                    #
                    # TODO Quads don't have opacity, so move this operation to the vertices instead
                    #
                    # GYfSeg[s * gxsize + i][0].opacity = abs(amp)
                    # GYfSeg[s * gxsize + i][1].opacity = abs(amp)
                    # GZfSeg[s * gxsize + i][0].opacity = abs(amp)
                    # GZfSeg[s * gxsize + i][1].opacity = abs(amp)
                    if (1 - 2 * s) * amp > 0:
                        GYfSeg[s * gxsize + i][0].color = Ecolor[0]
                        GYfSeg[s * gxsize + i][1].color = Ecolor[0]
                        GZfSeg[s * gxsize + i][0].color = Bcolor[0]
                        GZfSeg[s * gxsize + i][1].color = Bcolor[0]
                    else:
                        GYfSeg[s * gxsize + i][0].color = Ecolor[1]
                        GYfSeg[s * gxsize + i][1].color = Ecolor[1]
                        GZfSeg[s * gxsize + i][0].color = Bcolor[1]
                        GZfSeg[s * gxsize + i][1].color = Bcolor[1]

                    i += 1
        else:
            for x in arange(0, gxsize):
                amp = sin(k * (x + gposx + gxleft) - omega * t)

                ###
                GYflux[0 + 2 * x].opacity = abs(amp)
                if amp > 0:
                    GYflux[0 + 2 * x].color = Ecolor[0]
                else:
                    GYflux[0 + 2 * x].color = Ecolor[1]

                GYflux[1 + 2 * x].opacity = abs(amp)
                if (-amp) > 0:
                    GYflux[1 + 2 * x].color = Ecolor[0]
                else:
                    GYflux[1 + 2 * x].color = Ecolor[1]

                ###
                GZflux[0 + 2 * x].opacity = abs(amp)
                if amp > 0:
                    GZflux[0 + 2 * x].color = Bcolor[0]
                else:
                    GZflux[0 + 2 * x].color = Bcolor[1]

                GZflux[1 + 2 * x].opacity = abs(amp)
                if (-amp) > 0:
                    GZflux[1 + 2 * x].color = Bcolor[0]
                else:
                    GZflux[1 + 2 * x].color = Bcolor[1]

    ####################################################################################
    ####################################################################################

    FRONT.pos = vec((phase0 + (omega / k) * t) % (2 * S) - S, 0, 0)
    FRONT2.pos = vec((phase0 + wavelength + (omega / k) * t) % (2 * S) - S, 0, 0)

    ###############################################################
    ###############################################################

    # FARADAY & AMPERE

    # UPDATE THE dB/dt
    dBdt.axis.z = magnify * omega * Emax * abs(cos(phase)) * -sign(
        dot(EField[S + newfi + 1].axis - EField[S + newfi - 1].axis, vector(0, 1, 0)))
    dBdtlabel.text = prefixFaraday[verbose]
    if dot(dBdt.axis, BField[S + newfi].axis) > 0:
        dBdtlabel.text += dBdtpos_text[calculus]
        dBdt.pos = vector(newfi, 0, BField[S + newfi].axis.z) + 0 * label_epsV
    elif dot(dBdt.axis, BField[S + newfi].axis) < 0:
        dBdtlabel.text += dBdtneg_text[calculus]
        dBdt.pos = vector(newfi, 0, BField[S + newfi].axis.z - dBdt.axis.z) + 0 * label_epsV
    else:
        dBdtlabel.text += dBdtzer_text[calculus]
        dBdt.pos = vector(newfi, 0, BField[S + newfi].axis.z)
    dBdtlabel.pos = BField[S + newfi].pos + BField[S + newfi].axis + 0 * label_epsV

    # UPDATE THE dE/dt
    dEdt.axis.y = magnify * omega * Emax * abs(cos(phase)) * sign(
        dot(BField[S + newfi + 1].axis - BField[S + newfi - 1].axis, vector(0, 0, -1)))
    dEdtlabel.text = prefixAmpere[verbose]
    if dot(dEdt.axis, EField[S + newfi].axis) > 0:
        dEdtlabel.text += dEdtpos_text[calculus]
        dEdt.pos = vector(newfi, EField[S + newfi].axis.y, 0)
    elif dot(dEdt.axis, EField[S + newfi].axis) < 0:
        dEdtlabel.text += dEdtneg_text[calculus]
        dEdt.pos = vector(newfi, EField[S + newfi].axis.y - dEdt.axis.y, 0)
    else:
        dEdtlabel.text += dEdtzer_text[calculus]
        dEdt.pos = vector(newfi, EField[S + newfi].axis.y, 0)
    dEdtlabel.pos = EField[S + newfi].pos + EField[S + newfi].axis

    if not pause_checkbox.checked:
        t += 0.1




