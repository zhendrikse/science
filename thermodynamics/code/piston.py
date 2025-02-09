from vpython import sphere, vector, cylinder, canvas, rate, cos, random, sin, color, vec, pi, button, slider, acos, curve, label

title="""&#x2022; Original code by Byron Philhour
&#x2022; Refactored by <a href="https://www.hendrikse.name/">Zeger Hendrikse</a>

"""

tube_length = 0.15  # size scale of system in meters
lid_length = tube_length / 40
animation = canvas(title=title, range = 25 * lid_length, color=color.gray(0.075))

num = 350  # number of molecules / atoms
crest = 0.99  # coefficient of restitution

# create container # T stands for Tube
tube_radius = tube_length / 10
tube = cylinder(radius=tube_radius + tube_length / 200, axis=vec(0, tube_length, 0), pos=vec(0, -tube_length / 2, 0), opacity=0.2)

# create lid # L stands for Lid
lid_radius = tube_radius
lid = cylinder(radius=lid_radius, axis=vec(0, lid_length, 0), pos=vec(0, tube_length / 2, 0), color=color.cyan)
amplitude = 3 * lid_length
freq = 4000
speed = 550  # initial speeds in m/s

atomR = tube_length / 200  # visual radius of atoms
sizeMult = 1.0  # multiply above for actual radius in particle-particle collisions

class Atom:
    def __init__(self, radius):
        angle = 2 * pi * random()
        pos = vector(tube_radius * cos(angle) * random(), (tube_length / 2) - tube_length * random(), tube_radius * sin(angle) * random())
        atom = sphere(pos=pos, radius=radius, color=vector.random())
        #self._mass = 0.1  # in kg
        self._velocity = speed * vector.random()
        self._atom = atom
        self._has_collided = False

    def reset(self):
        self._has_collided = False

    def has_collided(self):
        return self._has_collided

    def update_by(self, dt):
        self._atom.pos += self._velocity * dt

    def when_at_bottom_then_bounce_by(self, distance):
        if self._atom.pos.y < -distance:
            self._velocity.y = - crest * self._velocity.y
            self._atom.pos.y = -distance

    def when_at_side_then_bounce(self):
        r = vec(self._atom.pos.x, 0, self._atom.pos.z)
        if r.mag + atomR > tube_radius:
            velocity = vec(self._velocity.x, 0, self._velocity.z)
            theta = acos(r.dot(velocity) / (r.mag * velocity.mag))
            self._velocity = crest * self._velocity.rotate(angle=pi - 2 * theta, axis=vec(0, 1, 0))
            self._atom.pos = (tube_radius - atomR) * r.norm() + vec(0, self._atom.pos.y, 0)

    def when_at_lid_then_bounce(self):
        # lid (treat as elastic with infinite lid mass)
        if self._atom.pos.y + atomR > (lid.pos.y - lid_length / 2):
            self._velocity = 2 * lid.vel - self._velocity
            self._atom.pos.y = lid.pos.y - lid_length / 2 - self._atom.radius

    def handle_collision_when_collided_with(self, other_atom):
        sep = self._atom.pos - other_atom.pos()
        if sep.mag < sizeMult * 2.0 * atomR:  # two atoms overlapping
            v_rel = (self._velocity - other_atom.velocity()).dot(sep.norm())
            self._velocity -= v_rel * sep.norm()
            other_atom._velocity += v_rel * sep.norm()
            self._atom._has_collided = True
            other_atom._has_collided = True

    def pos(self):
        return self._atom.pos

    def velocity(self):
        return self._velocity


class Gas:
    def __init__(self, atom_radius=tube_length / 200, atom_count=350):
        self._atoms = []
        for i in range(atom_count):
            self._atoms.append(Atom(atom_radius))

    def update_by(self, dt):
        for atom in self._atoms:
            atom.reset()

        for i in range(len(self._atoms)):
            atom = self._atoms[i]
            atom.when_at_bottom_then_bounce_by(tube_length / 2)
            atom.when_at_side_then_bounce()
            atom.when_at_lid_then_bounce()

            # check for collisions with other (equal mass) atoms
            for j in range(num):
                if j == i or self._atoms[j].has_collided() or atom.has_collided():
                    continue
                atom.handle_collision_when_collided_with(self._atoms[j])

        for atom in self._atoms:
            atom.update_by(dt)

    def position_bins_with(self, bin_amount):
        bins = [0 for j in range(bin_amount)]
        for jj in range(bin_amount):
            bins[jj] = 0
            for ii in range(num):
                if ((tube_length / 2) - (jj + 1) * seg) < self._atoms[ii].pos().y < ((tube_length / 2) - jj * seg):
                    bins[jj] += 1
        return bins


gas = Gas()

curve_ = curve()
graphAxis = curve(color=color.red)
graphLabel = label(text='Density', box=False, height=11)

def toggle_running():
    global running
    if running:
        running = False
        pause.text = 'Resume'
    else:
        running = True
        pause.text = 'Pause'


running = True
pause = button(text='Pause', bind=toggle_running)

def set_frequency(event):
    global freq
    freq = event.value


animation.append_to_caption('\n\nPiston frequency\n')
_ = slider(min=0, max=30000, value=4000, bind=set_frequency)


def set_amplitude(event):
    global amplitude
    amplitude = event.value


animation.append_to_caption('\n\nPiston amplitude\n')
_ = slider(min=0, max=4 * lid_length, value=2 * lid_length, bind=set_amplitude)


animation.append_to_caption('\n\nGraph bins\n')

num_bins = 50
def adjust_binning(event):
    global num_bins
    num_bins = int(event.value)

_ = slider(min=2, max=100, value=50, bind=adjust_binning)

freqText = label(text='Freq: ' + str(freq) + " Hz", pos=vec(3 * tube_radius, tube_radius, 0), box=False, align='left')
ampText = label(text='Amplitude: ' + str(amplitude * 100) + ' cm', pos=vec(3 * tube_radius, -tube_radius, 0), box=False,
                align='left')

delta_t = 2e-6
time = 0
while True:
    rate(1 / delta_t)
    if not running: continue

    freqText.text = 'Freq: ' + str(freq) + ' Hz'
    ampText.text = 'Amplitude: ' + str(round(1000 * amplitude) / 10) + ' cm'

    lid.pos.y = (tube_length / 2 - lid_length - amplitude) + amplitude * sin(2 * pi * time * freq)
    lid.vel = vec(0, 2 * pi * freq * amplitude * cos(2 * pi * time * freq), 0)

    gas.update_by(delta_t)
    seg = tube_length / num_bins
    curve_.clear()
    position_bins = gas.position_bins_with(num_bins)
    average = 0
    for bin_ in position_bins:
        average += bin_
    average /= num_bins

    graphAxis.clear()
    graphAxis.append(pos=vec(-3 * lid_radius - average / num, tube_length / 2, 0))
    graphAxis.append(pos=vec(-3 * lid_radius - average / num, -tube_length / 2, 0))
    graphLabel.pos = vec(-3 * lid_radius - average / num, (tube_length / 2) + lid_length, 0)

    for k in range(num_bins):
        curve_.append(pos=vec(-3 * lid_radius - ((position_bins[k]) / num), (tube_length / 2) - k * seg, 0))

    time += delta_t

