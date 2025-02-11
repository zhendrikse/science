#Web VPython 3.2

from vpython import cone, box, winput, vec, color, cylinder, canvas, sphere, rate
import chess

title = """&#x2022; Based on <a href="https://vpython.org/contents/contributed/chessboard.py">chessboard.py</a> by Shaun Press
&#x2022; Refactored and extended by <a href="https://www.hendrikse.name/">Zeger Hendrikse</a> to <a href="https://github.com/zhendrikse/science/blob/main/fun/code/chessboard.py">chessboard.py</a>

"""
animation = canvas(title=title, background=color.gray(0.075), center = vec(3.5, 0, 3.5), forward=vec(-0.0011868, -0.666869, 0.745173))

PAWN_TABLE = [
    0,  0,  0,  0,  0,  0,  0,  0,
    50, 50, 50, 50, 50, 50, 50, 50,
    10, 10, 20, 30, 30, 20, 10, 10,
    5,  5, 10, 25, 25, 10,  5,  5,
    0,  0,  0, 20, 20,  0,  0,  0,
    5, -5,-10,  0,  0,-10, -5,  5,
    5, 10, 10,-20,-20, 10, 10,  5,
    0,  0,  0,  0,  0,  0,  0,  0
]

KNIGHTS_TABLE = [
    -50,-40,-30,-30,-30,-30,-40,-50,
    -40,-20,  0,  0,  0,  0,-20,-40,
    -30,  0, 10, 15, 15, 10,  0,-30,
    -30,  5, 15, 20, 20, 15,  5,-30,
    -30,  0, 15, 20, 20, 15,  0,-30,
    -30,  5, 10, 15, 15, 10,  5,-30,
    -40,-20,  0,  5,  5,  0,-20,-40,
    -50,-40,-30,-30,-30,-30,-40,-50
]

BISHOPS_TABLE = [
    -20,-10,-10,-10,-10,-10,-10,-20,
    -10,  0,  0,  0,  0,  0,  0,-10,
    -10,  0,  5, 10, 10,  5,  0,-10,
    -10,  5,  5, 10, 10,  5,  5,-10,
    -10,  0, 10, 10, 10, 10,  0,-10,
    -10, 10, 10, 10, 10, 10, 10,-10,
    -10,  5,  0,  0,  0,  0,  5,-10,
    -20,-10,-10,-10,-10,-10,-10,-20
]

ROOKS_TABLE = [
    0,  0,  0,  0,  0,  0,  0,  0,
    5, 10, 10, 10, 10, 10, 10,  5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    0,  0,  0,  5,  5,  0,  0,  0
]

QUEENS_TABLE = [
    -20,-10,-10, -5, -5,-10,-10,-20,
    -10,  0,  0,  0,  0,  0,  0,-10,
    -10,  0,  5,  5,  5,  5,  0,-10,
    -5,  0,  5,  5,  5,  5,  0, -5,
    0,  0,  5,  5,  5,  5,  0, -5,
    -10,  5,  5,  5,  5,  5,  0,-10,
    -10,  0,  5,  0,  0,  0,  0,-10,
    -20,-10,-10, -5, -5,-10,-10,-20
]

KINGS_TABLE = [
    -50,-40,-30,-20,-20,-30,-40,-50,
    -30,-20,-10,  0,  0,-10,-20,-30,
    -30,-10, 20, 30, 30, 20,-10,-30,
    -30,-10, 30, 40, 40, 30,-10,-30,
    -30,-10, 30, 40, 40, 30,-10,-30,
    -30,-10, 20, 30, 30, 20,-10,-30,
    -30,-30,  0,  0,  0,  0,-30,-30,
    -50,-30,-30,-30,-30,-30,-30,-50
]

class ChessLibrary:
    def __init__(self):
        self.PAWN = chess.PAWN
        self.ROOK = chess.ROOK
        self.KNIGHT = chess.KNIGHT
        self.BISHOP = chess.BISHOP
        self.QUEEN = chess.QUEEN
        self.KING = chess.KING
        self.WHITE = chess.WHITE
        self.BLACK = chess.BLACK

        self._board = chess.Board()

    def is_game_over(self):
        return self._board.is_game_over()

    def parse_san(self, input_):
        return self._board.parse_san(input_)

    def push(self, move):
        return self._board.push(move)

    def legal_moves(self):
        return self._board.legal_moves

    def pop(self):
        return self._board.pop()

    def remove_piece_at(self, square):
        self._board.remove_piece_at(square)

    def pieces(self, piece_type, colour):
        return self._board.pieces(piece_type, colour)


