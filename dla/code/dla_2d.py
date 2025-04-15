#Web VPython 3.2
from vpython import rate, random, pi, box, color, vec, sqrt, vector, floor, mag, canvas, cos, sin, graph, gcurve

title="""&#x2022; Based on <a href="https://github.com/ksenia007/dlaCluster/blob/master/DLAcluster.py">DLAcluster.py</a>
&#x2022; Refactored, extended, and ported to <a href="https://vpython.org/">VPython</a> by <a href="https://www.hendrikse.name/">Zeger Hendrikse</a>, see <a href="https://github.com/zhendrikse/science/blob/main/dla/code/dla_2d.py">dla_2d.py</a>

"""

radius = 150
square_size = radius * 2 + 5
display = canvas(width=600, height=600, background=color.gray(0.075), center=vec(1, 1, 0) * square_size / 2, range=radius, title=title)

display.append_to_caption("\n")
graph(title="Walker data", xtitle="Released walkers", ytitle="Glued walkers", background=color.black, width=600)
plot = gcurve(color=color.cyan)

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


def check_around(location, matrix):
    found_friend = False  # found another particle
    exit_circle = False  # reached the required radius
    near_edge = False  # near the edge of the field

    # Check if a walker is near the edge
    if (location[1] + 1) > square_size - 1 or (location[1] - 1) < 1 or (location[0] + 1) > square_size - 1 or (location[0] - 1) < 1:
        near_edge = True

    # If not near the edge, check if the walker is near a neighbor or reached the required radius
    # location[1]=row, location[2]=column
    if not near_edge:
        neighbor_down = matrix[location[0] + 1][location[1]]
        if neighbor_down == 1:
            found_friend = True
        if neighbor_down == 2:
            exit_circle = True

        neighbor_up = matrix[location[0] - 1][location[1]]
        if neighbor_up == 1:
            found_friend = True
        if neighbor_up == 2:
            exit_circle = True

        neighbor_right = matrix[location[0]][location[1] + 1]
        if neighbor_right == 1:
            found_friend = True
        if neighbor_right == 2:
            exit_circle = True

        neighbor_left = matrix[location[0]][location[1] - 1]
        if neighbor_left == 1:
            found_friend = True
        if neighbor_left == 2:
            exit_circle = True

    # After checking locations, if locations are good, start the random walk
    if not found_friend and not near_edge:
        decide = random()
        if decide < 0.25:
            location = [location[0] - 1, location[1]]
        elif decide < 0.5:
            location = [location[0] + 1, location[1]]
        elif decide < 0.75:
            location = [location[0], location[1] + 1]
        else:
            location = [location[0], location[1] - 1]

    return location, found_friend, near_edge, exit_circle


def random_location_on_ring(seed_x, seed_y):
    theta = 2 * pi * random() #generate random theta
    x= int(radius * cos(theta)) + seed_x
    y= int(radius * sin(theta)) + seed_y
    return [x, y]


def dla_cluster():
    # note - we add 2 to the parameters to get a thick broder between the edges of the disk and square
    seed_x = radius + 2
    seed_y = radius + 2

    matrix = [[0 for _ in range(square_size)] for _ in range(square_size)]

    for row in range(square_size):
        for col in range(square_size):
            if row == seed_y and col == seed_x:
                # put a seed particle at the center
                matrix[row][col] = 1
                box(pos=vec(row, col, 0), color=scientific_color_code(0, 0, square_size))
            elif mag(vec(seed_x - col, seed_y - row, 0)) > radius:
                # define field outside of circle
                box(pos=vec(row, col, 0), color=color.black, shininess=0)
                matrix[row][col] = 2

    added_walkers_count = random_walkers_count = 0
    complete_cluster = False

    while not complete_cluster:
        random_walkers_count += 1
        location = random_location_on_ring(seed_x, seed_y)

        found_friend = False  # not near other particle
        near_edge = False  # not near the edge of the field
        exit_circle = False
        while not found_friend and not near_edge:
            location_new, found_friend, near_edge, exit_circle = check_around(location, matrix)

            if found_friend:
                rate(10000) # Refresh screen
                matrix[location[0]][location[1]] = 1
                screen_pos = vec(location[0], location[1], 0)
                distance = mag(screen_pos -.5 * vec(square_size, square_size, 0))
                box(pos=screen_pos, color=scientific_color_code(distance, 0, .5 * square_size))
                added_walkers_count += 1
            else:
                location = location_new

        if random_walkers_count == 400000:
            complete_cluster = True

        if found_friend and exit_circle:
            complete_cluster = True

        plot.plot(random_walkers_count, added_walkers_count)

    return added_walkers_count, matrix


mass, cluster = dla_cluster()
while True:
    rate(10)