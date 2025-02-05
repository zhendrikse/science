# Web VPython 3.2
#
# Code comes from https://github.com/possibly-wrong/vturtle/
# See also https://possiblywrong.wordpress.com/2024/08/07/robot-simulator-updated-to-vpython-7-6-5/
# Adapted for Trinket by Zeger Hendrikse, see also https://github.com/zhendrikse/physics-in-python
#

from vpython import *

title = """&#x2022; Based on <a href="https://github.com/possibly-wrong/vturtle/">this GitHub repo</a>, owned by Maximillian DeMarr
&#x2022; Ported to Web VPython by <a href="https://www.hendrikse.name/">Zeger Hendrikse</a>

"""
animation = canvas(title=title, autoscale=False, background=color.gray(0.075), forward=vec(0, .74, -.67), range=135)

inf = 1E10


class Robot:
    """Robot with drawing pen and stall and proximity sensors."""

    def __init__(self, pos=vec(0, 0, 0), sensors=[90, 0, -90], obstacles=[]):
        """Create a robot.

        Create a robot at the given (x,y) position (cm) and facing along
        the positive x-axis, with a yellow pen for drawing a trail as
        the robot moves.

        Any specified sensors and obstacles are added using add_sensor()
        and add_obstacle(), respectively.
        """
        self._radius = 9  # cm
        self._range = 10  # cm
        self._speed = 15  # cm/s
        self._ff = 1
        self._fps = 24

        # Create robot body.
        parts = []
        parts.append(cylinder(pos=vec(0, 0, 2), axis=vec(0, 0, 4),
                              radius=self._radius, color=color.blue))

        # Add lights.
        parts.append(sphere(pos=vec(6, 3, 6), radius=0.5, color=color.red))
        for y in [-2.5, -1, 0.5]:
            parts.append(sphere(pos=vec(5.5, y, 6), radius=0.5,
                                color=color.green))

        # Add side wheels with tread.
        for y in [-1, 1]:
            parts.append(cylinder(pos=vec(0, 7 * y, 4), axis=vec(0, y, 0),
                                  radius=4, color=color.gray(0.5)))
            parts.append(ring(pos=vec(0, 7.5 * y, 4), axis=vec(0, y, 0),
                              radius=4, thickness=0.25,
                              color=color.gray(0.25)))

        # Add front tricycle wheel.
        parts.append(cylinder(pos=vec(7.5, -0.5, 1.5), axis=vec(0, 1, 0),
                              radius=1.5, color=color.gray(0.5)))

        # Add pen.
        self._pen_color = color.yellow
        parts.append(cylinder(pos=vec(0, 0, 0), axis=vec(0, 0, 14), radius=0.5,
                              color=self._pen_color))
        self._frame = compound(parts, pos=vec(pos), origin=vec(0, 0, 0))

        # Initialize drawing trails and sensors, and register obstacles.
        self._trail = curve(pos=[vec(pos)], color=self._pen_color)
        self._trails = []
        self._stalled = False
        self._sensors = []
        for sensor in sensors:
            self.add_sensor(sensor)
        self._obstacles = obstacles
        # for obstacle in obstacles:
        #     self.add_obstacle(obstacle)

    def add_sensor(self, bearing):
        """Add proximity sensor mounted at given bearing (deg).

        The integer id of the sensor is returned, for use with sensor().
        Three sensors are available by default, with ids 0 (left,
        bearing 90), 1 (front, bearing 0), and 2 (right, bearing -90).
        """
        self._sensors.append(radians(bearing))
        return len(self._sensors) - 1

    def _check_stall(self):
        if not self._obstacles: return
        for obstacle in self._obstacles:
            self._stalled = obstacle._intersect_circle(self._frame.pos, self._radius)
            if self._stalled:
                break
        return self._stalled

    def position(self, pos=None, y=None):
        """Get position or move to position without changing heading.

        Specify position either as separate (x,y) arguments (cm) or as a
        tuple.

        The robot will stall if it runs into an obstacle before reaching
        the given destination.
        """
        if pos is None:
            return (self._frame.pos.x, self._frame.pos.y)
        if self._trail:
            self._trail.append(pos=self._frame.pos, color=self._pen_color)
        # pos = vec2(pos, y)
        pos = vec(pos.x, pos.y, 0) if y is None else vec(pos, y, 0)
        last_pos = vector(self._frame.pos)
        dx = self._speed / self._fps
        while (not self._check_stall()) and mag(pos - self._frame.pos) > dx:
            if self._ff < inf:
                rate(self._ff * self._fps)
            last_pos = vector(self._frame.pos)
            direction = norm(pos - self._frame.pos)
            self._frame.pos = self._frame.pos + direction * dx
            if self._trail:
                self._trail.modify(-1, pos=self._frame.pos)
        if not self._stalled:
            last_pos = vector(self._frame.pos)
            self._frame.pos = pos
            self._check_stall()
        if self._stalled:
            self._frame.pos = last_pos
        if self._trail:
            self._trail.modify(-1, pos=self._frame.pos)

    def forward(self, distance):
        """Move forward the given distance (cm).

        The robot will stall if it runs into an obstacle before moving
        the given distance.
        """
        self.position(self._frame.pos + distance * norm(self._frame.axis))

    def backward(self, distance):
        """Move backward the given distance (cm).

        The robot will stall if it runs into an obstacle before moving
        the given distance.
        """
        self.forward(-distance)

    def heading(self, angle=None):
        """Get current heading (deg) or turn to given heading."""
        current = degrees(atan2(self._frame.axis.y, self._frame.axis.x)) % 360
        if angle is None:
            return current
        self.left(((angle - current + 180) % 360) - 180)

    def add_obstacle(self, obstacle):
        """Register obstacle (Wall or another Robot)."""
        self._obstacles.append(obstacle)
        self._check_stall()

    def left(self, angle):
        """Turn left through angle (deg)."""
        if self._speed == inf:
            self._frame.rotate(angle=radians(angle), axis=vec(0, 0, 1))
        else:
            psi = self.heading() + angle
            dpsi = sign(angle) * self._speed / self._fps / 7.5
            for r in arange(0, radians(angle), dpsi):
                if self._ff < inf:
                    rate(self._fps * self._ff)
                self._frame.rotate(angle=dpsi, axis=vec(0, 0, 1))
            self._frame.rotate(angle=radians(psi - self.heading()),
                               axis=vec(0, 0, 1))

    def right(self, angle):
        """Turn right through angle (deg)."""
        self.left(-angle)

    def pen_up(self):
        """Pick up drawing pen to move without leaving a trail."""
        if self._trail:
            self._trails.append(self._trail)
            self._trail = False

    def pen_down(self):
        """Put down drawing pen to leave a trail when moving."""
        if not self._trail:
            self._trail = curve(pos=[self._frame.pos], color=self._pen_color)

    def clear(self):
        """Clear all of this robot's drawing trails."""
        if self._trail:
            self._trail.visible = False
        for trail in self._trails:
            trail.visible = False
        self._trail = False
        self._trails = []
        self.pen_down()

    def show(self):
        """Show robot, making it visible."""
        self._frame.visible = True

    def hide(self):
        """Hide robot, making it invisible."""
        self._frame.visible = False


