from enum import Enum
import sys

class PieceType(Enum):
    PAWN = 0
    ROOK = 1
    KNIGHT = 2
    BISHOP = 3
    KING = 4
    QUEEN = 7

class Color(Enum):
    WHITE = 0
    BLACK = 1

class Piece:
    def __init__(self, type: PieceType, color: Color):
        self.type = type
        self.color = color

def shorthand_to_coords(s: str) -> (int, int):
    return (ord(s[0]) - ord('A'), int(s[1]))

def index(pos: (int, int)) -> int:
    return pos[0] + pos[1] * 8

class Board:
    def __init__(self):
        self.boards = [None for i in range(8 * 8)]

class ChessGame:
    def __init__(self):
        self.board = Board()

    def setup_board(self):
        # white pieces
        self.place_piece(PieceType.PAWN, "A2", Color.WHITE);
        self.place_piece(PieceType.PAWN, "B2", Color.WHITE);
        self.place_piece(PieceType.PAWN, "C2", Color.WHITE);
        self.place_piece(PieceType.PAWN, "D2", Color.WHITE);
        self.place_piece(PieceType.PAWN, "E2", Color.WHITE);
        self.place_piece(PieceType.PAWN, "F2", Color.WHITE);
        self.place_piece(PieceType.PAWN, "G2", Color.WHITE);
        self.place_piece(PieceType.PAWN, "H2", Color.WHITE);

        self.place_piece(PieceType.ROOK, "A1", Color.WHITE);
        self.place_piece(PieceType.KNIGHT, "B1", Color.WHITE);
        self.place_piece(PieceType.BISHOP, "C1", Color.WHITE);
        self.place_piece(PieceType.KING, "D1", Color.WHITE);
        self.place_piece(PieceType.QUEEN, "E1", Color.WHITE);
        self.place_piece(PieceType.BISHOP, "F1", Color.WHITE);
        self.place_piece(PieceType.KNIGHT, "G1", Color.WHITE);
        self.place_piece(PieceType.ROOK, "H1", Color.WHITE);

        # black pieces
        self.place_piece(PieceType.PAWN, "A7", Color.BLACK);
        self.place_piece(PieceType.PAWN, "B7", Color.BLACK);
        self.place_piece(PieceType.PAWN, "C7", Color.BLACK);
        self.place_piece(PieceType.PAWN, "D7", Color.BLACK);
        self.place_piece(PieceType.PAWN, "E7", Color.BLACK);
        self.place_piece(PieceType.PAWN, "F7", Color.BLACK);
        self.place_piece(PieceType.PAWN, "G7", Color.BLACK);
        self.place_piece(PieceType.PAWN, "H7", Color.BLACK);

        self.place_piece(PieceType.ROOK, "A8", Color.BLACK);
        self.place_piece(PieceType.KNIGHT, "B8", Color.BLACK);
        self.place_piece(PieceType.BISHOP, "C8", Color.BLACK);
        self.place_piece(PieceType.KING, "D8", Color.BLACK);
        self.place_piece(PieceType.QUEEN, "E8", Color.BLACK);
        self.place_piece(PieceType.BISHOP, "F8", Color.BLACK);
        self.place_piece(PieceType.KNIGHT, "G8", Color.BLACK);
        self.place_piece(PieceType.ROOK, "H8", Color.BLACK);

    def place_piece(type: PieceType, coords: str, color: Color):
        self.board[index(shorthand_to_coords(coords))] = Piece(type, color)

    async def on_message(self, consumer, data):
        print(data, file=sys.stderr)
