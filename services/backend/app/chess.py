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

    def other(self):
        return self.BLACK if self == self.WHITE else self.WHITE

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
    
    def present(self, x: int, y: int) -> bool:
        return self.get(x, y) is not None

    def move(self, pos: str, to: str) -> str:
        piece = self.tiles[shorthand_to_index(pos)]
        
        self.tiles[shorthand_to_index(pos)] = None
        self.tiles[shorthand_to_index(to)] = piece

    def copy(self):
        board = Board()
        
        for x in range(8):
            for y in range(8):
                piece = self.get(x, y)

                if piece is not None:
                    board.tiles[x + y * 8] = Piece(piece.type, piece.color)
                    board.tiles[x + y * 8].has_moved = piece.has_moved
                    board.tiles[x + y * 8].available_moves = piece.available_moves
        
        return board

    def compute_all_available_moves(self, color: Color=None, check: bool=True):
        for y in range(8):
            for x in range(8):
                piece = self.get(x, y)

                if not piece:
                    continue

                if color and piece.color != color:
                    continue

                piece.available_moves = self.get_available_moves((x, y), piece, check=check)

    def get_available_rook_moves(self, coords: (int, int), piece: Piece, check: bool) -> list[str]:
        moves = []
        
        # Y
        for y in range(coords[1] + 1, 8):
            coords2 = (coords[0], y)
            piece2 = self.get(coords[0], y)

            if (piece2 is None or piece2.color != piece.color) and not self.check_check(check, piece.color, coords, coords2):
                moves.append(coords_to_shorthand(coords2))

                if piece2 is not None:
                    break
            elif piece2 is not None and piece2.color == piece.color:
                break

        for y in range(coords[1] - 1, -1, -1):
            coords2 = (coords[0], y)
            piece2 = self.get(coords[0], y)

            if (piece2 is None or piece2.color != piece.color) and not self.check_check(check, piece.color, coords, coords2):
                moves.append(coords_to_shorthand(coords2))

                if piece2 is not None:
                    break
            elif piece2 is not None and piece2.color == piece.color:
                break

        # X
        for x in range(coords[0] + 1, 8):
            coords2 = (x, coords[1])
            piece2 = self.get(x, coords[1])

            if check:
                print(self.check_check(check, piece.color, coords, coords), file=sys.stderr)

            if (piece2 is None or piece2.color != piece.color) and not self.check_check(check, piece.color, coords, coords2):
                moves.append(coords_to_shorthand(coords2))

                if piece2 is not None:
                    break
            elif piece2 is not None and piece2.color == piece.color:
                break

        for x in range(coords[0] - 1, -1, -1):
            coords2 = (x, coords[1])
            piece2 = self.get(x, coords[1])

            if (piece2 is None or piece2.color != piece.color) and not self.check_check(check, piece.color, coords, coords2):
                moves.append(coords_to_shorthand(coords2))

                if piece2 is not None:
                    break
            elif piece2 is not None and piece2.color == piece.color:
                break

        return moves

    def get_available_bishop_moves(self, coords: (int, int), piece: Piece, check: bool) -> list[str]:
        moves = []

        # Top right
        coords2 = (coords[0] + 1, coords[1] + 1)
        while is_valid(coords2[0], coords2[1]):
            piece2 = self.get(coords2[0], coords2[1])

            if (piece2 is None or piece2.color != piece.color) and not self.check_check(check, piece.color, coords, coords2):
                moves.append(coords_to_shorthand((coords2[0], coords2[1])))

                if piece2 is not None:
                    break
            elif piece2 is not None and piece2.color == piece.color:
                break

            coords2 = (coords2[0] + 1, coords2[1] + 1)

        # Top left
        coords2 = (coords[0] - 1, coords[1] + 1)
        while is_valid(coords2[0], coords2[1]):
            piece2 = self.get(coords2[0], coords2[1])

            if (piece2 is None or piece2.color != piece.color) and not self.check_check(check, piece.color, coords, coords2):
                moves.append(coords_to_shorthand((coords2[0], coords2[1])))

                if piece2 is not None:
                    break
            elif piece2 is not None and piece2.color == piece.color:
                break

            coords2 = (coords2[0] - 1, coords2[1] + 1)

        # Bottom right
        coords2 = (coords[0] + 1, coords[1] - 1)
        while is_valid(coords2[0], coords2[1]):
            piece2 = self.get(coords2[0], coords2[1])

            if (piece2 is None or piece2.color != piece.color) and not self.check_check(check, piece.color, coords, coords2):
                moves.append(coords_to_shorthand((coords2[0], coords2[1])))

                if piece2 is not None:
                    break
            elif piece2 is not None and piece2.color == piece.color:
                break

            coords2 = (coords2[0] + 1, coords2[1] - 1)

        # Bottom left
        coords2 = (coords[0] - 1, coords[1] - 1)
        while is_valid(coords2[0], coords2[1]):
            piece2 = self.get(coords2[0], coords2[1])

            if (piece2 is None or piece2.color != piece.color) and not self.check_check(check, piece.color, coords, coords2):
                moves.append(coords_to_shorthand((coords2[0], coords2[1])))

                if piece2 is not None:
                    break
            elif piece2 is not None:
                break

            coords2 = (coords2[0] - 1, coords2[1] - 1)

        return moves

    def get_available_moves(self, coords: (int, int), piece: Piece, check: bool=True) -> list[str]:
        moves = []

        if piece.type == PieceType.PAWN:
            sign = 1 if piece.color == Color.WHITE else -1

            if is_valid(coords[0], coords[1] + sign * 1) and self.get(coords[0], coords[1] + sign * 1) is None and not self.check_check(check, piece.color, coords, coords2):
                moves.append(coords_to_shorthand((coords[0], coords[1] + sign * 1)))

                if not piece.has_moved and is_valid(coords[0], coords[1] + sign * 2) and self.get(coords[0], coords[1] + sign * 2) is None and not self.check_check(check, piece.color, coords, coords2):
                    moves.append(coords_to_shorthand((coords[0], coords[1] + sign * 2)))
            if is_valid(coords[0] + 1, coords[1] + sign * 1) and self.present(coords[0] + 1, coords[1] + sign * 1) and self.get(coords[0] + 1, coords[1] + sign * 1).color != piece.color and not self.check_check(check, piece.color, coords, coords2):
                moves.append(coords_to_shorthand((coords[0] + 1, coords[1] + sign * 1)))
            if is_valid(coords[0] - 1, coords[1] + sign * 1) and self.present(coords[0] - 1, coords[1] + sign * 1) and self.get(coords[0] - 1, coords[1] + sign * 1).color != piece.color and not self.check_check(check, piece.color, coords, coords2):
                moves.append(coords_to_shorthand((coords[0] - 1, coords[1] + sign * 1)))
        elif piece.type == PieceType.KNIGHT:
            possible_moves = [(-1, 2), (1, 2), (-1, -2), (1, -2), (2, -1), (2, 1), (-2, -1), (-2, 1)]

            for move in possible_moves:
                coords2 = (coords[0] + move[0], coords[1] + move[1])

                if not is_valid(coords2[0], coords2[1]):
                    continue

                piece2 = self.get(coords2[0], coords2[1])

                if is_valid(coords2[0], coords2[1]) and (piece2 is None or piece2.color != piece.color) and not self.check_check(check, piece.color, coords, coords2):
                    moves.append(coords_to_shorthand(coords2))
        elif piece.type == PieceType.ROOK:
            moves.extend(self.get_available_rook_moves(coords, piece, check))
        elif piece.type == PieceType.BISHOP:
            moves.extend(self.get_available_bishop_moves(coords, piece, check))
        elif piece.type == PieceType.QUEEN:
            moves.extend(self.get_available_rook_moves(coords, piece, check))
            moves.extend(self.get_available_bishop_moves(coords, piece, check))
        elif piece.type == PieceType.KING:
            possible_moves = [(0, 1), (0, -1), (1, 0), (-1, 0), (1, 1), (-1, 1), (1, -1), (-1, -1)]

            for move in possible_moves:
                coords2 = (coords[0] + move[0], coords[1] + move[1])

                if not is_valid(coords2[0], coords2[1]):
                    continue

                piece2 = self.get(coords2[0], coords2[1])

                # The "near other king" condition does not need to be separate since the opposite king would put him in check.

                if (piece2 is None or piece2.color != piece.color) and not self.check_check(check, piece.color, coords, coords2):
                    moves.append(coords_to_shorthand(coords2))

        return moves

    def check_check(self, needs_recursive_checking: bool, color: Color, pos: (int, int), to: (int, int)) -> bool:
        """
        Returns `True` if after the move `pos` => `to`, the king of color `color` is in check.
        """

        return self.is_in_check(color) or (needs_recursive_checking and self.is_check_after_move(color, pos, to))

    def is_in_check(self, color: Color) -> bool:
        """
        Check if the king of `color` is currently in check.
        """

        king: Piece
        coords: (int, int) = None

        for x in range(8):
            for y in range(8):
                piece = self.get(x, y)

                if piece is not None and piece.type == PieceType.KING and piece.color == color:
                    king = piece
                    coords = (x, y)
        
        if coords is None:
            return True

        for piece in self.tiles:
            if piece is not None and piece.color != color and coords_to_shorthand(coords) in piece.available_moves:
                return True

        return False

    def check_checkmate(self, color: Color) -> bool:
        king = [p for p in self.tiles if p is not None and p.type == PieceType.KING and p.color == color][0]
        pieces = [p for p in self.tiles if p is not None and p.color == color]

        if not self.is_in_check(color):
            return False
        
        for piece in pieces:
            if len(piece.available_moves) > 0:
                return False
        
        return True

    def new_board_after_move(self, color: Color, pos: (int, int), to: (int, int)):
        board2: Board = self.copy()
        board2.move(coords_to_shorthand(pos), coords_to_shorthand(to))
        board2.compute_all_available_moves(check=False)

        return board2

    def is_check_after_move(self, color: Color, pos: (int, int), to: (int, int)) -> bool:
        board2: Board = self.copy()
        board2.move(coords_to_shorthand(pos), coords_to_shorthand(to))
        board2.compute_all_available_moves(color=color.other(), check=False)

        return board2.is_in_check(color)

    def dump(self):
        for y in range(8):
            s = ""

            for x in range(8):
                piece = self.get(x, 7 - y)

                if piece is None:
                    s += "."
                elif piece.type == PieceType.ROOK:
                    s += "R"
                elif piece.type == PieceType.BISHOP:
                    s += "B"
                elif piece.type == PieceType.KNIGHT:
                    s += "K"
                elif piece.type == PieceType.KING:
                    s += "X"
                elif piece.type == PieceType.QUEEN:
                    s += "Q"
                elif piece.type == PieceType.PAWN:
                    s += "P"
                
            print(s, file=sys.stderr)

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

        self.turn: Color = Color.WHITE

        self.setup_board()

    def setup_board(self):
        # white pieces
        # self.place_piece(PieceType.PAWN, "A2", Color.WHITE)
        # self.place_piece(PieceType.PAWN, "B2", Color.WHITE)
        # self.place_piece(PieceType.PAWN, "C2", Color.WHITE)
        # self.place_piece(PieceType.PAWN, "D2", Color.WHITE)
        # self.place_piece(PieceType.PAWN, "E2", Color.WHITE)
        # self.place_piece(PieceType.PAWN, "F2", Color.WHITE)
        # self.place_piece(PieceType.PAWN, "G2", Color.WHITE)
        # self.place_piece(PieceType.PAWN, "H2", Color.WHITE)

        # self.place_piece(PieceType.ROOK, "A1", Color.WHITE)
        # self.place_piece(PieceType.KNIGHT, "B1", Color.WHITE)
        # self.place_piece(PieceType.BISHOP, "C1", Color.WHITE)
        # self.place_piece(PieceType.KING, "D1", Color.WHITE)
        # self.place_piece(PieceType.QUEEN, "E1", Color.WHITE)
        # self.place_piece(PieceType.BISHOP, "F1", Color.WHITE)
        # self.place_piece(PieceType.KNIGHT, "G1", Color.WHITE)
        # self.place_piece(PieceType.ROOK, "H1", Color.WHITE)

        # black pieces
        # self.place_piece(PieceType.PAWN, "A7", Color.BLACK)
        # self.place_piece(PieceType.PAWN, "B7", Color.BLACK)
        # self.place_piece(PieceType.PAWN, "C7", Color.BLACK)
        # self.place_piece(PieceType.PAWN, "D7", Color.BLACK)
        # self.place_piece(PieceType.PAWN, "E7", Color.BLACK)
        # self.place_piece(PieceType.PAWN, "F7", Color.BLACK)
        # self.place_piece(PieceType.PAWN, "G7", Color.BLACK)
        # self.place_piece(PieceType.PAWN, "H7", Color.BLACK)

        # self.place_piece(PieceType.ROOK, "A8", Color.BLACK)
        # self.place_piece(PieceType.KNIGHT, "B8", Color.BLACK)
        # self.place_piece(PieceType.BISHOP, "C8", Color.BLACK)
        # self.place_piece(PieceType.KING, "D8", Color.BLACK)
        # self.place_piece(PieceType.QUEEN, "E8", Color.BLACK)
        # self.place_piece(PieceType.BISHOP, "F8", Color.BLACK)
        # self.place_piece(PieceType.KNIGHT, "G8", Color.BLACK)
        # self.place_piece(PieceType.ROOK, "H8", Color.BLACK)

        # -----------------------------------------------------
        # TEST BOARDS

        # 1.
        self.place_piece(PieceType.KING, "H8", Color.BLACK)
        self.place_piece(PieceType.ROOK, "E3", Color.BLACK)
        self.place_piece(PieceType.ROOK, "F3", Color.BLACK)
        self.place_piece(PieceType.PAWN, "H1", Color.BLACK)

        self.place_piece(PieceType.KING, "C3", Color.WHITE)
        self.place_piece(PieceType.ROOK, "D1", Color.WHITE)

        self.board.compute_all_available_moves()

    def place_piece(self, type: PieceType, coords: str, color: Color):
        self.board.tiles[shorthand_to_index(coords)] = Piece(type, color)

    def move(self, pos: str, to: str) -> str:
        piece_at_destination = self.board.tiles[shorthand_to_index(to)]
        ty = ""

        if piece_at_destination is None:
            ty = "move"
        elif piece_at_destination is not None:
            ty = "take"

        self.board.move(pos, to)

        return ty

    def serialize_piece_type(self, ty: PieceType) -> str:
        match ty:
            case PieceType.PAWN:
                return "pawn"
            case PieceType.ROOK:
                return "rook"
            case PieceType.KNIGHT:
                return "knight"
            case PieceType.BISHOP:
                return "bishop"
            case PieceType.QUEEN:
                return "queen"
            case PieceType.KING:
                return "king"

    def serialize_color(self, color: Color) -> str:
        match color:
            case Color.WHITE:
                return "white"
            case Color.BLACK:
                return "black"

    def serialize_board(self) -> object:
        pieces = []

        for y in range(8):
            for x in range(8):
                sh = coords_to_shorthand((x, y))
                piece = self.board.tiles[x + y * 8]

                if piece is None:
                    continue

                for move in piece.available_moves:
                    piece2 = self.board.tiles[shorthand_to_index(move)]

                    # if piece2 is not None and piece2.type == PieceType.KING:
                    #     piece.available_moves.remove(move)
                    #     break

                pieces.append({ "pos": sh, "type": self.serialize_piece_type(piece.type), "color": self.serialize_color(piece.color), "moves": piece.available_moves })

        return {
            "white": { "pieces": [piece.type for piece in self.white.pieces] if self.white is not None else [] },
            "black": { "pieces": [piece.type for piece in self.black.pieces] if self.black is not None else [] },
            "pieces": pieces
        }

    async def on_join(self, consumer):
        color: str

        if self.white is not None:
            self.white = Side(consumer)
            color = "white"
        else:
            self.black = Side(consumer)
            color = "black"

        check_info = None

        if self.board.is_in_check(Color.BLACK):
            check_info = { "color": self.serialize_color(Color.BLACK), "is_checkmate": self.board.check_checkmate(Color.BLACK) }
        elif self.board.is_in_check(Color.WHITE):
            check_info = { "color": self.serialize_color(Color.WHITE), "is_checkmate": self.board.check_checkmate(Color.WHITE) }

        await consumer.send(json.dumps({ "type": "info", "info": self.serialize_board(), "gamemode": "local", "color": color, "turn": self.serialize_color(self.turn), "check": check_info }))

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
            piece2 = self.board.tiles[shorthand_to_index(data["to"])]

            if piece2 is not None and piece2.type == PieceType.KING:
                return

            move = self.move(data["from"], data["to"])
            piece.has_moved = True
            self.board.compute_all_available_moves()
            board_serialized = self.serialize_board()

            self.turn = Color.BLACK if self.turn == Color.WHITE else Color.WHITE

            message = {}

            # check: str = None

            # if self.board.is_in_check(Color.BLACK):
            #     check = self.serialize_color(Color.BLACK)
            # elif self.board.is_in_check(Color.WHITE):
            #     check = self.serialize_color(Color.WHITE)

            check_info = None

            if self.board.is_in_check(Color.BLACK):
                check_info = { "color": self.serialize_color(Color.BLACK), "is_checkmate": self.board.check_checkmate(Color.BLACK) }
            elif self.board.is_in_check(Color.WHITE):
                check_info = { "color": self.serialize_color(Color.WHITE), "is_checkmate": self.board.check_checkmate(Color.WHITE) }

            if move == "move":
                message = { "type": "move", "from": data["from"], "to": data["to"], "info": board_serialized, "turn": self.serialize_color(self.turn), "check": check_info }
            elif move == "take":
                message = { "type": "take", "from": data["from"], "to": data["to"], "info": board_serialized, "turn": self.serialize_color(self.turn), "check": check_info }

            if self.white: await self.white.consumer.send(json.dumps(message))
            if self.black: await self.black.consumer.send(json.dumps(message))
