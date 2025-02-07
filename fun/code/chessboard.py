#Web VPython 3.2

from vpython import cone, box, rate, vec, color, cylinder, canvas, sphere

title = """&#x2022; Based on <a href="https://vpython.org/contents/contributed/chessboard.py">chessboard.py</a> by Shaun Press
&#x2022; Refactored by <a href="https://www.hendrikse.name/">Zeger Hendrikse</a>

"""
animation = canvas(title=title, background=color.gray(0.075), center = vec(3.5, 0, 3.5), forward=vec(0, -0.636537, -0.771246))

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

class Piece:
    def __init__(self, base, top=None, base_offset=vec(0, 0, 0), top_offset=vec(0, 0, 0)):
        self._base = base
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
        """Makes more complex shapes invisible"""
        if hasattr(self._base, 'objects'):
            for obj in self._base.objects:
                obj.visible = state
        else:
            self._base.visible = state

    def colour(self):
        return self._base.color

    def type(self):
        if type(self._base) is cone:
            return "PAWN"
        elif type(self._base) is box:
            return "KNIGHT"
        else:
            if not self._has_top():
                return "ROOK"
            elif type(self._top) is cone:
                return "BISHOP"
            elif type(self._top) is box:
                return "KING"
            else:
                return "QUEEN"

class Pawn(Piece):
    def __init__(self, spos, colour):
        Piece.__init__(self, cone(pos=spos, radius=0.4, axis=vec(0, 1, 0), color=colour))

class Rook(Piece):
    def __init__(self, spos, colour):
        Piece.__init__(self, cylinder(pos=spos, radius=0.4, length=1, axis=vec(0, 1, 0), color=colour))


class Knight(Piece):
    def __init__(self, spos, colour):
        base = box(pos=spos, width=0.4, length=0.8, height=0.4, axis=vec(0, 1, 0), color=colour)
        top = cone(pos=spos, radius=0.2, axis=vec(0, 1, 0), color=colour)
        Piece.__init__(self, base, top, vec(0, .3, 0), vec(0, 0.6, 0))


class Bishop(Piece):
    def __init__(self, spos, colour):
        base = cylinder(pos=spos, radius=0.2, length=0.8, axis=vec(0, 1, 0), color=colour)
        top = cone(pos=spos, radius=0.2, axis=vec(0, 1, 0), color=colour)
        Piece.__init__(self, base, top, top_offset=vec(0, 0.8, 0))


class Queen(Piece):
    def __init__(self, spos, colour):
        base = cylinder(pos=spos, radius=0.4, length=1.0, axis=vec(0, 1, 0), color=colour)
        top = sphere(radius=0.4, pos=spos, color=colour)
        Piece.__init__(self, base, top, top_offset= + vec(0, 1.4, 0))


class King(Piece):
    def __init__(self, spos, colour):
        base = cylinder(pos=spos, radius=0.4, length=1.2, axis=vec(0, 1, 0), color=colour)
        top = box(height=0.6, width=0.6, length=0.6, pos=spos, color=colour)
        Piece.__init__(self, base, top, top_offset=vec(0, 1.5, 0))


