import { Computer } from "../modules/computer";
import { GameBoard } from "../modules/board";
import { Player } from "../modules/player";

const player1Board = new GameBoard();
const player2Board = new GameBoard();
const HORIZONTAL = 0;
const VERTICAL = 1;
const shipLength = 4;

player1Board.placeShip("battleship", [0, 0], HORIZONTAL, shipLength);
player2Board.placeShip("battleship", [0, 0], VERTICAL, shipLength);

const player1 = new Player("player1", player1Board);
const player2 = new Player("player2", player2Board);
const computer = new Computer(player1);

test("creating a computer with a player object that is not an instance of Player throws an error", () => {
    expect(() => new Computer({})).toThrow;
});

test("computer shoots randomly in a checkerboard pattern where the space between squares depends on the enemy's largest un-sunk ship size", () => {
    computer.play();

    let x = 0,
        y = 0,
        offset = 0;
    let found = false;

    while (y !== 10) {
        if (player2Board.board[x][y].attacked) {
            found = true;
            break;
        }

        x += shipLength;

        if (x > 9) {
            y++;
            offset++;
            offset = offset === shipLength ? 0 : offset;
            x = offset;
        }
    }

    expect(found).toBe(true);
});

// There is a very small chance that this test will fail and that is because in the test before it the computer makes a random move which could land on [9, 9].
test("given a coordinate of an enemy ship the computer will sink that ship in the span of at least 4 rounds", () => {
    player2.attack([9, 9]);
    computer.play([0, 0]);

    for (let i = 0; i < 4; i++) {
        player2.attack([i, 0]);
        computer.play();
    }

    expect(player2Board.allShipsAreSunk()).toBe(true);
});