class Wall:
    """Wall obstacle."""

    def __init__(self, x1, x2, **args):
        """Create wall with (x,y) endpoints x1 and x2.

        A wall is a VPython box 1 cm wide, 15 cm tall, with optional
        additional box() arguments, e.g. texture=textures.wood.
        """
        height = 15
        x1.z = height / 2
        x2.z = x1.z
        self._wall = box(pos=(x1 + x2) / 2, axis=(x2 - x1), height=1, width=height, **args)
        x1.z = 0
        x2.z = 0
        self._x1 = x1
        self._x2 = x2
        self._a = mag2(self._wall.axis)

    def _intersect_circle(self, center, radius):
        radius = radius + 0.55
        v = self._x1 - center
        b = 2 * dot(v, self._wall.axis)
        c = mag2(v) - radius * radius
        d = b * b - 4 * self._a * c
        if d >= 0:
            d = sqrt(d)
            return (0 <= -b + d <= 2 * self._a) or (0 <= -b - d <= 2 * self._a)
        return False

    def _intersect_segment(self, x1, x2):
        return ((self._ccw(self._x1, x1, x2) != self._ccw(self._x2, x1, x2))
                and (self._ccw(self._x1, self._x2, x1) != self._ccw(self._x1, self._x2, x2)))

    def _ccw(self, a, b, c):
        return (b.x - a.x) * (c.y - a.y) > (c.x - a.x) * (b.y - a.y)


def table(center=vec(0, 0, 0), length=200, width=200):
    """Create a table with walled edges.

    This is a convenience function for creating a standard "tabletop"
    with Wall() edge obstacles for use with add_obstacle(). The list of
    walls is returned.
    """
    c = center
    dx = vec(length / 2, 0, 0)
    dy = vec(0, width / 2, 0)
    box(pos=vec(c.x, c.y, -1.1), length=length, height=width, width=2,
        color=color.gray(0.25), texture=textures.wood)
    walls = []
    walls.append(Wall(c - dx + dy, c + dx + dy, texture=textures.wood))
    walls.append(Wall(c - dx - dy, c + dx - dy, texture=textures.wood))
    walls.append(Wall(c + dx - dy, c + dx + dy, texture=textures.wood))
    walls.append(Wall(c - dx - dy, c - dx + dy, texture=textures.wood))
    return walls


def maze(pos=vec(0, 0, 0), rows=8, columns=8, cell_size=30):
    """Create a maze on a table with walled edges.

    This is a convenience function for creating a simply connected
    binary tree maze with Wall() edge obstacles for use with
    add_obstacle(). The list of walls is returned.

    The given (x,y) position specifies the location of the center of the
    lower left cell of the maze.
    """
    dx = vec(cell_size, 0, 0)
    dy = vec(0, cell_size, 0)
    pos = pos + (dx + dy) / 2
    walls = table(center=pos + dx * (columns / 2 - 1) + dy * (rows / 2 - 1),
                  length=columns * cell_size, width=rows * cell_size)
    for row in range(rows - 1):
        for col in range(columns - 1):
            c = pos + dx * col + dy * row
            if random() < 0.5:
                walls.append(Wall(c, c - dy))
            else:
                walls.append(Wall(c - dx, c))
    animation.center = pos + (columns / 2 - 1) * dx + (rows / 2 - 1) * dy
    return walls


# robot = Robot(obstacles=table())
robot = Robot(obstacles=maze())


def on_key_press(event):
    key = event.key
    if key == "left":
        robot.left(90)
    elif key == "right":
        robot.right(90)
    elif key == "up":
        robot.forward(5)
    elif key == "down":
        robot.backward(5)
    elif key == "u":
        robot.pen_up()
    elif key == "d":
        robot.pen_down()
    elif key == "c":
        robot.clear()
    elif key == "s":
        robot.show()
    elif key == "h":
        robot.hide()


animation.bind("keydown", on_key_press)
animation.caption = "[&rarr;, &larr; &uarr;, &darr;]=move, [u, d]=pen-up/pen down, [c]=clear trail, [s, h]=show/hide"

while True:
    rate(30)
