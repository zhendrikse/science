from vpython import canvas, ellipsoid, curve, pyramid, color, vec, ring, rate

title = """&#x2022; Original <a href="https://vpython.org/contents/contributed/face.py">face.py</a> by Joel Kahn, 2004
&#x2022; Refactored by <a href="https://www.hendrikse.name/">Zeger Hendrikse</a> to <a href="https://github.com/zhendrikse/science/blob/main/fun/code/face.py">face.py</a>

"""

animation = canvas(title=title, background=color.gray(0.075), range=4)

eye_length = 0.8
eye_width = 0.4
eye_height = 0.5

left_eye = ellipsoid (pos = vec(-1.0, 0.9, 0.0), length = eye_length, width = eye_width, height = eye_height, color = color.blue)
right_eye = ellipsoid (pos = vec(1.0, 0.9, 0.0), length = eye_length, width = eye_width, height = eye_height, color = color.blue)

left_eyebrow = curve (radius = 0.09, color = vec(0.91, 0.7, 0.15))
right_eyebrow = curve (radius = 0.09, color = vec(0.91, 0.7, 0.15))

nose = pyramid (pos = vec(0.0, 0.0, 0.0), axis = vec(0.0, 0.0, 1.0), width = 0.8, height = 0.8, length = 1.7)

mouth = curve (radius = 0.2, color = color.red)

eyebrow_x1 = 1.4
eyebrow_x2 = 1.1
eyebrow_x3 = 1.0
eyebrow_x4 = 0.9
eyebrow_x5 = 0.6

eyebrow_y1 = 1.25
eyebrow_y2 = 1.39
eyebrow_y3 = 1.41
eyebrow_y4 = 1.39
eyebrow_y5 = 1.25

left_eyebrow.append (pos = vec(-eyebrow_x1, eyebrow_y1, 0.0))
left_eyebrow.append (pos = vec(-eyebrow_x2, eyebrow_y2, 0.0))
left_eyebrow.append (pos = vec(-eyebrow_x3, eyebrow_y3, 0.0))
left_eyebrow.append (pos = vec(-eyebrow_x4, eyebrow_y4, 0.0))
left_eyebrow.append (pos = vec(-eyebrow_x5, eyebrow_y5, 0.0))

right_eyebrow.append (pos = vec(eyebrow_x1, eyebrow_y1, 0.0))
right_eyebrow.append (pos = vec(eyebrow_x2, eyebrow_y2, 0.0))
right_eyebrow.append (pos = vec(eyebrow_x3, eyebrow_y3, 0.0))
right_eyebrow.append (pos = vec(eyebrow_x4, eyebrow_y4, 0.0))
right_eyebrow.append (pos = vec(eyebrow_x5, eyebrow_y5, 0.0))

mouth.append (pos = vec(-1.5, -0.5, 0.0))
mouth.append (pos = vec(-0.5, -1.3, 0.0))
mouth.append (pos = vec(0.0, -1.4, 0.0))
mouth.append (pos = vec(0.5, -1.3, 0.0))
mouth.append (pos = vec(1.5, -0.5, 0.0))

ring(axis=vec(0, 0, 1), size=vec(0.1, 6.5, 6.5), thickness=.1, color=color.gray(0.75))

ang = 0.05
red_component = 0.001
green_component = 0.0

switcher = 1.0
while True:
    rate(100)
    mouth.rotate (angle = ang, axis = vec(-1.0, 0.0, 0.0), origin = vec(0.0, -1.19, 0.0))
    left_eyebrow.rotate (angle = ang, axis = vec(-1.0, 0.0, 0.0), origin = vec(0.0, 1.36, 0.0))
    right_eyebrow.rotate (angle = ang, axis = vec(-1.0, 0.0, 0.0), origin = vec(0.0, 1.36, 0.0))
    nose.rotate (angle = ang, axis = vec(ang, ang, 1.0))

    if red_component > 0.999: switcher = -1.0
    if red_component < 0.001: switcher = 1.0
    red_component = red_component + switcher * ang
    green_component = green_component + 1.0
    if green_component > red_component: green_component = 0.0
    blue_component = 1.0 - red_component
    nose.color = vec(red_component, green_component, blue_component)
