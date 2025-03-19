#Web VPython 3.2

from vpython import vector, canvas, sphere, simple_sphere, color, label, arrow, pi, cos, sin, vec, arange, rate, slider

title = """&#x2022; Original <a href="https://www.visualrelativity.com/vpython/doppler-wavefront.py">doppler-Wavefront.py</a> by <a href="http://physics.syr.edu/~salgado/">Rob Salgado</a> (salgado@physics.syr.edu)
&#x2022; Updated by <a href="https://www.hendrikse.name/">Zeger Hendrikse</a> to <a href="https://github.com/zhendrikse/science/blob/main/waves/code/doppler_effect.py">doppler_effect.py</a>

"""

vs = 0.20  # velocity of the source
vr = -0.30  # velocity of the receiver
vw = 0.10  # velocity of the wind

scale_factor = 5

display = canvas(background=color.gray(0.075), title=title)
display.autoscale = False

source = sphere(radius=0.2, pos=vector(0, 0, 0), vel=vector(vs, 0, 0), color=color.red)
receiver = sphere(radius=0.2, pos=vector(3, 0, 0), vel=vector(vr, 0, 0), color=color.green)
diffx = receiver.pos.x - source.pos.x
if diffx == 0:
    signdiffx = 0
elif diffx == abs(diffx):
    signdiffx = 1
else:
    signdiffx = -1
wind_velocity_vector = vector(vw, 0, 0)

nudge = vector(0, 6, 0)
nudgev = vector(0, 0.5, 0)

velocity_source_arrow = arrow(pos=source.pos + nudge, axis=5 * vector(vs, 0, 0), fixedwidth=1, shaftwidth=0.1, color=source.color)
velocity_receiver_arrow = arrow(pos=receiver.pos + nudge - nudgev, axis=5 * vector(vr, 0, 0), fixedwidth=1, shaftwidth=0.1, color=receiver.color)
velocity_wind_arrow = arrow(pos=nudge + 2 * vector(0, 1, 0), axis=5 * vector(vw, 0, 0), fixedwidth=1, shaftwidth=0.1, color=color.cyan)

velocity_source_label = label(pos=velocity_source_arrow.pos + nudge, text="{:.2f}".format(vs), color=source.color, box=1)
velocity_receiver_label = label(pos=velocity_receiver_arrow.pos - nudgev, text="{:.2f}".format(vr), color=receiver.color)
velocity_wind_label = label(pos=velocity_wind_arrow.pos + vector(0, 1, 0), text="Wind speed={:.2f}".format(vw), color=velocity_wind_arrow.color)

tmax = 12.
dt = 0.005
N = 32

ball = []
ball0flag = []
sourcelabel = []
receivedlabel = []


def new_wave(t):
    ball0flag.append(0)
    sphere(radius=0.05, pos=source.pos, color=vec(.5, 0, 0))
    sphere(radius=0.05, pos=receiver.pos, color=vec(0, .5, 0))

    for i in range(N):
        theta = 2 * pi * i / float(N)
        ball.append(simple_sphere(radius=0.1, pos=source.pos, vel=vector(cos(theta), sin(theta), 0)))
    sourcelabel.append(label(pos=ball[N * (len(ball0flag) - 1) + 3 * N // 4].pos, text="{:.2f}".format(t),
                             color=source.color, linecolor=source.color))


def meeting(t):
    global signdiffx
    label(pos=source.pos + nudge - nudgev / 2.0, text="{:.2f}".format(t), color=color.white, linecolor=color.white)
    # print  "(%4.2f)" %t
    signdiffx = 2


def modify_velocity_source(event):
    velocity_source_arrow.axis = scale_factor * vector(event.value, 0, 0)
    velocity_source_label.text = "velocity=" + str(event.value)
    source.vel = vector(event.value, 0, 0)


def modify_velocity_receiver(event):
    velocity_receiver_arrow.axis = scale_factor * vector(-event.value, 0, 0)
    velocity_receiver_label.text = "velocity=" + str(-event.value)
    receiver.vel = vector(-event.value, 0, 0)


def modify_wind_speed(event):
    global wind_velocity_vector
    velocity_wind_label.text = "wind speed = " + str(event.value)
    velocity_wind_arrow.axis = scale_factor * vector(event.value, 0, 0)
    wind_velocity_vector = vector(event.value, 0, 0)


display.append_to_caption("\nWind speed:")
_ = slider(min=0, max=1, value=.1, bind=modify_wind_speed)

display.append_to_caption("\n\nVelocity source:")
_ = slider(min=0, max=1, value=.2, bind=modify_velocity_source)

display.append_to_caption("\n\nVelocity receiver:")
_ = slider(min=0, max=1, value=.3, bind=modify_velocity_receiver)

def on_mouse_click():
    # newPick = scene.mouse(pick=sphere)
    newPick = display.mouse.project(normal=vec(0, 1, 0), point=vec(0, 2, 0))
    if not newPick is None:
        #temp_color = newPick.color
        #newPick.color = color.yellow
        # pick_r=newPick.x*4.
        # string= "r=%7.5f" % pick_r
        # label(pos=newPick.pos,text=string,xoffset=-5,yoffset=5)

        target = newPick
        step = (target - display.center) / 20.
        for _ in arange(1, 20, 1):
            rate(10)
            display.center += step
            display.range /= 1.037  # (1.037**19=1.99)
        #newPick.color = temp_color


display.bind('click', on_mouse_click)

# print "successive wave fronts received at time..."
new_wave(0)
told = 0
# clock=label()
for t in arange(0, tmax + dt, dt):
    rate(100)

    #    clock.text="%f" % (t%1.0)
    if t % 1.0 < told % 1.0:
        #        print "t=",t, "len=",len(ball)
        new_wave(t)

    told = t

    if signdiffx == 0:
        if abs(receiver.pos.x - source.pos.x) > 0: meeting(t)
    elif signdiffx == 1:
        if (receiver.pos.x - source.pos.x) <= 0: meeting(t)
    elif signdiffx == -1:
        if (receiver.pos.x - source.pos.x) >= 0: meeting(t)

    for i in arange(len(ball)):
        ball[i].pos += (ball[i].vel + wind_velocity_vector) * dt
    source.pos += source.vel * dt
    receiver.pos += receiver.vel * dt

    velocity_source_arrow.pos = source.pos + nudge
    velocity_receiver_arrow.pos = receiver.pos + nudge - nudgev

    velocity_source_label.pos = velocity_source_arrow.pos + nudgev
    velocity_receiver_label.pos = velocity_receiver_arrow.pos - nudgev

    for j in arange(len(ball0flag)):
        sourcelabel[j].pos = ball[N * j + 3 * N // 4].pos
        if ball0flag[j] == 0 and ((source.pos.x <= receiver.pos.x <= ball[N * j].pos.x) or (source.pos.x >= receiver.pos.x > ball[N * j + N // 2].pos.x)):
            ball0flag[j] = 1
            # print "%4.2f" %t
            receivedlabel.append(label(pos=ball[N * j + (N - 3)].pos, text="{:.2f}".format(t), color=receiver.color, linecolor=receiver.color))
        elif ball0flag[j] == 1:
            receivedlabel[j].pos = ball[N * j + (N - 3)].pos
