from vpython import rate, canvas, vector, color, points, vector, sin, cos, pi, sqrt

#
# https://github.com/silvaan/blackhole_raytracer/tree/master
#

x_resolution = 150
y_resolution = x_resolution // 2
animation = canvas(title="Black hole", height=y_resolution, width=x_resolution * 1.25, fov=0.01,
                   center=vector(x_resolution / 2, x_resolution / 4, 0),
                   range=x_resolution / 4, background=color.gray(0.075))

c = 1.0
G = 2e-3

class BlackHole:
  def __init__(self, position, mass):
    self.position = position
    self.mass = mass
    self.radius = 2 * self.mass * G / (c * c)

class Color:
    def __init__(self, value=(0, 0, 0)):
        if isinstance(value, str):
            self.r = int(value[1:3], 16)
            self.g = int(value[3:5], 16)
            self.b = int(value[5:7], 16)
        else:
            self.r = value[0]
            self.g = value[1]
            self.b = value[2]
        self.r = round(min(255, self.r))
        self.g = round(min(255, self.g))
        self.b = round(min(255, self.b))
        self.value = (self.r, self.g, self.b)

    def to_list(self):
        return list(self.value)

class Texture:
  def __init__(self, im_file, width, height):
    self.pixels = None#np.array(pil.Image.open(im_file))
    self.width = width
    self.height = height
    self.im_width = width#self.pixels.shape[0]
    self.im_height = height#self.pixels.shape[1]

  def get_color(self, x, y):
    x = min(int(round(x*(self.im_width-1)/self.width)), self.im_width-1)
    y = min(int(round(y*(self.im_height-1)/self.height)), self.im_height-1)
    return Color(self.pixels[x, y])

class Disk:
  def __init__(self, origin, inner_r, outer_r, colour=Color('#ffffff'), texture=None):
    self.origin = origin
    self.inner_r = inner_r
    self.outer_r = outer_r
    self.color = colour
    if texture is not None:
      self.texture = Texture(texture, 2*self.outer_r, 2*self.outer_r)
    else:
      self.texture = None

  def is_in(self, point):
    r = (point-self.origin).mag
    return self.outer_r >= r >= self.inner_r

  def color_at(self, point):
    if self.texture is not None:
      x = point.x
      y = point.z
      return self.texture.get_color(x+self.outer_r, y+self.outer_r)
    else:
      return self.color

class Image:
  def __init__(self, width, height):
    self.width = width
    self.height = height
    self.pixels = points()#np.zeros((height, width, 3))

  def set_pixel(self, x, y, colour):
    #self.pixels[y, x] = color.value
    color_ = colour.to_list()
    self.pixels.append(pos=vector(x, y, 0), color=vector(color_[0], color_[1], color_[2])/2.55)

class Scene:
  def __init__(self, camera, blackhole, disk, width, height):
    self.camera = camera
    self.width = width
    self.height = height
    self.image = Image(width, height)
    self.blackhole = blackhole
    self.disk = disk


class Ray:
    def __init__(self, origin, direction):
        self.origin = origin
        self.position = origin
        self.direction = direction.norm()
        self.velocity = c * self.direction
        self.acceleration = vector(0, 0, 0)
        self.total_time = 0
        self.crossed_xz = False

    def point(self, dist):
        return self.origin + dist * self.direction

    def accelerate(self, a):
        self.acceleration = a

    def step(self, t):
        self.prev_pos = self.position
        self.velocity += self.acceleration * t
        self.velocity = c * self.velocity.norm()
        self.position += self.velocity * t + (.5 * self.acceleration) * (t * t)
        self.total_time += t

        self.crossed_xz = max(self.prev_pos.y, self.position.y) >= 0 >= min(self.prev_pos.y, self.position.y)
        if self.crossed_xz:
            a = self.prev_pos
            b = self.position
            l = b - a
            self.cross_point = vector(a.x - (a.y / l.y) * l.x, 0, a.z - (a.y / l.y) * l.z)

class Camera:
  def __init__(self, origin, direction, focal_length):
    self.origin = origin
    self.direction = direction.norm()
    self.focal_length = focal_length
    self.normal = self.origin + self.focal_length*self.direction
    self.right = vector(1, 0, 0)
    self.up = self.normal.cross(self.right).norm()

  def ray(self, x, y):
    point = self.normal + x*self.right + y*self.up
    return Ray(self.origin, point - self.origin)

class Engine:
  def __init__(self, scene, n_iter=200, dt=0.002):
    self.scene = scene
    self.n_iter = n_iter
    self.dt = dt

  def render(self):
    ratio = float(self.scene.width)/self.scene.height
    x0, x1 = -1.0, 1.0
    y0, y1 = -1.0/ratio, 1.0/ratio
    xstep, ystep = (x1-x0)/(self.scene.width-1), (y1-y0)/(self.scene.height-1)

    for j in range(self.scene.height):
      y = y0 + j*ystep

      #if (j+1) % 10 == 0:
      #  print('line ' + str(j+1) + '/' + str(self.scene.height))

      for i in range(self.scene.width):
        x = x0 + i*xstep
        ray = self.scene.camera.ray(x, y)
        self.scene.image.set_pixel(i, j, self.trace(ray))


    #self.output = Image.fromarray(self.scene.image.pixels.astype(np.uint8))

  def trace(self, ray, depth=0):
    color = Color()
    for t in range(self.n_iter):
      r = self.scene.blackhole.position - ray.position
      a = 7.0e-3*(self.scene.blackhole.mass/(r.dot(r)))*r.norm()
      ray.accelerate(a)
      ray.step(t*self.dt)

      ray_bh_dist = (ray.position-self.scene.blackhole.position).mag

      if ray.crossed_xz and self.scene.disk.is_in(ray.cross_point):
        color = self.scene.disk.color_at(ray.position)
        break
      elif ray_bh_dist <= self.scene.blackhole.radius:
        break
      elif ray_bh_dist >= 15.0:
        break
    return color

  def save(self, filename):
      animation.capture("black_hole.png")
    #self.output.save(filename)


c_origin = vector(0, 0.7, -9.0)
c_focus = vector(0, 0, 0.0)

bh = BlackHole(c_focus, 80)

# You can specify a texture file for the accretion disk with `texture='filename.png'` or a color by `color=Color('#ffffff') (default)`
disk = Disk(c_focus, 4.5*bh.radius, 16.2*bh.radius, colour=Color("#040101"))

scene = Scene(
	width = x_resolution,
	height =x_resolution // 2,
	camera = Camera(c_origin, c_focus-c_origin, 1.2),
	blackhole = bh,
	disk = disk
)


engine = Engine(scene)
engine.render()

#engine.save('images/blackhole.png')
while True:
  rate(10)