#Web VPython 3.2

from vpython import cone, box, rate, vec, color, cylinder, canvas, sphere

title = """&#x2022; Based on <a href="https://vpython.org/contents/contributed/chessboard.py">chessboard.py</a> by Shaun Press
&#x2022; Refactored by <a href="https://www.hendrikse.name/">Zeger Hendrikse</a>

"""
animation = canvas(title=title, background=color.gray(0.075), center = vec(3.5, 0, 3.5), forward=vec(0, -0.636537, -0.771246))

class Piece:
    def __init__(self):
        self.base = None

    def move(self, newPos):
        self.base.pos = newPos

    def set_visible(self, state):
        """Makes more complex shapes invisible"""
        if hasattr(self.base, 'objects'):
            for obj in self.base.objects:
                obj.visible = state
        else:
            self.base.visible = state

class Pawn(Piece):
    def __init__(self, spos, sColor):
        Piece.__init__(self)
        self.base = cone(pos=spos, radius=0.4, axis=vec(0, 1, 0), color=sColor)

class Rook(Piece):
    def __init__(self, spos, sColor):
        Piece.__init__(self)
        self.base = cylinder(pos=spos, radius=0.4, length=1, axis=vec(0, 1, 0), color=sColor)


class Knight(Piece):
    def __init__(self, spos, sColor):
        Piece.__init__(self)
        self.base = box(pos=spos + vec(0, .3, 0), width=0.4, length=0.8, height=0.4, axis=vec(0, 1, 0), color=sColor)
        cone(pos=spos + vec(0, 0.6, 0), radius=0.2, axis=vec(0, 1, 0), color=sColor)


class Bishop(Piece):
    def __init__(self, spos, sColor):
        Piece.__init__(self)
        self.base = cylinder(pos=spos, radius=0.2, length=0.8, axis=vec(0, 1, 0), color=sColor)
        cone(pos=spos + vec(0, 0.8, 0), radius=0.2, axis=vec(0, 1, 0), color=sColor)


class Queen(Piece):
    def __init__(self, spos, sColor):
        Piece.__init__(self)
        self.base = cylinder(pos=spos, radius=0.4, length=1.0, axis=vec(0, 1, 0), color=sColor)
        sphere(radius=0.4, pos=spos + vec(0, 1.4, 0), color=sColor)


class King(Piece):
    def __init__(self, spos, sColor):
        Piece.__init__(self)
        self.base = cylinder(pos=spos, radius=0.4, length=1.2, axis=vec(0, 1, 0), color=sColor)
        box(height=0.6, width=0.6, length=0.6, pos=spos + vec(0, 1.5, 0), color=sColor)


class Board:
    """Class for chess board and pieces"""

    def __init__(self):
        """Builds board and places pieces"""
        self.squares = []
        for i in range(64):
            self.squares.append(None)
        self.make_board()
        self.place_pieces()

    def add_piece(self, x, y, piece):
        self.squares[y * 8 + x] = piece

    def move_piece(self, fx, fy, tx, ty):
        """
        Takes pice from square fx,fy and moves to tx,ty
        Checks if piece exists on square
        """
        piece = self.squares[fy * 8 + fx]
        if piece is None:
            print('eh?')
            return
        to_piece = self.squares[ty * 8 + tx]
        if to_piece is not None:
            to_piece.setvisible(0)
        piece.move(vec(tx, 0, ty))
        self.squares[ty * 8 + tx] = piece
        self.squares[fy * 8 + fx] = None

    def parse_string(self, pMove):
        """
        Accepts input in long algebraic ie e2e4
        Columns are a-h, rows are 1-8
        Bottom left square is a1 top right h9 etc
        """
        fx = 7 - (ord(pMove[0]) - ord('a'))
        fy = ord(pMove[1]) - ord('1')
        tx = 7 - (ord(pMove[2]) - ord('a'))
        ty = ord(pMove[3]) - ord('1')
        self.move_piece(fx, fy, tx, ty)

    def make_board(self):
        for i in range(8):
            for j in range(8):
                if (i + j) % 2 == 1:
                    sColor = color.blue
                else:
                    sColor = color.white
                box(pos=vec(i, -0.1, j), length=1, height=0.1, width=1, color=sColor)

    def place_pieces(self):
        for i in range(8):
            self.add_piece(i, 1, Pawn(vec(i, 0, 1), color.white))
            self.add_piece(i, 6, Pawn(vec(i, 0, 6), color.red))

        self.add_piece(0, 0, Rook(vec(0, 0, 0), color.white))
        self.add_piece(7, 0, Rook(vec(7, 0, 0), color.white))
        self.add_piece(0, 7, Rook(vec(0, 0, 7), color.red))
        self.add_piece(7, 7, Rook(vec(7, 0, 7), color.red))
        self.add_piece(1, 0, Knight(vec(1, 0, 0), color.white))
        self.add_piece(6, 0, Knight(vec(6, 0, 0), color.white))
        self.add_piece(1, 7, Knight(vec(1, 0, 7), color.red))
        self.add_piece(6, 7, Knight(vec(6, 0, 7), color.red))
        self.add_piece(2, 0, Bishop(vec(2, 0, 0), color.white))
        self.add_piece(5, 0, Bishop(vec(5, 0, 0), color.white))
        self.add_piece(2, 7, Bishop(vec(2, 0, 7), color.red))
        self.add_piece(5, 7, Bishop(vec(5, 0, 7), color.red))
        self.add_piece(4, 0, Queen(vec(4, 0, 0), color.white))
        self.add_piece(4, 7, Queen(vec(4, 0, 7), color.red))
        self.add_piece(3, 0, King(vec(3, 0, 0), color.white))
        self.add_piece(3, 7, King(vec(3, 0, 7), color.red))


thisBoard = Board()
# example move
thisBoard.parse_string('e2e4')

while True:
    rate(10)