class Piece:
    def __init__(self, type_, base, top=None, base_offset=vec(0, 0, 0), top_offset=vec(0, 0, 0)):
        self._base = base
        self._type = type_
        self._base.pos += base_offset
        self._top = top
        if self._has_top():
            self._top.pos += top_offset

        self._bass_offset = base_offset
        self._top_offset = top_offset

    def _has_top(self):
        return self._top is not None

    def move(self, new_pos):
        self._base.pos = new_pos + self._bass_offset
        if self._has_top():
            self._top.pos = new_pos + self._top_offset

    def set_visible(self, state):
        self._base.visible = state
        if self._has_top():
            self._top.visible = state

    def colour(self):
        return self._base.color

    def type(self):
        return self._type

class Pawn(Piece):
    def __init__(self, spos, colour):
        Piece.__init__(self, "PAWN", cone(pos=spos, radius=0.4, axis=vec(0, 1, 0), color=colour))

class Rook(Piece):
    def __init__(self, spos, colour):
        Piece.__init__(self, "ROOK", cylinder(pos=spos, radius=0.4, length=1, axis=vec(0, 1, 0), color=colour))


class Knight(Piece):
    def __init__(self, spos, colour):
        base = box(pos=spos, width=0.4, length=0.8, height=0.4, axis=vec(0, 1, 0), color=colour)
        top = cone(pos=spos, radius=0.2, axis=vec(0, 1, 0), color=colour)
        Piece.__init__(self, "KNIGHT", base, top, vec(0, .3, 0), vec(0, 0.6, 0))


class Bishop(Piece):
    def __init__(self, spos, colour):
        base = cylinder(pos=spos, radius=0.2, length=0.8, axis=vec(0, 1, 0), color=colour)
        top = cone(pos=spos, radius=0.2, axis=vec(0, 1, 0), color=colour)
        Piece.__init__(self, "BISHOP", base, top, top_offset=vec(0, 0.8, 0))


class Queen(Piece):
    def __init__(self, spos, colour):
        base = cylinder(pos=spos, radius=0.4, length=1.0, axis=vec(0, 1, 0), color=colour)
        top = sphere(radius=0.4, pos=spos, color=colour)
        Piece.__init__(self, "QUEEN", base, top, top_offset= + vec(0, 1.4, 0))


class King(Piece):
    def __init__(self, spos, colour):
        base = cylinder(pos=spos, radius=0.4, length=1.2, axis=vec(0, 1, 0), color=colour)
        top = box(height=0.6, width=0.6, length=0.6, pos=spos, color=colour)
        Piece.__init__(self, "King", base, top, top_offset=vec(0, 1.5, 0))


