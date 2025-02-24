from vpython import sphere, label, vector, textures, ring, rate, canvas, color, arange, button, radio

title = """&#x2022; <a href="https://www.glowscript.org/#/user/PHYS172x/folder/MyPrograms/program/Solar-System-Planets">Original code</a> written by Ergi Bufasi
&#x2022; Refactored and extended by <a href="https://github.com/zhendrikse/">Zeger Hendrikse</a> in <a href="https://github.com/zhendrikse/science/blob/main/astrophysics/code/planets.py">planets.py</a>
&#x2022; Click on a planet to zoom in, use the reset button to reset the scene

"""

animation = canvas(background=color.gray(0.075), range=19, center=vector(-4.8, 3.55, 0), title=title)
sun_textures = [
    "https://i.imgur.com/yoEzbtg.jpeg",
    "https://www.hendrikse.name/science/astrophysics/images/textures/sun.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/b/b4/The_Sun_by_the_Atmospheric_Imaging_Assembly_of_NASA%27s_Solar_Dynamics_Observatory_-_20100819.jpg"
]
sun = sphere(pos=vector(-50, 30, -30), texture=sun_textures[0], flipx=False, shininess=0.9, radius=7)
label(pos=vector(-50, 20, -30), text='Sun')

class Planet:
    def __init__(self, position, textures_, theta):
        self._theta = theta
        self._textures = textures_
        self._sphere = sphere(pos=position, texture=textures_[0], radius=3)

    def rotate(self):
        self._sphere.rotate(angle=self._theta, axis=vector(0, 1, 0), origin=self._sphere.pos)

    def set_texture(self, index):
        self._sphere.texture = self._textures[index]

class Mercury(Planet):
    def __init__(self):
        textures_ = [
            "https://i.imgur.com/SLgVbwD.jpeg",
            "https://www.hendrikse.name/science/astrophysics/images/textures/mercury.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/3/30/Mercury_in_color_-_Prockter07_centered.jpg"
        ]
        Planet.__init__(self, vector(-18, 9, 0), textures_, 0.00350)
        label(pos=vector(-18, 3.5, 0), text='Mercury')
        label(pos=vector(-18, 15, 0), text='θ = 0°', box=False)
        label(pos=vector(-18, 13.5, 0), text='58d 15.5h', box=False)


class Venus(Planet):
    def __init__(self):
        textures_ = [
            "https://i.imgur.com/YuK3CzJ.jpeg",
            "https://www.hendrikse.name/science/astrophysics/images/textures/venus.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/1/19/Cylindrical_Map_of_Venus.jpg"
        ]
        Planet.__init__(self, vector(-6, 9, 0), textures_, 0.00244)
        self._sphere.opacity=0.7
        self._sphere.emissive=True
        label(pos=vector(-6, 3.5, 0), text='Venus')
        label(pos=vector(-6, 15, 0), text='θ = 177.3°', box=False)
        label(pos=vector(-6, 13.5, 0), text='243d 26m', box=False)

class Earth(Planet):
    def __init__(self):
        textures_ = [
            textures.earth,
            "https://www.hendrikse.name/science/astrophysics/images/textures/earth_8k.jpg",
            "https://www.hendrikse.name/science/astrophysics/images/textures/earth.jpg"
        ]
        Planet.__init__(self, vector(6, 9, 0), textures_, 0.0408)
        label(pos=vector(6, 3.5, 0), text='Earth')
        label(pos=vector(6, 15, 0), text='θ = 23.4°', box=False)
        label(pos=vector(6, 13.5, 0), text='23h 56m', box=False)

class Mars(Planet):
    def __init__(self):
        textures_ = [
            "https://i.imgur.com/Mwsa16j.jpeg",
            "https://www.hendrikse.name/science/astrophysics/images/textures/mars.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/0/02/OSIRIS_Mars_true_color.jpg"
        ]
        Planet.__init__(self, vector(18, 9, 0), textures_, 0.0439)
        self._sphere.opacity = 0.7
        self._sphere.emissive = True
        label(pos=vector(18, 3.5, 0), text='Mars')
        label(pos=vector(18, 15, 0), text='θ = 25.2°', box=False)
        label(pos=vector(18, 13.5, 0), text='1d 36m', box=False)

class Jupiter(Planet):
    def __init__(self):
        textures_ = [
            "https://i.imgur.com/RMMtt0K.jpeg",
            "https://www.hendrikse.name/science/astrophysics/images/textures/jupiter.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/e/e2/Jupiter.jpg"
        ]
        Planet.__init__(self, vector(-18, -7, 0), textures_, 0.0541)
        self._sphere.opacity = 0.7
        self._sphere.emissive = True
        label(pos=vector(-19, -12.5, 0), text='Jupiter')
        label(pos=vector(-19, -1, 0), text='θ = 3.1°', box=False)
        label(pos=vector(-19, -2.5, 0), text='9h 55m', box=False)

class Saturn(Planet):
    def __init__(self):
        textures_ = [
            "https://i.imgur.com/02Kt4gyb.jpeg",
            "https://www.hendrikse.name/science/astrophysics/images/textures/saturn.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/b/b4/Saturn_%28planet%29_large.jpg"
        ]
        Planet.__init__(self, vector(-6, -7, 0), textures_, 0.0640)
        self._sphere.opacity = 0.7
        self._sphere.emissive = True
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
        textures_ = [
            "https://i.imgur.com/2kZNvFw.jpeg",
            "https://www.hendrikse.name/science/astrophysics/images/textures/uranus.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/3/3d/Uranus2.jpg"
        ]
        Planet.__init__(self, vector(6, -7, 0), textures_, 0.0750)
        label(pos=vector(6, -12.5, 0), text='Uranus')
        label(pos=vector(6, -1, 0), text='θ = 97.8°', box=False)
        label(pos=vector(6, -2.5, 0), text='17h 14m', box=False)

class Neptune(Planet):
    def __init__(self):
        textures_ = [
            "https://i.imgur.com/lyLpoMk.jpeg",
            "https://www.hendrikse.name/science/astrophysics/images/textures/neptune.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/5/56/Neptune_Full.jpg"
        ]
        Planet.__init__(self, vector(18, -7, 0), textures_, 0.0490)
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

def toggle_textures(event):
    if event.name == "imgur":
        for planet in planets:
            planet.set_texture(0)
        sun.texture = sun_textures[0]
        radio_2.checked = radio_3.checked = False
    if event.name == "local":
        for planet in planets:
            planet.set_texture(1)
        sun.texture = sun_textures[1]
        radio_1.checked = radio_3.checked = False
    if event.name == "nasa":
        for planet in planets:
            planet.set_texture(2)
        sun.texture = sun_textures[2]
        radio_1.checked = radio_2.checked = False

animation.append_to_caption("\n")
radio_1 = radio(text="Imgur textures ", checked=True, name="imgur", bind=toggle_textures)
radio_2 = radio(text="Local textures ", checked=False, name="local", bind=toggle_textures)
radio_3 = radio(text="Nasa textures   ", checked=False, name="nasa", bind=toggle_textures)
_ = button(text='Reset', bind=on_reset)

planets = [Mercury(), Venus(), Earth(), Mars(), Jupiter(), Saturn(), Uranus(), Neptune()]
while True:
    rate(20)
    for planet in planets:
        planet.rotate()
