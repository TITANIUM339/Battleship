import { GameBoard } from "../modules/board";

const board = new GameBoard();

const VERTICAL = 1;

test("placeShip method places a ship correctly on the board", () => {
    board.placeShip("battleship", [0, 0], VERTICAL, 4);

    for (let i = 0; i < 4; i++) {
        expect(board.board[0][i]).toEqual({
            attacked: false,
            ship: "battleship",
        });
    }
});

test("receiveAttack method attacks a ship", () => {
    board.receiveAttack([0, 0]);

    expect(board.board[0][0]).toEqual({ attacked: true, ship: "battleship" });
});

test("allShipsAreSunk method returns a boolean based on whether all ships are sunk", () => {
    board.receiveAttack([0, 1]);
    board.receiveAttack([0, 2]);
    board.receiveAttack([0, 3]);

    expect(board.allShipsAreSunk()).toBe(true);
});
