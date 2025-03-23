#Web VPython 3.2

""" From "COMPUTATIONAL PHYSICS" & "COMPUTER PROBLEMS in PHYSICS"
    by RH Landau, MJ Paez, and CC Bordeianu (deceased)
    Copyright R Landau, Oregon State Unv, MJ Paez, Univ Antioquia, 
    C Bordeianu, Univ Bucharest, 2018. 
    Please respect copyright & acknowledge our work."""

from vpython import vec, color, curve, label, cos, box, canvas, pi, rate

title = """A plane wave with wavelength $\\lambda$ strikes a thin film an angle $\\theta_i$ with the normal. 
The film has refractive index $n$ and thickness $a$.   
The phase difference between the rays reflected from the first and second surfaces is:
$$\\begin{equation}\\delta= \\frac{4\\pi a n \\cos(\\theta_i)}{\\lambda} +\\pi.\\end{equation}$$
There is additional interference from rays reflected inside the film at the first surface:
$$\\begin{equation}\\delta = \\frac{4\\pi a n \\cos(\\theta_i)}{\\lambda}.\\end{equation}$$
The program shows a color plot of the intensity of a given wavelength.

&#x2022; Based on <a href="https://sites.science.oregonstate.edu/~landaur/Books/Problems/Codes/JupyterNB/ThinFilmVP.ipynb">Thin film interference by reflection</a> (AJP 72,1248-1253)
&#x2022; From <a href="https://books.google.nl/books/about/Computational_Problems_for_Physics.html?id=g9tdDwAAQBAJ">Computational Problems for Physics</a> by RH Landau, MJ Paez, and CC Bordeianu.
&#x2022; Refactored by <a href="https://www.hendrikse.name/">Zeger Hendrikse</a> in <a href="https://github.com/zhendrikse/science/blob/main/optics/code/thin_film.py">thin_film.py</a>

"""

display = canvas(width=600, height=600, range=400, background=color.gray(0.075), title=title)

red_curve = curve(color=color.red)
green_curve = curve(color=color.green)
blue_curve = curve(color=color.blue)

title = label(pos=vec(-20, 350, 0), text='Intensity vs Thickness nA in nm', box=False)
waves = label(pos=vec(-30, 320, 0), text='Red, Green, and Blue Intensities', box=False)
trans = label(pos=vec(-280, 300, 0), text='Transmission', box=False)
refl = label(pos=vec(210, 300, 0), text='Reflection', box=False)

lambda_red = 572  # red in nm
lambda_blue = 430  # Blue
lambda_green = 540  # Green

i = 0
film = curve(pos=[vec(-150, -250, 0), vec(150, -250, 0), vec(150, 250, 0),
                  vec(-150, 250, 0), vec(-150, -250, 0)])  # rectangle

