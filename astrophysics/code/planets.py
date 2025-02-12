from vpython import sphere, label, vector, textures, ring, rate, canvas, color, arange, button

title = """&#x2022; <a href="https://www.glowscript.org/#/user/PHYS172x/folder/MyPrograms/program/Solar-System-Planets">Original code</a> written by Ergi Bufasi
&#x2022; Refactored and extended by <a href="https://github.com/zhendrikse/">Zeger Hendrikse</a> in <a href="https://github.com/zhendrikse/science/blob/main/astrophysics/code/planets.py">planets.py</a>
&#x2022; Click on a planet to zoom in, use the reset button to reset the scene

"""

animation = canvas(background=color.gray(0.075), range=19, center=vector(-4.8, 3.55, 0), title=title)

SUN = sphere(pos=vector(-50, 30, -30), texture="https://i.imgur.com/yoEzbtg.jpg", flipx=False, shininess=0.9, radius=7)
# SUN=sphere( pos=vector(-50,30,-30),texture="https://upload.wikimedia.org/wikipedia/commons/b/b4/The_Sun_by_the_Atmospheric_Imaging_Assembly_of_NASA%27s_Solar_Dynamics_Observatory_-_20100819.jpg",flipx = False , shininess = 0.9,radius=7 )
label(pos=vector(-50, 20, -30), text='Sun')

class Planet:
    def __init__(self, position, texture, theta):
        self._theta = theta
        self._sphere = sphere(pos=position, texture=texture, radius=3)

    def rotate(self):
        self._sphere.rotate(angle=self._theta, axis=vector(0, 1, 0), origin=self._sphere.pos)

class Mercury(Planet):
    def __init__(self):
        Planet.__init__(self, vector(-18, 9, 0), "https://i.imgur.com/SLgVbwD.jpeg", 0.00350)
        # Mercury=sphere( pos=vector(-18,9,0),texture="https://upload.wikimedia.org/wikipedia/commons/3/30/Mercury_in_color_-_Prockter07_centered.jpg",radius=3 )
        label(pos=vector(-18, 3.5, 0), text='Mercury')
        label(pos=vector(-18, 15, 0), text='θ = 0°', box=False)
        label(pos=vector(-18, 13.5, 0), text='58d 15.5h', box=False)


class Venus(Planet):
    def __init__(self):
        Planet.__init__(self, vector(-6, 9, 0), "https://i.imgur.com/YuK3CzJ.jpeg", 0.00244)
        self._sphere.opacity=0.7
        self._sphere.emissive=True
        # Venus=sphere( pos=vector(-6,9,0),texture="https://upload.wikimedia.org/wikipedia/commons/1/19/Cylindrical_Map_of_Venus.jpg", opacity = 0.7, emissive = True,radius=3 )
        label(pos=vector(-6, 3.5, 0), text='Venus')
        label(pos=vector(-6, 15, 0), text='θ = 177.3°', box=False)
        label(pos=vector(-6, 13.5, 0), text='243d 26m', box=False)

class Earth(Planet):
    def __init__(self):
        Planet.__init__(self, vector(6, 9, 0), textures.earth, 0.0408)
        label(pos=vector(6, 3.5, 0), text='Earth')
        label(pos=vector(6, 15, 0), text='θ = 23.4°', box=False)
        label(pos=vector(6, 13.5, 0), text='23h 56m', box=False)

class Mars(Planet):
    def __init__(self):
        Planet.__init__(self, vector(18, 9, 0), "https://i.imgur.com/Mwsa16j.jpeg", 0.0439)
        self._sphere.opacity = 0.7
        self._sphere.emissive = True
        # Mars=sphere( pos=vector(18,9,0),texture="https://upload.wikimedia.org/wikipedia/commons/0/02/OSIRIS_Mars_true_color.jpg",opacity = 0.7, emissive = True,radius=3 )
        label(pos=vector(18, 3.5, 0), text='Mars')
        label(pos=vector(18, 15, 0), text='θ = 25.2°', box=False)
        label(pos=vector(18, 13.5, 0), text='1d 36m', box=False)

