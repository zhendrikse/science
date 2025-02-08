#Web VPython 3.2

title = """ 
&#x2022; Original by <a href="https://rhettallain.com/2019/11/12/modeling-a-spinning-sprinkler/">Rhett Allain</a>
&#x2022; Refactored by <a href="https://github.com/zhendrikse/">Zeger Hendrikse</a>

"""

from vpython import vector, vec, sphere, pi, box, rate, cross, cos, sin, color, canvas, pi, slider, wtext, checkbox

animation = canvas(title=title, background = color.gray(0.075))

dt = 0.01
origin = vector(0, 0, 0)

class WaterBeam:
    def __init__(self):
       self._droplets = []

    def add(self, droplet):
       self._droplets += [droplet] 
    
    def update(self, dt, out_of_sight_threshold):
       for droplet in self._droplets:
         droplet.update(dt, out_of_sight_threshold)
       # self._droplets = [droplet.update(dt, out_of_sight_threshold) for droplet in self._droplets]
       # self._droplets = [droplet for droplet in self._droplets if droplet._droplet.visible is True]

class Droplet: 
    def __init__(self, position, velocity, radius):
       self._droplet = sphere(pos=position, radius=radius, color=color.cyan, v=velocity,  make_trail=False)

    def update(self, dt, out_of_sight_threshold):
       self._droplet.pos += self._droplet.v * dt
       if self._droplet.pos.mag > out_of_sight_threshold:
        self._droplet.v = origin
        self._droplet.visible = False
      
       return self

class Sprinkler:
  def __init__(self, length = 0.1):
    self._length = length
    self._omega = pi
    self._shoot_outward = True
    self._frequency = 15
    self._water_velocity = .3

    self._clock_ticks = 0
    self._theta = 0 # Rotation angle of sprinkler

    self._stick = box(pos=origin, size=vector(length, .05 * length, .05 * length), color=color.yellow)
    self._center = sphere(pos=origin, radius=0.03 * length, color=color.red)
    self._space = sphere(pos=vector(4 * length, 0, 0), radius=0.001)

    self._water_beams = [WaterBeam(), WaterBeam()]

  def rotate(self, dt):
    angle = self._omega * dt
    self._theta += angle
    self._stick.rotate(angle=angle, axis=vector(0, 0, 1), origin=origin)

  def shed_water(self, dt):
    if self._clock_ticks >= 1 / self._frequency:
      self._let_out_new_droplet()
      self._clock_ticks = 0

    self._water_beams[0].update(dt, 3 * self._length)
    self._water_beams[1].update(dt, 3 * self._length)

    self._clock_ticks += dt

  def _let_out_new_droplet(self):
    radius = 0.04 * self._length
    self._water_beams[0].add(Droplet(self._endpoint_positions()[0], self._endpoint_velocities()[0], radius))
    self._water_beams[1].add(Droplet(self._endpoint_positions()[1], self._endpoint_velocities()[1], radius))

  def _endpoint_positions(self):
    r = (self._length / 2) * vector(cos(self._theta), sin(self._theta), 0)
    return [r, -r]

  def _endpoint_velocities(self):
    a = 1 if self._shoot_outward else -1
    position_1 = self._endpoint_positions()[0]
    position_2 = self._endpoint_positions()[1]
    velocity_1 = -1 * cross(position_1, vector(0, 0, self._omega)) + a * self._water_velocity * position_1.hat
    velocity_2 = -1 * cross(position_2, vector(0, 0, self._omega)) + a * self._water_velocity * position_2.hat
    return [velocity_1, velocity_2]

  def set_omega_to(self, new_value):
      self._omega = new_value

  def set_droplet_frequency_to(self, new_value):
      self._frequency = new_value

  def set_water_velocity_to(self, value):
      self._water_velocity = value

  def set_shoot_outward_to(self, boolean_value):
      self._shoot_outward = boolean_value


def adjust_omega():
    sprinkler.set_omega_to(omega_slider.value)
    omega_slider_text.text = "{:1.2f}".format(omega_slider.value / pi, 2) + " π"

def adjust_droplet_frequency():
    sprinkler.set_droplet_frequency_to(droplet_frequency_slider.value)
    droplet_frequency_text.text = "{:1.2f}".format(droplet_frequency_slider.value, 2)

def adjust_water_velocity():
    sprinkler.set_water_velocity_to(water_velocity_slider.value)
    water_velocity_text.text = "{:1.2f}".format(water_velocity_slider.value, 2)

def toggle_shoot_outward(event):
    sprinkler.set_shoot_outward_to(event.checked)

animation.append_to_caption("\n")
_ = checkbox(text="Shoot outward ", bind=toggle_shoot_outward, checked=True)

animation.append_to_caption("\n\n")
omega_slider = slider(min=0.0, max=pi, value=pi, bind=adjust_omega)
animation.append_to_caption("rotation speed = ")
omega_slider_text = wtext(text="π")

animation.append_to_caption("\n\n")
droplet_frequency_slider = slider(min=10.0, max=30, value=15, bind=adjust_droplet_frequency)
animation.append_to_caption("droplet frequency = ")
droplet_frequency_text = wtext(text="15")

animation.append_to_caption("\n\n")
water_velocity_slider = slider(min=0.0, max=1.0, value=0.3, bind=adjust_water_velocity)
animation.append_to_caption("water velocity = ")
water_velocity_text = wtext(text="0.3")

sprinkler = Sprinkler()
t = 0
while True:
    rate(100) #  not do any more than 100 loops per second        
    sprinkler.shed_water(dt)
    sprinkler.rotate(dt)
    t += dt