N = 1250
phase_shift_red = [0. for _ in range(N)]
phase_shift_green = [0. for _ in range(N)]
phase_shift_blue = [0. for _ in range(N)]
intensity_red = [0. for _ in range(N)]
intensity_green = [0. for _ in range(N)]
intensity_blue = [0. for _ in range(N)]
xrp = [0. for _ in range(N)]  # linear transformation for red
xbp = [0. for _ in range(N)]  # linear transformation for blue
xgp = [0. for _ in range(N)]  # linear transformation for green
ap = [0. for _ in range(N)]  # film height
transmission_phase_shift_red = [0. for _ in range(N)]
transmission_phase_shift_green = [0. for _ in range(N)]
transmission_phase_shift_blue = [0. for _ in range(N)]
intensity_red_transmitted = [0. for _ in range(N)]
intensity_green_transmitted = [0. for _ in range(N)]
intensity_blue_transmitted = [0. for _ in range(N)]
intensity_reflexion_red = [0. for _ in range(N // 10)]
intensity_reflexion_green = [0. for _ in range(N // 10)]
intensity_reflexion_blue = [0. for _ in range(N // 10)]
intensity_transmission_red = [0. for _ in range(N // 10)]
intensity_transmission_green = [0. for _ in range(N // 10)]
intensity_transmission_blue = [0. for _ in range(N // 10)]
kk = 0

for j in range(0, N, 10):
    phase_shift_red[j] = 4 * pi * j / lambda_red + pi
    phase_shift_green[j] = 4 * pi * j / lambda_green + pi
    phase_shift_blue[j] = 4 * pi * j / lambda_blue + pi
    intensity_red[j] = (cos(phase_shift_red[j] / 2)) ** 2
    intensity_green[j] = (cos(phase_shift_green[j] / 2)) ** 2
    intensity_blue[j] = (cos(phase_shift_blue[j] / 2)) ** 2
    if j % 10 == 0:  # intensities every 10 steps
        intensity_reflexion_red[kk] = intensity_red[j]
        intensity_reflexion_green[kk] = intensity_green[j]
        intensity_reflexion_blue[kk] = intensity_blue[j]
        kk += 1
jj = 0
for nA in range(0, N, 10):
    # for REFLECTION INTERFERENCE
    ap[nA] = -500 * nA / 1240 + 250  # film height
    xrp[nA] = 300 * intensity_red[nA] - 150
    xbp[nA] = 300 * intensity_blue[nA] - 150
    xgp[nA] = 300 * intensity_green[nA] - 150  # Linear TFs = -500*nA/1240 +250
    red_curve.append(pos=vec(xrp[nA], ap[nA], 0))
    green_curve.append(pos=vec(xgp[nA], ap[nA], 0))
    blue_curve.append(pos=vec(xbp[nA], ap[nA], 0))
    # FOR TRANSMISSION INTERFERENCE
    transmission_phase_shift_red[nA] = 4 * pi * nA / lambda_red
    transmission_phase_shift_green[nA] = 4 * pi * nA / lambda_green
    transmission_phase_shift_blue[nA] = 4 * pi * nA / lambda_blue
    intensity_red_transmitted[nA] = cos(transmission_phase_shift_red[nA] / 2) ** 2
    intensity_green_transmitted[nA] = cos(transmission_phase_shift_green[nA] / 2) ** 2
    intensity_blue_transmitted[nA] = cos(transmission_phase_shift_blue[nA] / 2) ** 2
    if nA % 10 == 0:  # intensities for transmission every 10 steps
        intensity_transmission_red[jj] = intensity_red_transmitted[nA]
        intensity_transmission_green[jj] = intensity_green_transmitted[nA]
        intensity_transmission_blue[jj] = intensity_blue_transmitted[nA]
        jj += 1

for nA in range(0, 125):  # to plot 125 boxes
    col = vec(intensity_reflexion_red[nA], intensity_reflexion_green[nA], intensity_reflexion_blue[nA])
    reflesc = -500 * nA / 125 + 250  # 250=m 0 +b, -250 =m 125 +b
    box(pos=vec(205, reflesc, 0), width=0.1, height=10, length=50, color=col)
    colt = (vec(intensity_transmission_red[nA], intensity_transmission_green[nA], intensity_transmission_blue[nA]))  # transmission colors
    # if you uncomment next line and comment ´previous ne you have white colors
    # it sums interference by reflection and by transmission intensities
    # colt = vec(INRET[nA]+INRE[nA],INGET[nA]+INGE[nA],INBET[nA]+INBE[nA])   # Colors by transmission
    box(pos=vec(-270, reflesc, 0), width=0.1, height=10, length=50, color=colt)
    if nA % 20 == 0:  # Labels for vertical axis
        prof = nA * 10
        escal = -500 * nA / 125 + 250
        depth = label(pos=vec(-200, escal, 0), text=str(prof), box=False, color=color.white)

MathJax.Hub.Queue(["Typeset", MathJax.Hub])
while True:
    rate(10)
