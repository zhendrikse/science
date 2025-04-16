#Web VPython 3.2

from vpython import canvas, box, color, rate, vec, arrow, slider, label

title = """&#x2022; Based on code shown in <a href="https://www.youtube.com/watch?v=Jq4dVuD9JV0">this video</a> by Jordan Huang
&#x2022; The same code is also presented in <a href="https://www.youtube.com/watch?v=A3MYq3q9pec">this video</a>
&#x2022; Refactored by <a href="https://github.com/zhendrikse/">Zeger Hendrikse</a> to <a href="https://github.com/zhendrikse/science/blob/main/electronics/code/non_ideal_capacitor.py">non_ideal_capacitor.py</a>
&#x2022; The colored background shows the electric potential around the plates
&#x2022; The arrows represent the electric field around the plates

"""

N = 101
h = 1E-2 / (N - 1)

display = canvas(title=title, height=400, width=600, center=vec(N * h / 2, N * h / 2, 0), range=30E-4)
display.lights = []
display.ambient = color.gray(.99)
progress_bar = label(pos=vec(N * h / 2, N * h / 2, 0), canvas=display, text="Progress Laplace solver: ", color=color.red, height=20, box=False)

epsilon = 8.854E-12
L, d = 4E-3, 1E-3
V_0 = 200


# A ChatGPT generated equivalent of the Numpy gradient() function
def gradient_2d(array_):

    # Calculate the gradient in the x-direction (along columns)
    # Forward difference for the first column
    grad_y = [[(array_[i][1] - array_[i][0]) for i in range(len(array_))]]  # Gradient in the x-direction (columns)

    # Central difference for the middle columns
    for i in range(1, len(array_) - 1):
        grad_y.append([(array_[i][j + 1] - array_[i][j - 1]) / 2 for j in range(1, len(array_[i]) - 1)])

    # Backward difference for the last column
    grad_y.append([(array_[i][-1] - array_[i][-2]) for i in range(len(array_))])

    # Calculate the gradient in the y-direction (along rows)
    # Forward difference for the first row
    grad_x = [[(array_[1][j] - array_[0][j]) for j in range(len(array_[0]))]]  # Gradient in the y-direction (rows)

    # Central difference for the middle rows
    for i in range(1, len(array_) - 1):
        grad_x.append([(array_[i + 1][j] - array_[i - 1][j]) / 2 for j in range(len(array_[i]))])

    # Backward difference for the last row
    grad_x.append([(array_[-1][j] - array_[-2][j]) for j in range(len(array_[-1]))])

    return grad_x, grad_y

###############
# Fast solver with NumPy but unavailable in Glowscript
import numpy as np
def solve_laplacian_numpy(u, u_cond, iterations=5000):
    V = np.array(u)
    for i in range(iterations):
        V[u_cond] = u[u_cond]
        V[1:-1, 1:-1] = .25 * (V[0:-2, 1:-1] + V[2:, 1:-1] + V[1:-1, 0:-2] + V[1:-1, 2:])
    return V

def get_field(V, h):
    E_x, E_y = np.gradient(V)
    return -E_x / h, -E_y / h
###############

def solve_laplacian(u, u_cond, iterations=5000):
    V = [row[:] for row in u]  # Make a deep copy of u to V

    for i in range(iterations):
        if i % 250:
            rate(10000)
            progress_bar.text="Progress Laplace solver: " + str(i // 50) + "%"

        # Apply boundary conditions (u_cond tells where to keep u fixed)
        for i in range(N):
            for j in range(N):
                V[i][j] = u[i][j] if u_cond[i][j] else V[i][j]

        # Iterate over the interior grid points
        for r in range(1, len(u) - 1):
            for c in range(1, len(u[0]) - 1):
                V[r][c] = 0.25 * (V[r - 1][c] + V[r + 1][c] + V[r][c - 1] + V[r][c + 1])

    return V

def field_values_from_gradients(gradients):
    field = [[0. for _ in range(N)] for _ in range(N)]
    for i in range(len(gradients)):
        for j in range(len(gradients[i])):
            field[i][j] = -gradients[i][j] / h
    return field


u = [[0. for _ in range(N)] for _ in range(N)]
for i in range(N // 2 - int(L / h / 2),  N // 2 + int(L / h / 2)):
    u[i][N // 2 - int(d / h /2)] = -V_0 / 2
    u[i][N // 2 + int(d / h /2)] =  V_0 / 2

u_cond = [[u[i][j] != 0 for j in range(N)] for i in range(N)]
potential_field = solve_laplacian(u, u_cond)
gradient_x, gradient_y = gradient_2d(potential_field)
e_x, e_y = field_values_from_gradients(gradient_x), field_values_from_gradients(gradient_y)

#
# Plot capacitor, potential, and electric field
#
progress_bar.visible = False
field_arrows = []
for i in range(N):
    for j in range(N):
        field_arrows.append(arrow(pos=vec(i * h, j * h, 0), axis=.5 * 1E-9 * vec(e_x[i][j], e_y[i][j], 0), shaftwidth=h / 6, color=color.black))

for i in range(N):
    for j in range(N):
        point = box(pos=vec(i * h, j * h, 0), length=h, height=h, width=h / 10, color=vec(potential_field[i][j] + 100, 100 - potential_field[i][j], 0) / 200)

box(pos=vec(N * h / 2, N * h / 2 - d / 2 - h, 0), length=L, height=h / 5, width=h)
box(pos=vec(N * h / 2, N * h / 2 + d / 2 - h, 0), length=L, height=h / 5, width=h)

dA = h * h
flux_x = flux_y = 0

for i in range(25, 76):
    flux_y += (e_y[i][N // 2 + int(d / h)] - e_y[i][N // 2]) * dA
for j in range(N // 2, N // 2 + int(d/h) + 1):
    flux_x += (e_x[76][j] - e_x[25][j]) * dA

Q_inside = (flux_x + flux_y) * epsilon
C_non_ideal = Q_inside / V_0

#
# GUI controls
#
def scale_arrows(event):
    for i in range(N):
        for j in range(N):
            field_arrows[i * N + j].axis = event.value * 1E-9 * vec(e_x[i][j], e_y[i][j], 0)

display.append_to_caption("\nSize of field arrows:")
_ = slider(min=0, max=1, value=0.5, bind=scale_arrows)

display.append_to_caption("\n\n$C_\\text{notideal}: ", C_non_ideal, "F$")
display.append_to_caption("\n\n$C_\\text{ideal}   : ", epsilon * L *  h / d, "F$")

#MathJax.Hub.Queue(["Typeset", MathJax.Hub])
while True:
    rate(10)
