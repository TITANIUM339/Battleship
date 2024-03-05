import { Player } from "./player";

class Computer {
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
        this.#checkerboard = this.#calculateCheckerBoard();
    }

    #calculateCheckerBoard() {
        const ships = this.#player.enemyUnSunkShips();

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
        const enemyShipsBeforeAttack = this.#player.enemyUnSunkShips();
        const result = this.#player.attack(coordinate);
        const enemyShipsAfterAttack = this.#player.enemyUnSunkShips();

        if (result) this.#board[x][y] = false;

        switch (result) {
            case 3: {
                let sunkShipLength;

                for (let i = 0; i < enemyShipsBeforeAttack.length; i++) {
                    if (
                        i === enemyShipsAfterAttack.length ||
                        enemyShipsBeforeAttack[i][0] !==
                            enemyShipsAfterAttack[i][0]
                    ) {
                        sunkShipLength = enemyShipsBeforeAttack[i][1];
                    }
                }

                const spliceValue = this.#hits.length - sunkShipLength + 1;
                this.#hits.splice(spliceValue);

                this.#checkerboard = this.#calculateCheckerBoard();

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
        // Continue destroying ship.
        if (this.#destroyingShip) {
            const [x1, y1] = this.#firstHit;
            const [x2, y2] = this.#secondHit;

            let coordinate = x1 === x2 ? [x2, y2 + 1] : [x2 + 1, y2];
            let result = this.#attack(coordinate);

            if (result > 1) this.#secondHit = coordinate;

            if (result) return;

            coordinate = x1 === x2 ? [x1, y1 - 1] : [x1 - 1, y1];
            result = this.#attack(coordinate);

            if (result > 1) this.#firstHit = coordinate;

            if (result) return;

            this.#destroyingShip = false;
            this.#firstHit = this.#secondHit = null;
        }

        // Make a hit around a coordinate in the hits array.
        if (this.#hits.length) {
            if (this.#firstHit === null) {
                this.#firstHit = this.#hits[this.#hits.length - 1];
            }

            const coordinate = this.#getRandomMoveAround(this.#firstHit);
            const result = this.#attack(coordinate);

            if (result === 2) {
                this.#secondHit = this.#hits[this.#hits.length - 1];
                this.#destroyingShip = true;
            }

            return;
        }

        // Make random move.
        const result = this.#attack(coordinate);

        if (result === 2) {
            this.#firstHit = this.#hits[this.#hits.length - 1];
        }
    }
}

export { Computer };
