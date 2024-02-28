import { Player } from "../modules/player";
import { GameBoard } from "../modules/board";

const player1Board = new GameBoard();
const player2Board = new GameBoard();

const HORIZONTAL = 0;
const VERTICAL = 1;

player1Board.placeShip("battleship", [0, 0], HORIZONTAL, 4);
player2Board.placeShip("battleship", [0, 0], VERTICAL, 4);

const player1 = new Player("player1", player1Board);
const player2 = new Player("player2", player2Board);

test("creating a new player with a name that is not a string throws an error", () => {
    expect(() => new Player(345, player1Board)).toThrow();
});

test("creating a new player with a board object that is not an instance of GameBoard throws an error", () => {
    expect(() => new Player("player", {})).toThrow();
});

test("player1 has correct name", () => {
    expect(player1.name).toBe("player1");
});

test("it is player1's turn at the start of the game", () => {
    expect(player1.turn).toBe(true);
});

test("it is not player2's turn", () => {
    expect(player2.turn).toBe(false);
});

test("player2 cant attack while it's player1's turn", () => {
    player2.attack([0, 0]);

    expect(player1Board.board[0][0].attacked).toBe(false);
});

test("after player1 attacks it is not player1's turn anymore", () => {
    player1.attack([0, 0]);

    expect(player1.turn).toBe(false);
});

test("player1's attack is reflected on player2's board", () => {
    expect(player2Board.board[0][0].attacked).toBe(true);
});

test("it is player2's turn", () => {
    expect(player2.turn).toBe(true);
});

test("player1 cant shoot the same coordinate twice", () => {
    player2.attack([0, 0]);

    expect(player1.attack([0, 0])).toBe(false);
});
