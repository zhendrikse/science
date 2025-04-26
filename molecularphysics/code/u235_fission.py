#Web VPython 3.2
from vpython import *

title="""&#x2022; Original <a href="https://trinket.io/embed/glowscript/f61cab61ca">code</a> by Byron Philhour
&#x2022; Refactored by <a href="https://www.hendrikse.name/">Zeger Hendrikse</a>, see <a href="https://github.com/zhendrikse/science/blob/main/molecularphysics/code/u235_fission.py">u235_fission.py</a>

&#x2022; <span style="color: green;">Green</span> = oxide ions, <span style="color: blue;">Blue</span> = uranium 238 ions, <span style="color: red;">Red</span> = uranium 235 ions
&#x2022; <span style="color: yellow;">Yellow</span> = reaction product (Ba / Kr), <span style="color: gray(0.5);">Gray</span> = thermal neutron
&#x2022; U235 nuclear collision cross-section exaggerated.
"""

# data
amu = 1.66e-23  # grams per atomic mass unit
nucradius = 15e-15  # nuclear size

# uranium 235
z235 = 92
a235 = 235

# uranium 238
z238 = 92
a238 = 238  # amu per atom

# what fraction is 235?
# frac235 = 0.007 # natural abundance is 0.007
frac235 = 0.035  # enriched is 0.035

# density
aTOT = frac235 * a235 + (1 - frac235) * a238
akg = amu * aTOT  # grams per atom
cubeside = 1.4e-7  # side length in centimeters
volume = (cubeside) ** 3  # cubic centimeters
udensity = 19.3  # grams per cubic centimeter
N = round((udensity / akg) * volume)
sidenum = round(N ** (1 / 3)) * 2
print(N, sidenum)
side = cubeside / sidenum
nucscale = (side / nucradius) / 3

fiverow = True

animation = canvas(title=title, background=color.gray(0.15), range=.4/nucscale)

