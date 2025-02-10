from vpython import sphere, vector, cylinder, canvas, rate, cos, random, sin, color, vec, pi, button, slider, acos, curve, label

title="""&#x2022; Original code by Byron Philhour
&#x2022; Refactored by <a href="https://www.hendrikse.name/">Zeger Hendrikse</a> to <a href="https://github.com/zhendrikse/science/blob/main/thermodynamics/code/piston.py">piston.py</a>

"""

tube_length = 0.15  # size scale of system in meters
lid_length = tube_length / 40
animation = canvas(title=title, range = 25 * lid_length, background=color.gray(0.075))

tube_radius = tube_length / 10
tube = cylinder(radius=tube_radius + tube_length / 200, axis=vec(0, tube_length, 0), pos=vec(0, -tube_length / 2, 0), opacity=0.2)

crest = 0.99  # coefficient of restitution

class Lid:
    def __init__(self, position, frequency, lid_radius=tube_radius, length=lid_length):
        self._lid = cylinder(radius=lid_radius, axis=vec(0, length, 0), pos=position, color=color.cyan)
        self._frequency = frequency
        self._amplitude = 3 * length
        self._velocity = vec(0, 0, 0)
        self._freqText = label(text='Freq: ' + str(frequency) + " Hz", pos=vec(3 * tube_radius, tube_radius, 0),
                               box=False, align='left')
        self._ampText = label(text='Amplitude: ' + str(self._amplitude * 100) + ' cm',
                              pos=vec(3 * tube_radius, -tube_radius, 0), box=False, align='left')

    def update_with(self, t):
        self._lid.pos.y = (tube_length / 2 - self.length() - self._amplitude) + self._amplitude * sin(2 * pi * t * self._frequency)
        self._velocity = vec(0, 2 * pi * self._frequency * self._amplitude * cos(2 * pi * t * self._frequency), 0)
        self._freqText.text = 'Freq: ' + str(self._frequency) + ' Hz'
        self._ampText.text = 'Amplitude: ' + str(round(1000 * self._amplitude) / 10) + ' cm'

    def set_frequency_to(self, new_value):
        self._frequency = new_value

    def velocity(self):
        return self._velocity

    def pos(self):
        return self._lid.pos

    def radius(self):
        return self._lid.radius

    def length(self):
        return self._lid.axis.y

    def set_amplitude_to(self, value):
        self._amplitude = value


class Atom:
    def __init__(self, radius, initial_speed_meter_sec=550):
        angle = 2 * pi * random()
        pos = vector(tube_radius * cos(angle) * random(), (tube_length / 2) - tube_length * random(), tube_radius * sin(angle) * random())
        atom = sphere(pos=pos, radius=radius, color=vector.random())
        #self._mass = 0.1  # in kg
        self._velocity = initial_speed_meter_sec * vector.random()
        self._atom = atom
        self._has_collided = False

    def reset(self):
        self._has_collided = False

    def has_collided(self):
        return self._has_collided

    def update_by(self, dt):
        self._atom.pos += self._velocity * dt

    def bounce_when_arrived_at(self, distance):
        if self._atom.pos.y < -distance:
            self._velocity.y = - crest * self._velocity.y
            self._atom.pos.y = -distance

    def bounce_when_arrived_at_side(self):
        r = vec(self._atom.pos.x, 0, self._atom.pos.z)
        if r.mag + self.radius() > tube_radius:
            velocity = vec(self._velocity.x, 0, self._velocity.z)
            theta = acos(r.dot(velocity) / (r.mag * velocity.mag))
            self._velocity = crest * self._velocity.rotate(angle=pi - 2 * theta, axis=vec(0, 1, 0))
            self._atom.pos = (tube_radius - self.radius()) * r.norm() + vec(0, self._atom.pos.y, 0)

    def bounce_when_arrived_at_lid(self, lid):
        # lid (treat as elastic with infinite lid mass)
        if self._atom.pos.y + self.radius() > (lid.pos().y - lid.length() / 2):
            self._velocity = 2 * lid.velocity() - self._velocity
            self._atom.pos.y = lid.pos().y - lid.length() / 2 - self.radius()

    def handle_collision_when_collided_with(self, other_atom):
        sep = self._atom.pos - other_atom.pos()
        size_multiplier = 1.0  # multiply above for actual radius in particle-particle collisions
        if sep.mag < size_multiplier * 2.0 * self.radius():  # two atoms overlapping
            v_rel = (self._velocity - other_atom.velocity()).dot(sep.norm())
            self._velocity -= v_rel * sep.norm()
            other_atom._velocity += v_rel * sep.norm()
            self._atom._has_collided = True
            other_atom._has_collided = True

    def pos(self):
        return self._atom.pos

    def velocity(self):
        return self._velocity

    def radius(self):
        return self._atom.radius


