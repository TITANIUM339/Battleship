class Ship {
    #length;
    #hits = 0;

    constructor(length) {
        if (typeof length !== "number" || length < 1 || length > 10)
            throw new Error("length must be a number between 1 - 10");

        this.#length = length;
    }

    get length() {
        return this.#length;
    }

    get hits() {
        return this.#hits;
    }

    hit() {
        this.#hits++;
    }

    isSunk() {
        return this.#hits === this.#length;
    }
}

export { Ship };
