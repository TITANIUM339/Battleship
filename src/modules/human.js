import { Player } from "./player";

class Human {
    #player;
    #resolvePromise = () => {};

    constructor(player, domBoard) {
        if (!(player instanceof Player))
            throw new Error("player must be an instance of Player");

        this.#player = player;

        for (let y = 0; y < 10; y++) {
            for (let x = 0; x < 10; x++) {
                domBoard[x][y].addEventListener("click", () => {
                    if (this.#player.attack([x, y])) this.#resolvePromise();
                });
            }
        }
    }

    play() {
        return new Promise((resolve) => {
            this.#resolvePromise = resolve;
        });
    }
}

export { Human };
