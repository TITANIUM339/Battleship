import { Ship } from "./ship";

class GameBoard {
    #board = [];
    #ships = {};
    #unSunkShips = [];
    #sunkShips = [];

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

        const VERTICAL = 1;
        const HORIZONTAL = 0;

        if (x > 9 || x < 0 || y > 9 || y < 0)
            throw new Error("invalid coordinate");

        if (
            typeof orientation !== "number" ||
            (orientation !== HORIZONTAL && orientation !== VERTICAL)
        )
            throw new Error("orientation must be 0 or 1");

        for (let i = 0; i < length; i++) {
            if (orientation === HORIZONTAL) {
                if (x + i > 9 || this.#board[x + i][y].ship !== null)
                    return false;
            } else {
                if (y + i > 9 || this.#board[x][y + i].ship !== null)
                    return false;
            }
        }

        this.#ships[name] = new Ship(length);

        this.#unSunkShips.push([name, length]);

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

        const SUNK = 3;
        const HIT = 2;
        const MISS = 1;
        const INVALID = 0;

        if (x > 9 || x < 0 || y > 9 || y < 0) return INVALID;

        const position = this.#board[x][y];

        if (position.attacked) return INVALID;

        position.attacked = true;

        if (position.ship !== null) {
            this.#ships[position.ship].hit();

            if (this.#ships[position.ship].isSunk()) {
                const coordinates = [];

                for (let y = 0; y < 10; y++) {
                    for (let x = 0; x < 10; x++) {
                        if (this.#board[x][y].ship === position.ship)
                            coordinates.push([x, y]);
                    }
                }

                for (let i = 0; i < this.#unSunkShips.length; i++) {
                    if (this.#unSunkShips[i][0] === position.ship)
                        this.#unSunkShips.splice(i, 1);
                }

                this.#sunkShips.push([position.ship, coordinates]);

                return SUNK;
            }

            return HIT;
        }

        return MISS;
    }

    allShipsAreSunk() {
        let count = 0;

        for (const ship in this.#ships) {
            if (this.#ships[ship].isSunk()) count++;
        }

        if (count === Object.keys(this.#ships).length) return true;

        return false;
    }

    get unSunkShips() {
        return JSON.parse(JSON.stringify(this.#unSunkShips));
    }

    get sunkShips() {
        return JSON.parse(JSON.stringify(this.#sunkShips));
    }

    get board() {
        return JSON.parse(JSON.stringify(this.#board));
    }
}

function generateRandomBoard(ships) {
    const coordinates = [];

    for (let y = 0; y < 10; y++) {
        for (let x = 0; x < 10; x++) {
            coordinates.push([x, y]);
        }
    }

    let index = 0;

    const board = new GameBoard();

    do {
        const coordinate = coordinates.splice(
            Math.floor(Math.random() * coordinates.length),
            1,
        )[0];
        const orientation = Math.floor(Math.random() * 2);

        if (
            board.placeShip(
                ships[index].ship,
                coordinate,
                orientation,
                ships[index].length,
            )
        ) {
            index++;
        }
    } while (index !== ships.length);

    return board;
}

export { GameBoard, generateRandomBoard };
