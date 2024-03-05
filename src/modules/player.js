import { GameBoard } from "./board";

class Player {
    static #player1Turn = true;
    static #player2Turn = false;
    static #boards = { player1: null, player2: null };

    #name;
    #isThisPlayer1;

    constructor(name, board) {
        if (typeof name !== "string") throw new Error("name must be a string");

        if (!(board instanceof GameBoard))
            throw new Error("board must be an instance of GameBoard");

        this.#name = name;

        if (Player.#boards.player1 === null) {
            Player.#boards.player1 = board;
            this.#isThisPlayer1 = true;
        } else {
            Player.#boards.player2 = board;
            this.#isThisPlayer1 = false;
        }
    }

    static clearBoards() {
        this.#boards.player1 = null;
        this.#boards.player2 = null;
    }

    attack(coordinate) {
        let result = 0;

        if (this.#isThisPlayer1 && Player.#player1Turn) {
            result = Player.#boards.player2.receiveAttack(coordinate);
        } else if (!this.#isThisPlayer1 && Player.#player2Turn) {
            result = Player.#boards.player1.receiveAttack(coordinate);
        }

        if (result) {
            const tmp = Player.#player1Turn;
            Player.#player1Turn = Player.#player2Turn;
            Player.#player2Turn = tmp;
        }

        return result;
    }

    enemyUnSunkShips() {
        if (this.#isThisPlayer1) {
            return Player.#boards.player2.unSunkShips();
        }

        return Player.#boards.player1.unSunkShips();
    }

    get name() {
        return this.#name;
    }

    get turn() {
        return this.#isThisPlayer1 ? Player.#player1Turn : Player.#player2Turn;
    }
}

export { Player };