class UraniumOxideLattice:
    def __init__(self):
        self._nucleus, self._oxide, self._urad, self._flashes, self._products = [], [], [], [], []
        self._nindex = self._oindex = self._remaining = 0
        for x in arange(0, cubeside, side):
            for y in arange(0, cubeside, side):
                for z in arange(0, cubeside, side):
                    self._init_lattice(x, y, z)

        for atom in self._oxide:
            atom.radius = nucradius * nucscale * .7
            atom.color = color.green
        for atom in self._nucleus:
            atom.radius = nucradius * nucscale
            atom.color = color.blue

        # decide which nuclei are radioactive, color them red
        for atom in self._nucleus:
            if random() < frac235:
                atom.color = color.red
                self._urad.append(atom)

        animation.caption = "Radioactive nuclei remaining: " + str(len(self._urad))
        self._remaining = len(self._urad)

        animation.title += "&#x2022; N = " + str(self._nindex + self._oindex) + "\n\n"

    def _init_lattice(self, x, y, z):
        # arrange oxygen and uranium nuclei
        offset = vec(4 * x, 4 * y, 4 * z) - 2 * cubeside * vec(1, 1, 1)
        self._oxide += [sphere(pos=offset)]
        self._oxide += [sphere(pos=offset + vec(4 * side, 0, 0))]
        self._oxide += [sphere(pos=offset + vec(4 * side, 0, 4 * side))]
        self._oxide += [sphere(pos=offset + vec(2 * side, 0, 2 * side))]
        self._oxide += [sphere(pos=offset + vec(0, 0, 4 * side))]
        self._oindex += 5

        self._oxide += [sphere(pos=offset + vec(0, 2 * side, 2 * side))]
        self._oxide += [sphere(pos=offset + vec(2 * side, 2 * side, 0))]
        self._oxide += [sphere(pos=offset + vec(4 * side, 2 * side, 2 * side))]
        self._oxide += [sphere(pos=offset + vec(2 * side, 2 * side, 4 * side))]
        self._oindex += 4

        self._oxide += [sphere(pos=offset + vec(0, 4 * side, 0))]
        self._oxide += [sphere(pos=offset + vec(4 * side, 4 * side, 0))]
        self._oxide += [sphere(pos=offset + vec(2 * side, 4 * side, 2 * side))]
        self._oxide += [sphere(pos=offset + vec(0, 4 * side, 4 * side))]
        self._oindex += 4

        self._nucleus += [sphere(pos=offset + vec(side, side, side))]
        self._nucleus += [sphere(pos=offset + vec(side, 3 * side, side))]
        self._nucleus += [sphere(pos=offset + vec(3 * side, side, side))]
        self._nucleus += [sphere(pos=offset + vec(3 * side, 3 * side, side))]
        self._nucleus += [sphere(pos=offset + vec(side, side, 3 * side))]
        self._nucleus += [sphere(pos=offset + vec(side, 3 * side, 3 * side))]
        self._nucleus += [sphere(pos=offset + vec(3 * side, side, 3 * side))]
        self._nindex += 7

    def _process_collision(self, uranium):
        # print("Boom")
        prodnum = len(self._products)
        if uranium.color.mag == color.red.mag:
            uranium.color = color.yellow
            uranium.visible = False
            self._remaining -= 1
            animation.caption = "\nRadioactive nuclei remaining: " + str(self._remaining)
            self._flashes.append(
                sphere(pos=uranium.pos, radius=nucradius * nucscale * 0.01, color=color.yellow, opacity=0.60))
            self._flashes[-1].vel = 5000 * random() + 5000
            for k in range(2):
                neutrons.append(sphere(pos=uranium.pos, radius=nucradius * nucscale * 0.2,
                                       color=vec(0.8, 0.8, 0.8), make_trail=True, retain=10))
                neutrons[-1].vel = 2200 * vector.random()

            self._products.append(sphere(pos=uranium.pos, radius=nucradius * nucscale, color=color.yellow,
                                   make_trail=False, retain=10))
            self._products[-1].vel = 500 * vector.random()
            self._products.append(sphere(pos=uranium.pos, radius=nucradius * nucscale, color=color.yellow,
                                   make_trail=False, retain=10))
            self._products[-1].vel = - self._products[prodnum].vel

    def collisions_with(self, neutron_):
        for uranium in self._urad:
            if (neutron_.pos - uranium.pos).mag < uranium.radius:
                self._process_collision(uranium)

    def has_remaining_nuclei(self):
        return self._remaining > 0

    def update_products(self, dt):
        for product in self._products:
            product.pos += product.vel * dt
            # product[i].opacity = 1.0 - (product[i].pos.mag / (cubeside))
            if product.pos.mag > 3 * cubeside:
                # product.trail_object.visible = False
                product.visible = False

    def update_flashes(self, dt):
        for flash in self._flashes:
            flash.radius += flash.vel * dt
            flash.opacity = 1.0 - flash.radius / (2 * cubeside)
            if flash.radius > 2 * cubeside:
                flash.visible = False
                flash.vel = 0


neutrons = []
neutrons += [sphere(radius=nucradius * nucscale * 0.2, color=vec(0.8, 0.8, 0.8), make_trail=True, retain=15)]
neutrons[0].vel = 2200 * vector.random()

dt = 1e-12
time = 0
lattice = UraniumOxideLattice()
while lattice.has_remaining_nuclei():
    rate(1000)
    time = time + dt
    for neutron in neutrons:
        if neutron.pos.x > 2 * cubeside or neutron.pos.x < -2 * cubeside: neutron.vel.x = - neutron.vel.x
        if neutron.pos.y > 2 * cubeside or neutron.pos.y < -2 * cubeside: neutron.vel.y = - neutron.vel.y
        if neutron.pos.z > 2 * cubeside or neutron.pos.z < -2 * cubeside: neutron.vel.z = - neutron.vel.z

        lattice.collisions_with(neutron)
        neutron.pos += neutron.vel * dt

    lattice.update_products(dt)
    lattice.update_flashes(dt)

#radiusscale = urad[0].radius / nucradius
#volumescale = radiusscale ** 3
# print("Elapsed time: " + round((time/(pi*1e7))*volumescale) + " years")