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

    attack(coordinate) {
        let successful = false;

        if (this.#isThisPlayer1 && Player.#player1Turn) {
            successful = Player.#boards.player2.receiveAttack(coordinate);
        } else if (!this.#isThisPlayer1 && Player.#player2Turn) {
            successful = Player.#boards.player1.receiveAttack(coordinate);
        }

        if (successful) {
            const tmp = Player.#player1Turn;
            Player.#player1Turn = Player.#player2Turn;
            Player.#player2Turn = tmp;
        }

        return successful;
    }

    get name() {
        return this.#name;
    }

    get turn() {
        return this.#isThisPlayer1 ? Player.#player1Turn : Player.#player2Turn;
    }
}

export { Player };
