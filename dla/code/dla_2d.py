#Web VPython 3.2
""" From "COMPUTATIONAL PHYSICS" & "COMPUTER PROBLEMS in PHYSICS"
 by RH Landau, MJ Paez, and CC Bordeianu (deceased)
  Copyright R Landau, Oregon State Unv, MJ Paez, Univ Antioquia,
  C Bordeianu, Univ Bucharest, 2018.
  Please respect copyright & acknowledge our work."""

title = """&#x2022; Based on <a href="https://sites.science.oregonstate.edu/~landaur/Books/Problems/Codes/VisualCodes(old)/DLAVis.py">DLA.py</a>
&#x2022; From <a href="https://books.google.nl/books/about/Computational_Problems_for_Physics.html?id=g9tdDwAAQBAJ">Computational Problems for Physics</a> by RH Landau, MJ Paez, and CC Bordeianu.
&#x2022; Refactored by <a href="https://www.hendrikse.name/">Zeger Hendrikse</a> in <a href="https://github.com/zhendrikse/science/blob/main/dla/code/dla_2d.py">dla_2d.py</a>

"""

from vpython import simple_sphere, vector, ring, color, rate, sin, cos, sqrt, pi, log, canvas, random, checkbox, slider, dot, sphere, floor

display = canvas(width=600, height=600, title=title, range=40, center=vector(0, 0, 15), background=color.gray(0.075))

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


radius, grid_size = 40., 60
grid = [[0 for _ in range(grid_size)] for _ in range(grid_size)]  # Particle locations, 1=occupied
ring(pos=vector(0, 0, 0), axis=vector(0, 0, 1), radius=radius, thickness=0.25, color=color.cyan)
grid[grid_size // 2][grid_size // 2] = 1  # Particle in center
simple_sphere(pos=vector(4 * (grid_size // 2) / 3 - radius, -4 * (grid_size // 2) / 3 + radius, 0), radius=.8, color=scientific_color_code(0, 0, 1))
ball = simple_sphere(radius=0.8)  # Moving ball

show_start_points = False
def toggle_start_points(event):
    global show_start_points
    show_start_points = event.checked

frame_rate = 10000
def change_frame_rate(event):
    global frame_rate
    frame_rate = event.value

display.append_to_caption("\nStart points ")
_ = checkbox(bind=toggle_start_points, checked=show_start_points)
display.append_to_caption("\n\nFrame rate")
_ = slider(min=5, max=frame_rate, value=frame_rate, bind=change_frame_rate)


def neighbor_cell_is_occupied(i, j):
    return (grid[i + 1][j] + grid[i - 1][j] + grid[i][j + 1] + grid[i][j - 1]) >= 1
    #return (grid[xg + 1][yg] + grid[xg - 1][yg] + grid[xg][yg + 1] + grid[xg][yg - 1] + grid[xg + 1][yg + 1] + grid[xg -1][yg - 1] + grid[xg + 1][yg - 1] + grid[xg - 1][yg + 1]) >= 1


running = True
while running:
    hit = False
    angle = 2. * pi * random()
    pos = radius * vector(cos(angle), sin(angle), 0)
    max_distance = abs(int(gauss(0, 20000)))  # Length of walk

    if show_start_points:
        simple_sphere(pos=pos, color=scientific_color_code(1, 0, 1), radius=.4)

    traveling_distance = 0
    while not hit and abs(pos.x) < radius and abs(pos.y) < radius and traveling_distance < abs(max_distance):
        step = 1 if random() < 0.5 else -1
        xg, yg = int((pos.x * sqrt(2) + grid_size)/ 2), int((pos.y * sqrt(2) + grid_size) / 2)

        if neighbor_cell_is_occupied(xg, yg):
            hit = True  # Ball hits fixed ball
            grid[xg][yg] = 1  # Position now occupied
            distance = dot(pos, pos) / (radius * radius)
            running = distance < 1.05
            sphere(pos=vector(pos), radius=0.8, color=scientific_color_code(distance, 0, 1))
        else:
            step = 1 if random() < 0.5 else -1
            if random() < 0.5:
                pos.x += step
            else:
                pos.y += step
            ball.pos = vector(pos.x, pos.y, 0)
            rate(frame_rate)  # Change ball speed
        traveling_distance += 1  # increments distance, < dist
