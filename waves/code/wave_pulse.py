# GlowScript 3.2 VPython

# Rhett Allain
# https://trinket.io/glowscript/7c2c33e142d5?e=1

from vpython import *

def maxxy(stuff):
    ymax = 0
    xmax = 0
    for bb in stuff:
        if bb.pos.y > ymax:
            ymax = bb.pos.y
            xmax = bb.pos.x
    return (xmax)


g1 = graph(title="Wave String", xtitle="t [s]", ytitle="wave pulse x [m]", width=600, height=300, fast=False)
f1 = gcurve(color=color.blue)

####parameters and stuff
L = 1.2
M = .025
K = 1.64  # total spring constant (in theory)

N = 34  # number of masses
k = K * (N - 1)

w = 45  # angular frenquency of pulse
A = 0.06  # pulse amplitude
tp = pi / w  # one half wave time for wave
b = 0.5 * 0

leftend = vector(-L / 2, 0, 0)
rightend = leftend + vector(L, 0, 0)
ds = vector(1, 0, 0) * L / (N - 1)
R = L / (5 * N)

balls = []

for i in range(N):
    balls = balls + [sphere(pos=leftend + i * ds, radius=R, m=M / N,
                            p=vector(0, 0, 0), F=vector(0, 0, 0))]

springs = []
for i in range(N - 1):
    springs = springs + [cylinder(pos=leftend + i * ds, axis=ds, radius=R / 2)]

L0 = 0.9 * L / (N - 1)

t = 0
dt = 0.0001

Tk = k * (mag(balls[7].pos - balls[8].pos) - L0)
print("T calc = ", Tk, " N")

while t < .32:
    rate(500)
    if t < tp:
        balls[0].pos = leftend + A * sin(w * t) * vector(0, 1, 0)
    else:
        balls[0].pos = leftend
    for i in range(1, N - 1):
        balls[i].F = -k * (mag(springs[i - 1].axis) - L0) * norm(springs[i - 1].axis) + k * (
                    mag(springs[i].axis) - L0) * norm(springs[i].axis) - b * balls[i].p

    for ball in balls:
        ball.p = ball.p + ball.F * dt
        ball.pos = ball.pos + ball.p * dt / ball.m

    for i in range(1, N):
        springs[i - 1].axis = balls[i].pos - balls[i - 1].pos
        springs[i - 1].pos = balls[i - 1].pos
    f1.plot(t, maxxy(balls))
    t = t + dt




