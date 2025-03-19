from vpython import canvas, vector, color, sqrt, ring, sphere, rate, vec, label, cylinder, slider, mag, gcurve, graph

title = """&#x2022; Original <a href="https://trinket.io/glowscript/bd28780444?showInstructions=true">code</a> by Andrew Morrison (@achmorrison), 3/20/18
&#x2022; Updated by <a href="https://www.hendrikse.name/">Zeger Hendrikse</a> to <a href="https://github.com/zhendrikse/science/blob/main/waves/code/doppler_waves.py">doppler_waves.py</a>

"""

# CHANGE THE VELOCITY OF THE WAVE SOURCE HERE
e_horiz_v = 0.50
e_vert_v = 0.0

# CHANGE THE POSITION OF THE OBSERVER HERE
obs_pos_x = -2.5
obs_pos_y = -2.

# CHANGE THE INITIAL POSITION OF THE WAVE SOURCE HERE
e_init_pos_x = 1
e_init_pos_y = 2

source_frequency = 1.0
wave_speed = 1.0

display = canvas(title=title,
               width=600, height=300, range=12,
               center=vector(0, 0, 0), background=color.gray(0.075))

measured_time = 0.0
measured_frequency = 0.0
velocity_source = vector(e_horiz_v, e_vert_v, 0)  # velocity of the moving wave source; can set to zero for stationary source

class Person:
    def __init__(self, position, size=1, colour=color.green):
        self._size = size
        self._head = sphere(radius=0.07 * size, color=color.yellow)
        self._body = cylinder(axis=size * vector(0, -0.3, 0), radius=0.03 * size, color=colour)
        self._arm_a = cylinder(axis=size * vector(-0.15, -0.15, 0), radius=0.02 * size, color=colour)
        self._arm_b = cylinder(axis=size * vector(0.15, -0.15, 0), radius=0.02 * size, color=colour)
        self._leg_a = cylinder(axis=size * vector(0.1, -0.15, 0), radius=0.02 * size, color=colour)
        self._leg_b = cylinder(axis=size * vector(-0.1, -0.15, 0), radius=0.02 * size, color=colour)

        self._position = position
        self._update_body_parts()

    def _update_body_parts(self):
        size = self._size
        position = self._position + vec(0.1, 0, 0) * size
        self._head.pos = position + vector(-0.1, 0.5, 0.0) * size
        self._body.pos = self._head.pos
        self._arm_a.pos=self._head.pos + vector(0, -0.1, 0) * size
        self._arm_b.pos=self._head.pos + vector(0, -0.1, 0) * size
        self._leg_a.pos=self._head.pos + self._body.axis
        self._leg_b.pos=self._head.pos + self._body.axis

    def update(self, position_x):
        self._position = vec(position_x, obs_pos_y, 0)
        self._update_body_parts()

    def head_pos(self):
        return self._head.pos

    def position(self):
        return self._position

def set_scene(observer_position):
    observer_ = Person(observer_position, size=4)
    observer_info_ = label(pos=observer_.head_pos() + vec(-1.5, 0.5, 0), text=str(measured_frequency), height=12, color=color.white, box=False)

    num = 100  # number of wave fronts to plot
    wave_fronts_ = []
    for i in range(num):
        wave_fronts_.append(ring(pos=vec(e_init_pos_x, e_init_pos_y, 0), color=color.cyan, axis=vector(0, 0, 1), radius=0, thickness=0.05))
        #wavefronts_.append(sphere(pos=vec(e_init_pos_x, e_init_pos_y, 0), axis=vector(0, 0, 1), color=color.gray(0.5), opacity=0.2))

    return observer_, observer_info_, wave_fronts_

observer, observer_info, wave_fronts = set_scene(vector(obs_pos_x, obs_pos_y, 0))

def modify_frequency(event):
    global source_frequency
    source_frequency = event.value

def modify_velocity(event):
    global wave_speed
    wave_speed = event.value

def modify_position_observer(event):
    observer.update(event.value)
    observer_info.pos=observer.head_pos() + vec(-1.5, 0.5, 0)

