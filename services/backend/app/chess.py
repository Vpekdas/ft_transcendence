from enum import Enum
import sys
import json

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
        self.has_moved = False
        self.available_moves = []

def shorthand_to_coords(s: str) -> (int, int):
    return (ord(s[0]) - ord('A'), int(s[1]) - 1)

def shorthand_to_index(s: str) -> int:
    return coords_to_index(shorthand_to_coords(s))

def coords_to_index(pos: (int, int)) -> int:
    return pos[0] + pos[1] * 8

def coords_to_shorthand(pos: (int, int)) -> str:
    return chr(ord('A') + pos[0]) + str(pos[1] + 1)

def is_valid(x: int, y: int) -> bool:
    return x >= 0 and x <= 7 and y >= 0 and y <= 7

class Board:
    def __init__(self):
        self.tiles: list[Piece] = [None for i in range(8 * 8)]

    def get(self, x: int, y: int) -> Piece:
        return self.tiles[x + y * 8]

class Side:
    def __init__(self, consumer):
        self.consumer = consumer
        # Piece taken by this side.
        self.pieces: list[Piece] = []

class ChessGame:
    def __init__(self):
        self.board = Board()
        self.white: Side = None
        self.black: Side = None

        self.setup_board()

    def setup_board(self):
        # white pieces
        self.place_piece(PieceType.PAWN, "A2", Color.WHITE)
        self.place_piece(PieceType.PAWN, "B2", Color.WHITE)
        self.place_piece(PieceType.PAWN, "C2", Color.WHITE)
        self.place_piece(PieceType.PAWN, "D2", Color.WHITE)
        self.place_piece(PieceType.PAWN, "E2", Color.WHITE)
        self.place_piece(PieceType.PAWN, "F2", Color.WHITE)
        self.place_piece(PieceType.PAWN, "G2", Color.WHITE)
        self.place_piece(PieceType.PAWN, "H2", Color.WHITE)

        self.place_piece(PieceType.ROOK, "A1", Color.WHITE)
        self.place_piece(PieceType.KNIGHT, "B1", Color.WHITE)
        self.place_piece(PieceType.BISHOP, "C1", Color.WHITE)
        self.place_piece(PieceType.KING, "D1", Color.WHITE)
        self.place_piece(PieceType.QUEEN, "E1", Color.WHITE)
        self.place_piece(PieceType.BISHOP, "F1", Color.WHITE)
        self.place_piece(PieceType.KNIGHT, "G1", Color.WHITE)
        self.place_piece(PieceType.ROOK, "H1", Color.WHITE)

        # black pieces
        self.place_piece(PieceType.PAWN, "A7", Color.BLACK)
        self.place_piece(PieceType.PAWN, "B7", Color.BLACK)
        self.place_piece(PieceType.PAWN, "C7", Color.BLACK)
        self.place_piece(PieceType.PAWN, "D7", Color.BLACK)
        self.place_piece(PieceType.PAWN, "E7", Color.BLACK)
        self.place_piece(PieceType.PAWN, "F7", Color.BLACK)
        self.place_piece(PieceType.PAWN, "G7", Color.BLACK)
        self.place_piece(PieceType.PAWN, "H7", Color.BLACK)

        self.place_piece(PieceType.ROOK, "A8", Color.BLACK)
        self.place_piece(PieceType.KNIGHT, "B8", Color.BLACK)
        self.place_piece(PieceType.BISHOP, "C8", Color.BLACK)
        self.place_piece(PieceType.KING, "D8", Color.BLACK)
        self.place_piece(PieceType.QUEEN, "E8", Color.BLACK)
        self.place_piece(PieceType.BISHOP, "F8", Color.BLACK)
        self.place_piece(PieceType.KNIGHT, "G8", Color.BLACK)
        self.place_piece(PieceType.ROOK, "H8", Color.BLACK)

        self.compute_all_available_moves()

    def place_piece(self, type: PieceType, coords: str, color: Color):
        self.board.tiles[coords_to_index(shorthand_to_coords(coords))] = Piece(type, color)

    def move(self, piece: Piece, pos: str, to: str) -> str:
        piece_at_destination = self.board.tiles[shorthand_to_index(to)]
        ty = ""

        if piece_at_destination is None:
            ty = "move"
        elif piece_at_destination is not None:
            ty = "take"

        self.board.tiles[shorthand_to_index(pos)] = None
        self.board.tiles[shorthand_to_index(to)] = piece

        return ty

    def serialize_board(self) -> object:
        pieces = []

        for y in range(8):
            for x in range(8):
                sh = coords_to_shorthand((x, y))
                piece = self.board.tiles[x + y * 8]

                if piece is None:
                    continue

                pieces.append({ "pos": sh, "moves": piece.available_moves })

        return {
            "white": { "pieces": [piece.type for piece in self.white.pieces] if self.white is not None else [] },
            "black": { "pieces": [piece.type for piece in self.black.pieces] if self.black is not None else [] },
            "pieces": pieces
        }

    async def on_join(self, consumer):
        if self.white is not None:
            self.white = Side(consumer)
        else:
            self.black = Side(consumer)

        await consumer.send(json.dumps({ "type": "info", "info": self.serialize_board() }))

    async def on_quit(self, consumer):
        if self.white and self.white.consumer == consumer:
            self.white = None
        elif self.black and self.black.consumer == consumer:
            self.black = None

    async def on_message(self, consumer, data):
        print(data, file=sys.stderr)

        piece = self.board.tiles[shorthand_to_index(data["from"])]

        if not piece:
            print("invalid piece at pos", data["from"], file=sys.stderr)
            return

        if data["to"] in piece.available_moves:
            move = self.move(piece, data["from"], data["to"])
            piece.has_moved = True
            self.compute_all_available_moves()
            board_serialized = self.serialize_board()

            message = {}

            if move == "move":
                message = { "type": "move", "from": data["from"], "to": data["to"], "info": board_serialized }
            elif move == "take":
                message = { "type": "take", "from": data["from"], "to": data["to"], "info": board_serialized }

            if self.white: await self.white.consumer.send(json.dumps(message))
            if self.black: await self.black.consumer.send(json.dumps(message))

    def compute_all_available_moves(self):
        for y in range(8):
            for x in range(8):
                piece = self.board.tiles[x + y * 8]

                if not piece:
                    continue

                piece.available_moves = self.get_available_moves((x, y), piece)

    def get_available_moves(self, coords: (int, int), piece: Piece) -> list[str]:
        moves = []

        if piece.type == PieceType.PAWN:
            sign = 1 if piece.color == Color.WHITE else -1

            if is_valid(coords[0], coords[1] + sign * 1) and self.board.get(coords[0], coords[1] + sign * 1) is None:
                moves.append(coords_to_shorthand((coords[0], coords[1] + sign * 1)))

                if not piece.has_moved and is_valid(coords[0], coords[1] + sign * 2) and self.board.get(coords[0], coords[1] + sign * 2) is None:
                    moves.append(coords_to_shorthand((coords[0], coords[1] + sign * 2)))

        return moves