class Board:
    def __init__(self):
        self.squares = []
        for i in range(64):
            self.squares.append(None)
        self._make_board()
        self._place_pieces()
        self._chess_library = ChessLibrary()

    def add_piece(self, x, y, piece):
        self.squares[y * 8 + x] = piece

    def move_piece(self, fx, fy, tx, ty):
        """
        Takes piece from square fx,fy and moves to tx,ty
        Checks if piece exists on square
        """
        piece = self.squares[fy * 8 + fx]
        if piece is None:
            print('eh?')
            return
        to_piece = self.squares[ty * 8 + tx]

        if to_piece is not None:
            to_piece.set_visible(False)
            self._chess_library.remove_piece_at(tx + 8 * ty)

        piece.move(vec(tx, 0, ty))
        self.squares[ty * 8 + tx] = piece
        self.squares[fy * 8 + fx] = None

    def parse_string(self, move_command):
        """
        Accepts input in long algebraic ie e2e4
        Columns are a-h, rows are 1-8
        Bottom left square is a1 top right h9 etc
        """
        fx = 7 - (ord(move_command[0]) - ord('a'))
        fy = ord(move_command[1]) - ord('1')
        tx = 7 - (ord(move_command[2]) - ord('a'))
        ty = ord(move_command[3]) - ord('1')
        self.move_piece(fx, fy, tx, ty)

    def _make_board(self):
        for i in range(8):
            for j in range(8):
                colour = color.blue if (i + j) % 2 == 1 else color.white
                box(pos=vec(i, -0.1, j), length=1, height=0.1, width=1, color=colour)

    def _pieces(self, type_, colour):
        positions = []
        for i in range(64):
            if self.squares[i] is None: continue
            if self.squares[i].type() == type_ and self.squares[i].colour() == colour:
                positions.append(i)
        return positions

    def _place_pieces(self):
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

    def _square_mirror(self, square):
        """Mirrors the square vertically."""
        return square ^ 0x38

    def evaluate(self):
        wp = len(self._chess_library.pieces(chess.PAWN, chess.WHITE))
        bp = len(self._chess_library.pieces(chess.PAWN, chess.BLACK))
        wn = len(self._chess_library.pieces(chess.KNIGHT, chess.WHITE))
        bn = len(self._chess_library.pieces(chess.KNIGHT, chess.BLACK))
        wb = len(self._chess_library.pieces(chess.BISHOP, chess.WHITE))
        bb = len(self._chess_library.pieces(chess.BISHOP, chess.BLACK))
        wr = len(self._chess_library.pieces(chess.ROOK, chess.WHITE))
        br = len(self._chess_library.pieces(chess.ROOK, chess.BLACK))
        wq = len(self._chess_library.pieces(chess.QUEEN, chess.WHITE))
        bq = len(self._chess_library.pieces(chess.QUEEN, chess.BLACK))

        material = 100 * (wp - bp) + 300 * (wn - bn) + 300 * (wb - bb) + 500 * (wr - br) + 900 * (wq - bq)

        pawn_sum = 0
        for i in self._chess_library.pieces(self._chess_library.PAWN, self._chess_library.WHITE):
            pawn_sum += PAWN_TABLE[i]

        for i in self._chess_library.pieces(self._chess_library.PAWN, self._chess_library.BLACK):
            pawn_sum += -PAWN_TABLE[self._square_mirror(i)]

        knight_sum = 0
        for i in self._chess_library.pieces(self._chess_library.KNIGHT, self._chess_library.WHITE):
            knight_sum += KNIGHTS_TABLE[i]

        for i in self._chess_library.pieces(self._chess_library.KNIGHT, self._chess_library.BLACK):
            knight_sum += -KNIGHTS_TABLE[self._square_mirror(i)]

        bishop_sum = 0
        for i in self._chess_library.pieces(self._chess_library.BISHOP, self._chess_library.WHITE):
            bishop_sum += BISHOPS_TABLE[i]

        for i in self._chess_library.pieces(self._chess_library.BISHOP, self._chess_library.BLACK):
            bishop_sum += -BISHOPS_TABLE[self._square_mirror(i)]

        rook_sum = 0
        for i in self._chess_library.pieces(self._chess_library.ROOK, self._chess_library.WHITE):
            rook_sum += ROOKS_TABLE[i]

        for i in self._chess_library.pieces(self._chess_library.ROOK, self._chess_library.BLACK):
            rook_sum += -ROOKS_TABLE[self._square_mirror(i)]

        queens_sum = 0
        for i in self._chess_library.pieces(self._chess_library.QUEEN, self._chess_library.WHITE):
            queens_sum += QUEENS_TABLE[i]

        for i in self._chess_library.pieces(self._chess_library.QUEEN, self._chess_library.BLACK):
            queens_sum += -QUEENS_TABLE[self._square_mirror(i)]

        kings_sum = 0
        for i in self._chess_library.pieces(self._chess_library.KING, self._chess_library.WHITE):
            kings_sum += KINGS_TABLE[i]

        for i in self._chess_library.pieces(self._chess_library.KING, self._chess_library.BLACK):
            kings_sum += -KINGS_TABLE[self._square_mirror(i)]

        boardvalue = material + pawn_sum + knight_sum + bishop_sum + rook_sum + queens_sum + kings_sum
        return boardvalue

    def determine_best_move(self, is_white, depth=3):
        best_move = -100000 if is_white else 100000
        best_final = None
        for move in self._chess_library.legal_moves():
            self._chess_library.push(move)
            value = self._minimax_helper(depth - 1, -10000, 10000, not is_white)
            self._chess_library.pop()
            if (is_white and value > best_move) or (not is_white and value < best_move):
                best_move = value
                best_final = move
        return best_final

    def _minimax_helper(self, depth, alpha, beta, is_maximizing):
        if depth <= 0 or self._chess_library.is_game_over():
            return self.evaluate()

        if is_maximizing:
            best_move = -100000
            for move in self._chess_library.legal_moves():
                self._chess_library.push(move)
                value = self._minimax_helper(depth - 1, alpha, beta, False)
                self._chess_library.pop()
                best_move = max(best_move, value)
                alpha = max(alpha, best_move)
                if beta <= alpha:
                    break
            return best_move
        else:
            best_move = 100000
            for move in self._chess_library.legal_moves():
                self._chess_library.push(move)
                value = self._minimax_helper(depth - 1, alpha, beta, True)
                self._chess_library.pop()
                best_move = min(best_move, value)
                beta = min(beta, best_move)
                if beta <= alpha:
                    break
            return best_move

    def is_game_over(self):
        return self._chess_library.is_game_over()

    def parse_san(self, input):
        return self._chess_library.parse_san(input)

    def push(self, move):
        self._chess_library.push(move)


my_board = Board()

def handle_user_move(event):
    try:
        user_move = event.text
        move = my_board.parse_san(user_move)
        my_board.push(move)
        my_board.parse_string(user_move)
        user_input.text = ""

        move = my_board.determine_best_move(False)
        my_board.push(move)
        my_board.parse_string(str(move))
    except ValueError:
        pass # Silently ignore garbage input

animation.append_to_caption("\nUser move: ")
user_input = winput(bind=handle_user_move, type="string")

while True:
    rate(10)