def modify_source_velocity(event):
    global velocity_source
    velocity_source = vector(event.value, e_vert_v, 0)


def reset(observer_position):
    global observer, observer_info, wave_fronts
    for obj in display.objects:
        obj.visible = False
    observer, observer_info, wave_fronts = set_scene(observer_position)
    observed_frequency_curve.delete()
    frequency_curve.delete()

display.append_to_caption("\nFrequency:")
_ = slider(min=.1, max=2, value=1, bind=modify_frequency)

display.append_to_caption("\n\nSource velocity:")
_ = slider(min=0, max=1, value=e_horiz_v, bind=modify_source_velocity)

display.append_to_caption("\n\nSound velocity:")
_ = slider(min=.1, max=2, value=1, bind=modify_velocity)

display.append_to_caption("\n\nPosition observer:")
_ = slider(min=-10, max=10, value=obs_pos_x, bind=modify_position_observer)

display.append_to_caption("\n\n")
observed_frequency_graph = graph(xtitle="Time", ytitle="Frequency", width=600, height=300, title="Observed vs. emitted frequency", background=color.black)
observed_frequency_curve = gcurve(color=color.yellow)
frequency_curve = gcurve(color=color.cyan)

while True:
    t = 0.0
    dt = 0.01
    observed_wave_count = 0
    while t < 30:
        rate(1/dt)

        index = 0
        for wave_front in wave_fronts:
            # This section emits another wavefront after each period has passed.
            if t < (1 / source_frequency) * index:
                wave_front.visible = False
                # This line updates the emitter's position.
                wave_front.pos += velocity_source * dt
            else:
                wave_front.visible = True
                # Make the wavefront grow larger with time.
                wave_front.radius += wave_speed * dt

            # Put the observed frequency counter routine here
            if round(100 * sqrt((wave_front.pos.x - observer.head_pos().x) ** 2 + (wave_front.pos.y - observer.head_pos().y) ** 2)) / 100 == round(100 * wave_front.radius) / 100:
                T = abs(measured_time - t)
                measured_time = t
                measured_frequency = measured_frequency if T == 0 else round(1 / T, 2)
                observed_wave_count += 1
                # print("n = ",i,"emitter pos = ",wave_front.pos.x,"emit.pos to obs.pos = ",round(1000*sqrt((wave_front.pos.x-counter.pos.x)**2+(wave_front.pos.y-counter.pos.y)**2))/1000,"time = ",t," wave_fronts[i].radius = ",wave_fronts[i].radius)
                # print("n = ",i,"emitter pos = ",wave_front.pos.x,"time = ",t," freq_meas = ",freq_meas," freq_calc = ",freq_calc)
            # print("i= ",i,"wave_front.radius = ", wave_front.radius)
            index += 1

        observer_info.pos = observer.head_pos() + vec(-1.5, 0.5, 0)
        if observed_wave_count > 1:
            # ignore the frequency calculation after just one wave has passed - it is meaningless
            observer_info.text = str(measured_frequency)
            observed_frequency_curve.plot(measured_time, measured_frequency * 1000)
            frequency_curve.plot(measured_time, (wave_speed / (wave_speed + mag(velocity_source))) * source_frequency * 1000)

        t += dt
    popup = label(text="Click mouse to restart")
    display.waitfor("click")
    reset(observer.position())
    popup.visible = False

# The following section is mostly for testing purposes.
# for i in range(num):
# print(wave_fronts[i].pos.x)
# print("Wavefront position (x) = ",wave_fronts[i].pos.x)
# print("Counter position (x) = ", counter.pos.x)
# print("Wavefront position (y) = ",wave_fronts[i].pos.y)
# print("Counter position (y) = ", counter.pos.y)
# print("Precalc = ",(wave_fronts[i].pos.x-counter.pos.x)**2+(wave_fronts[i].pos.y-counter.pos.y)**2)
# print("Calc = ",round(100*sqrt((wave_fronts[i].pos.x-counter.pos.x)**2+(wave_fronts[i].pos.y-counter.pos.y)**2))/100)
