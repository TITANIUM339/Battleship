import { Ship } from "./ship";

class GameBoard {
    #board = [];
    #ships = {};

    constructor() {
        for (let i = 0; i < 10; i++) {
            this.#board[i] = [];

            for (let j = 0; j < 10; j++) {
                this.#board[i][j] = { attacked: false, ship: null };
            }
        }
    }

    placeShip(name, coordinate, orientation, length) {
        if (typeof name !== "string") throw new Error("name must be a string");

        if (Object.prototype.hasOwnProperty.call(this.#ships, name))
            throw new Error("name must be unique");

        const [x, y] = coordinate;

        if (x > 9 || x < 0 || y > 9 || y < 0)
            throw new Error("invalid coordinate");

        if (
            typeof orientation !== "number" ||
            orientation < 0 ||
            orientation > 1
        )
            throw new Error("orientation must be a number between 0 - 1");

        for (let i = 0; i < length; i++) {
            if (orientation === 0) {
                if (this.#board[x + i][y].ship !== null) return false;
            } else {
                if (this.#board[x][y + i].ship !== null) return false;
            }
        }

        this.#ships[name] = new Ship(length);

        for (let i = 0; i < length; i++) {
            if (orientation === 0) {
                this.#board[x + i][y].ship = name;
            } else {
                this.#board[x][y + i].ship = name;
            }
        }

        return true;
    }

    receiveAttack(coordinate) {
        const [x, y] = coordinate;

        if (x > 9 || x < 0 || y > 9 || y < 0)
            throw new Error("invalid coordinate");

        const position = this.#board[x][y];

        if (position.attacked) return false;

        position.attacked = true;

        if (position.ship !== null) this.#ships[position.ship].hit();

        return true;
    }

    allShipsAreSunk() {
        let count = 0;

        for (const ship in this.#ships) {
            if (this.#ships[ship].isSunk()) count++;
        }

        if (count === Object.keys(this.#ships).length) return true;
        return false;
    }

    get board() {
        return JSON.parse(JSON.stringify(this.#board));
    }
}

export { GameBoard };