class Gas:
    def __init__(self, atom_radius=tube_length / 200, atom_count=350):
        self._atoms = []
        for i in range(atom_count):
            self._atoms.append(Atom(atom_radius))

    def update_by(self, dt, lid):
        for atom in self._atoms:
            atom.reset()

        for i in range(len(self._atoms)):
            atom = self._atoms[i]
            atom.bounce_when_arrived_at(tube_length / 2)
            atom.bounce_when_arrived_at_side()
            atom.bounce_when_arrived_at_lid(lid)

            # check for collisions with other (equal mass) atoms
            for j in range(len(self._atoms)):
                if j == i or self._atoms[j].has_collided() or atom.has_collided():
                    continue
                atom.handle_collision_when_collided_with(self._atoms[j])

        for atom in self._atoms:
            atom.update_by(dt)

    def position_bins_with(self, bin_amount, seg):
        bins = [0 for j in range(bin_amount)]
        for jj in range(bin_amount):
            bins[jj] = 0
            for ii in range(len(self._atoms)):
                if ((tube_length / 2) - (jj + 1) * seg) < self._atoms[ii].pos().y < ((tube_length / 2) - jj * seg):
                    bins[jj] += 1
        return bins

    def num_atoms(self):
        return len(self._atoms)


gas = Gas()
tube_lid = Lid(vec(0, tube_length / 2, 0), 4000)
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

def set_frequency(event):
    tube_lid.set_frequency_to(event.value)

def set_amplitude(event):
    tube_lid.set_amplitude_to(event.value)

running = True
pause = button(text='Pause', bind=toggle_running)

animation.append_to_caption('\n\nPiston frequency\n')
_ = slider(min=0, max=30000, value=4000, bind=set_frequency)
animation.append_to_caption('\n\nPiston amplitude\n')
_ = slider(min=0, max=4 * lid_length, value=2 * lid_length, bind=set_amplitude)
animation.append_to_caption('\n\nGraph bins\n')

num_bins = 50
def adjust_binning(event):
    global num_bins
    num_bins = int(event.value)

_ = slider(min=2, max=100, value=50, bind=adjust_binning)

def update_graph():
    seg = tube_length / num_bins
    position_bins = gas.position_bins_with(num_bins, seg)
    average = 0
    for bin_ in position_bins:
        average += bin_
    average /= num_bins

    graphAxis.clear()
    graphAxis.append(pos=vec(-3 * tube_lid.radius() - average / gas.num_atoms(), tube_length / 2, 0))
    graphAxis.append(pos=vec(-3 * tube_lid.radius() - average / gas.num_atoms(), -tube_length / 2, 0))
    graphLabel.pos = vec(-3 * tube_lid.radius() - average / gas.num_atoms(), (tube_length / 2) + lid_length, 0)

    for k in range(num_bins):
        curve_.append(pos=vec(-3 * tube_lid.radius() - ((position_bins[k]) / gas.num_atoms()), (tube_length / 2) - k * seg, 0))

delta_t = 2e-6
time = 0
while True:
    rate(1 / delta_t)
    if not running: continue

    tube_lid.update_with(time)
    gas.update_by(delta_t, tube_lid)
    curve_.clear()
    update_graph()

    time += delta_t

