""" From "COMPUTATIONAL PHYSICS" & "COMPUTER PROBLEMS in PHYSICS"
 by RH Landau, MJ Paez, and CC Bordeianu (deceased)
  Copyright R Landau, Oregon State Unv, MJ Paez, Univ Antioquia,
  C Bordeianu, Univ Bucharest, 2018.
  Please respect copyright & acknowledge our work."""

# DLA.py:   Diffusion Limited aggregation

title = """&#x2022; Based on <a href="https://sites.science.oregonstate.edu/~landaur/Books/Problems/Codes/VisualCodes(old)/DLAVis.py">DLA.py</a>
&#x2022; From <a href="https://books.google.nl/books/about/Computational_Problems_for_Physics.html?id=g9tdDwAAQBAJ">Computational Problems for Physics</a> by RH Landau, MJ Paez, and CC Bordeianu.
&#x2022; Three-dimensional extension by <a href="https://www.hendrikse.name/">Zeger Hendrikse</a> in <a href="https://github.com/zhendrikse/science/blob/main/dla/code/dla_3d.py">dla_3d.py</a>

"""

from vpython import sphere, simple_sphere, vector, color, rate, sin, cos, sqrt, pi, log, canvas, random, checkbox, ring, dot, slider, floor

display = canvas(width=600, height=600, title=title, range=20, center=vector(0, 0, 15), color=color.gray(0.075), forward=vector(-.1, -.2, -1))

# Box-Muller transform to create a normal distribution
def gauss(mu, sigma):
    u1 = random()
    u2 = random()
    vt = sqrt(-2 * log(u1)) * cos(2 * pi * u2)
    vt *= sigma + mu
    return vt

def scientific_color_code(value, min_value, max_value):
    color_value = min(max(value, min_value), max_value - 0.0001)
    value_range = max_value - min_value
    color_value = 0.5 if value_range == 0.0 else (color_value - min_value) / value_range
    num = floor(4 * color_value)
    color_value = 4 * (color_value - num / 4)

    if num == 0:
        return vector(0.0, color_value, 1.0)
    elif num == 1:
        return vector(0.0, 1.0, 1.0 - color_value)
    elif num == 2:
        return vector(color_value, 1.0, 0.0)
    elif num == 3:
        return vector(1.0, 1.0 - color_value, 0.0)

radius, grid_size = 20., 60
grid = [[[0 for _ in range(grid_size)] for _ in range(grid_size)] for _ in range(grid_size)]
grid[grid_size // 2][grid_size // 2][grid_size // 2] = 1  # Particle in center

ring_1 = ring(pos=vector(0, 0, 0), axis=vector(0, 1, 0), radius=radius, thickness=0.1, color=color.cyan)
ring_2 = ring(pos=vector(0, 0, 0), axis=vector(1, 0, 0), radius=radius, thickness=0.1, color=color.cyan)
dome = sphere(pos=vector(0, 0, 0), radius=radius, opacity=0.1, color=color.cyan, visible=False)
sphere(pos=vector(0, 0, 0), radius=1, color=scientific_color_code(0, 0, 1))
ball = simple_sphere(radius=0.8)  # Moving ball

show_start_points = False
def toggle_start_points(event):
    global show_start_points
    show_start_points = event.checked

frame_rate = 10000
def change_frame_rate(event):
    global frame_rate
    frame_rate = event.value

def toggle_rings(event):
    ring_1.visible = ring_2.visible = event.checked

def toggle_dome(event):
    dome.visible = event.checked


display.append_to_caption("\n")
_ = checkbox(text="Start points ", bind=toggle_start_points, checked=show_start_points)
_ = checkbox(text="Rings ", bind=toggle_rings, checked=True)
_ = checkbox(text="Dome ", bind=toggle_dome, checked=False)
display.append_to_caption("\n\nFrame rate")
_ = slider(min=5, max=frame_rate, value=frame_rate, bind=change_frame_rate)

def neighbor_cell_is_occupied(i, j, k):
    return (grid[i + 1][j][k] + grid[i - 1][j][k] + grid[i][j + 1][k] + grid[i][j - 1][k] + grid[i][j][k - 1] + grid[i][j][k + 1]) >= 1

factor = sqrt(1 * 1 + 1 * 1 + 1 * 1)
def grid_coordinates(position):
    x = int((position.x * factor + grid_size) / 2)
    y = int((position.y * factor + grid_size) / 2)
    z = int((position.z * factor + grid_size) / 2)
    return x, y, z

running = True
step = 0
while running:  # Generates new ball
    hit = False
    phi = 2. * pi * random()
    theta = 1. * pi * random()
    pos = radius * vector(sin(theta) * cos(phi), sin(theta) * sin(phi), cos(theta))
    max_distance = abs(int(gauss(0, 20000)))  # Length of walk
    if show_start_points:
        sphere(pos=pos, color=color.magenta, radius=.2, opacity=.2)

    traveling_distance = 0
    while not hit and radius > pos.x > -radius and radius > pos.y > -radius  and radius > pos.z > -radius and traveling_distance < abs(max_distance):
        xg, yg, zg = grid_coordinates(pos)
        if neighbor_cell_is_occupied(xg, yg, zg):
            hit = True  # Ball hits fixed ball
            grid[xg][yg][zg] = 1  # Position now occupied
            distance = dot(pos, pos) / (radius * radius)
            running = distance < 1.05
            sphere(pos=vector(pos), radius=0.8, color=scientific_color_code(distance, 0, 1))
        else:
            step = 1 if random() < 0.5 else -1
            direction = random()
            if direction < 1 / 3:
                pos.x += step
            elif direction < 2 / 3:
                pos.y += step
            else:
                pos.z += step
            ball.pos = vector(pos.x, pos.y, pos.z)
            rate(frame_rate)
        traveling_distance += 1  # increments distance, < dist