class Jupiter(Planet):
    def __init__(self):
        Planet.__init__(self, vector(-18, -7, 0), "https://i.imgur.com/RMMtt0K.jpeg", 0.0541)
        # Jupiter=sphere( pos=vector(-18,-7,0),texture="https://upload.wikimedia.org/wikipedia/commons/e/e2/Jupiter.jpg",opacity = 0.7, emissive = True,radius=3 )
        self._sphere.opacity = 0.7
        self._sphere.emissive = True
        label(pos=vector(-19, -12.5, 0), text='Jupiter')
        label(pos=vector(-19, -1, 0), text='θ = 3.1°', box=False)
        label(pos=vector(-19, -2.5, 0), text='9h 55m', box=False)

class Saturn(Planet):
    def __init__(self):
        Planet.__init__(self, vector(-6, -7, 0), "https://i.imgur.com/02Kt4gyb.jpg", 0.0640)
        self._sphere.opacity = 0.7
        self._sphere.emissive = True
        # Saturn=sphere( pos=vector(-6,-7,0),texture="https://i.imgur.com/5Pur4IE.jpeg",opacity = 0.7, emissive = True,radius=3 )
        # Saturn=sphere( pos=vector(-6,-7,0),texture="https://upload.wikimedia.org/wikipedia/commons/b/b4/Saturn_%28planet%29_large.jpg",opacity = 0.7, emissive = True,radius=3 )
        label(pos=vector(-6, -12.5, 0), text='Saturn')
        label(pos=vector(-6, -1, 0), text='θ = 26.7°', box=False)
        label(pos=vector(-6, -2.5, 0), text='10h 40m', box=False)
        saturn_ring_1 = ring(pos=vector(-6, -7, 0), axis=vector(2, -3, 0), radius=6, thickness=0.09,
                             texture="https://upload.wikimedia.org/wikipedia/commons/b/b4/Saturn_%28planet%29_large.jpg")
        saturn_ring_2 = ring(pos=vector(-6, -7, 0), axis=vector(2, -3, 0), radius=6.5, thickness=0.07,
                             texture="https://upload.wikimedia.org/wikipedia/commons/b/b4/Saturn_%28planet%29_large.jpg")
        saturn_ring_3 = ring(pos=vector(-6, -7, 0), axis=vector(2, -3, 0), radius=5.5, thickness=0.07,
                             texture="https://upload.wikimedia.org/wikipedia/commons/b/b4/Saturn_%28planet%29_large.jpg")

class Uranus(Planet):
    def __init__(self):
        Planet.__init__(self, vector(6, -7, 0), "https://i.imgur.com/2kZNvFw.jpeg", 0.0750)
        # Uranus=sphere( pos=vector(6,-7,0),texture="https://upload.wikimedia.org/wikipedia/commons/3/3d/Uranus2.jpg",opacity = 0.7, emissive = True,radius=3 )
        label(pos=vector(6, -12.5, 0), text='Uranus')
        label(pos=vector(6, -1, 0), text='θ = 97.8°', box=False)
        label(pos=vector(6, -2.5, 0), text='17h 14m', box=False)

class Neptune(Planet):
    def __init__(self):
        Planet.__init__(self, vector(18, -7, 0), "https://i.imgur.com/lyLpoMk.jpeg", 0.0490)
        # Neptune=sphere( pos=vector(18,-7,0),texture="https://upload.wikimedia.org/wikipedia/commons/5/56/Neptune_Full.jpg",opacity = 0.7, emissive = True,radius=3 )
        self._sphere.opacity = 0.7
        self._sphere.emissive = True
        label(pos=vector(18, -12.5, 0), text='Neptune')
        label(pos=vector(18, -1, 0), text='θ = 28.3°', box=False)
        label(pos=vector(18, -2.5, 0), text='16h', box=False)

def zoom_in_on(selected_object):
    if not selected_object:
        return

    target = selected_object.pos
    step = (target - animation.center) / 20.0
    for _ in arange(1, 20, 1):
        rate(20)
        animation.center += step
        animation.range /= 1.037  # (1.037**19=1.99)

def on_mouse_click():
    zoom_in_on(animation.mouse.pick)

animation.bind('click', on_mouse_click)

def on_reset():
    animation.center = vector(-4.8, 3.55, 0)
    animation.range = 19

animation.append_to_caption("\n")
_ = button(text='Reset', bind=on_reset)

planets = [Mercury(), Venus(), Earth(), Mars(), Jupiter(), Saturn(), Uranus(), Neptune()]
while True:
    rate(20)
    for planet in planets:
        planet.rotate()