class Board:
    def __init__(self):
        self.squares = []
        for i in range(64):
            self.squares.append(None)
        self._make_board()
        self._place_pieces()

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
            to_piece.setvisible(0)
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
        wp = len(self._pieces("PAWN", color.white))
        bp = len(self._pieces("PAWN", color.blue))
        wn = len(self._pieces("KNIGHT", color.white))
        bn = len(self._pieces("KNIGHT", color.blue))
        wb = len(self._pieces("BISHOP", color.white))
        bb = len(self._pieces("BISHOP", color.blue))
        wr = len(self._pieces("ROOK", color.white))
        br = len(self._pieces("ROOK", color.blue))
        wq = len(self._pieces("QUEEN", color.white))
        bq = len(self._pieces("QUEEN", color.blue))

        material = 100 * (wp - bp) + 300 * (wn - bn) + 300 * (wb - bb) + 500 * (wr - br) + 900 * (wq - bq)

        pawn_sum = sum([PAWN_TABLE[i] for i in self._pieces("PAWN", color.white)])
        pawn_sum = pawn_sum + sum([-PAWN_TABLE[self._square_mirror(i)] for i in self._pieces("PAWN", color.blue)])
        knight_sum = sum([KNIGHTS_TABLE[i] for i in self._pieces("KNIGHT", color.white)])
        knight_sum = knight_sum + sum(
            [-KNIGHTS_TABLE[self._square_mirror(i)] for i in self._pieces("KNIGHT", color.blue)])
        bishop_sum = sum([BISHOPS_TABLE[i] for i in self._pieces("BISHOP", color.white)])
        bishop_sum = bishop_sum + sum(
            [-BISHOPS_TABLE[self._square_mirror(i)] for i in self._pieces("BISHOP", color.blue)])
        rook_sum = sum([ROOKS_TABLE[i] for i in self._pieces("ROOK", color.white)])
        rook_sum = rook_sum + sum([-ROOKS_TABLE[self._square_mirror(i)] for i in self._pieces("ROOK", color.blue)])
        queens_sum = sum([QUEENS_TABLE[i] for i in self._pieces("QUEEN", color.white)])
        queens_sum = queens_sum + sum(
            [-QUEENS_TABLE[self._square_mirror(i)] for i in self._pieces("QUEEN", color.blue)])
        kings_sum = sum([KINGS_TABLE[i] for i in self._pieces("KING", color.white)])
        kings_sum = kings_sum + sum([-KINGS_TABLE[self._square_mirror(i)] for i in self._pieces("KING", color.blue)])

        board_value = material + pawn_sum + knight_sum + bishop_sum + rook_sum + queens_sum + kings_sum
        return board_value

    def _determine_best_move(self, is_white, depth = 3):
        """Given a board, determines the best move.

        Args:
            board (chess.Board): A chess board.
            is_white (bool): Whether the particular move is for white or black.
            depth (int, optional): The number of moves looked ahead.

        Returns:
            chess.Move: The best predicated move.
        """

        best_move = -100000 if is_white else 100000
        best_final = None
        for move in board.legal_moves:
            board.push(move)
            value = self._minimax_helper(depth - 1, -10000, 10000, not is_white)
            board.pop()
            if (is_white and value > best_move) or (not is_white and value < best_move):
                best_move = value
                best_final = move
        return best_final

    def _minimax_helper(self, depth, alpha, beta, is_maximizing):
        if depth <= 0 or board.is_game_over():
            return self.evaluate()

        if is_maximizing:
            best_move = -100000
            for move in board.legal_moves:
                board.push(move)
                value = self._minimax_helper(depth - 1, alpha, beta, False)
                board.pop()
                best_move = max(best_move, value)
                alpha = max(alpha, best_move)
                if beta <= alpha:
                    break
            return best_move
        else:
            best_move = 100000
            for move in board.legal_moves:
                board.push(move)
                value = self._minimax_helper(depth - 1, alpha, beta, True)
                board.pop()
                best_move = min(best_move, value)
                beta = min(beta, best_move)
                if beta <= alpha:
                    break
            return best_move

my_board = Board()
print(my_board.evaluate())
my_board.parse_string('b1c3')
print(my_board.evaluate())

while True:
    rate(10)


# class console_colors:
#     HEADER = '\033[95m'
#     OKBLUE = '\033[94m'
#     OKCYAN = '\033[96m'
#     OKGREEN = '\033[92m'
#     WARNING = '\033[93m'
#     FAIL = '\033[91m'
#     ENDC = '\033[0m'
#     BOLD = '\033[1m'
#     UNDERLINE = '\033[4m'
#
#
# print(console_colors.HEADER + f'==================================================' + console_colors.ENDC)
# print(console_colors.HEADER + f'                   Chess Engine                   ' + console_colors.ENDC)
# print(console_colors.HEADER + f'==================================================' + console_colors.ENDC)
# print()
#
# is_white = input(console_colors.OKBLUE + 'Will you be playing as white or black (white/black)? ' + console_colors.ENDC).lower()[0] == "w"
#
# my_board = Board()
# print()
# print(console_colors.HEADER + f'= Board State =' + console_colors.ENDC)
# print(my_board)
#
# if is_white:
#     while not my_board.is_game_over():
#         print()
#         while True:
#             try:
#                 move = my_board.parse_san(input(console_colors.OKGREEN + 'Enter your move: ' + console_colors.ENDC))
#             except ValueError:
#                 print(console_colors.FAIL + f'That is not a valid move!' + console_colors.ENDC)
#                 continue
#             break
#         my_board.push(move)
#
#         move = my_board._determine_best_move(False)
#         my_board.push(move)
#
#         print()
#         print(console_colors.FAIL + f'Black made the move: {move}' + console_colors.ENDC)
#         print()
#         print(console_colors.HEADER + f'= Board State =' + console_colors.ENDC)
#         print(my_board)
#         print()
# else:
#     while not my_board.is_game_over():
#         move = my_board._determine_best_move(True)
#         my_board.push(move)
#
#         print()
#         print(console_colors.FAIL + f'White made the move: {move}' + console_colors.ENDC)
#         print()
#         print(console_colors.HEADER + f'= Board State =' + console_colors.ENDC)
#         print(my_board)
#
#         print()
#         while True:
#             try:
#                 move = my_board.parse_san(input(console_colors.OKGREEN + 'Enter your move: ' + console_colors.ENDC))
#             except ValueError:
#                 print(console_colors.FAIL + f'That is not a valid move!' + console_colors.ENDC)
#                 continue
#             break
#         my_board.push(move)
#
# print(console_colors.HEADER + f'The game is over!' + console_colors.ENDC)
