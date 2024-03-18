import { Player } from "./player";

class Computer {
    // A reference board to keep track of valid slots.
    #board = Array.from(Array(10), () => new Array(10).fill(true));
    #destroyingShip = false;
    #hits = [];
    #firstHit = null;
    #secondHit = null;
    #checkerboard;
    #player;

    constructor(player) {
        if (!(player instanceof Player))
            throw new Error("player must be an instance of Player");

        this.#player = player;
        this.#checkerboard = this.#generateCheckerBoard();
    }

    #generateCheckerBoard() {
        const ships = this.#player.enemyUnSunkShips;

        let largestShipLength = 1;

        for (let i = 0; i < ships.length; i++) {
            if (ships[i][1] > largestShipLength) {
                largestShipLength = ships[i][1];
            }
        }

        const board = Array.from(Array(10), () => new Array(10).fill(false));

        let x = 0,
            y = 0,
            offset = 0;

        while (y !== 10) {
            board[x][y] = true;
            x += largestShipLength;

            if (x > 9) {
                y++;
                offset++;
                offset = offset === largestShipLength ? 0 : offset;
                x = offset;
            }
        }

        return board;
    }

    #getRandomMoveAround(coordinate) {
        const [x, y] = coordinate;

        const moves = [
            [x + 1, y],
            [x, y - 1],
            [x - 1, y],
            [x, y + 1],
        ];

        const validMoves = [];

        for (let i = 0; i < moves.length; i++) {
            const [x, y] = moves[i];

            if (x <= 9 && x >= 0 && this.#board[x][y])
                validMoves.push(moves[i]);
        }

        return validMoves[Math.floor(Math.random() * validMoves.length)];
    }

    #getRandomMove() {
        const validMoves = [];

        for (let y = 0; y < 10; y++) {
            for (let x = 0; x < 10; x++) {
                if (this.#board[x][y] && this.#checkerboard[x][y])
                    validMoves.push([x, y]);
            }
        }

        return validMoves[Math.floor(Math.random() * validMoves.length)];
    }

    #attack(coordinate) {
        const [x, y] = coordinate;
        const result = this.#player.attack(coordinate);

        if (result) this.#board[x][y] = false;

        switch (result) {
            case 3: {
                const sunkShips = this.#player.enemySunkShips;
                const sunkShipCoordinates = sunkShips[sunkShips.length - 1][1];

                // Remove sunk ship coordinates from hits array.
                for (let i = 0; i < sunkShipCoordinates.length; i++) {
                    const [x1, y1] = sunkShipCoordinates[i];

                    for (let j = 0; j < this.#hits.length; j++) {
                        const [x2, y2] = this.#hits[j];

                        if (x1 === x2 && y1 === y2) {
                            this.#hits.splice(j, 1);
                            break;
                        }
                    }
                }

                // Adjust the checkerboard pattern to account for the sunk ship.
                this.#checkerboard = this.#generateCheckerBoard();

                this.#destroyingShip = false;
                this.#firstHit = this.#secondHit = null;
                break;
            }
            case 2:
                this.#hits.push(coordinate);
        }

        return result;
    }

    play(coordinate = this.#getRandomMove()) {
        return new Promise((resolve) =>
            setTimeout(() => {
                (() => {
                    // Continue destroying ship.
                    if (this.#destroyingShip) {
                        const [x1, y1] = this.#firstHit;
                        const [x2, y2] = this.#secondHit;

                        // Second hit right/up.
                        let coordinate =
                            x1 === x2 ? [x2, y2 + 1] : [x2 + 1, y2];
                        let result = this.#attack(coordinate);

                        if (result === 2) this.#secondHit = coordinate;

                        if (result) return;

                        // Second hit left/down.
                        coordinate = x1 === x2 ? [x2, y2 - 1] : [x2 - 1, y2];
                        result = this.#attack(coordinate);

                        if (result === 2) this.#secondHit = coordinate;

                        if (result) return;

                        // First hit right/up.
                        coordinate = x1 === x2 ? [x1, y1 + 1] : [x1 + 1, y1];
                        result = this.#attack(coordinate);

                        if (result === 2) this.#firstHit = coordinate;

                        if (result) return;

                        // First hit left/down.
                        coordinate = x1 === x2 ? [x1, y1 - 1] : [x1 - 1, y1];
                        result = this.#attack(coordinate);

                        if (result === 2) this.#firstHit = coordinate;

                        if (result) return;

                        this.#destroyingShip = false;
                        this.#firstHit = this.#secondHit = null;
                    }

                    // Make a hit around a coordinate in the hits array.
                    if (this.#hits.length) {
                        if (this.#firstHit === null) {
                            this.#firstHit = this.#hits[this.#hits.length - 1];
                        }

                        const coordinate = this.#getRandomMoveAround(
                            this.#firstHit,
                        );
                        const result = this.#attack(coordinate);

                        if (result === 2) {
                            this.#secondHit = this.#hits[this.#hits.length - 1];
                            this.#destroyingShip = true;
                        }

                        return;
                    }

                    // Make random move.
                    this.#attack(coordinate);
                })();

                resolve();
            }, 600),
        );
    }
}

export { Computer };
