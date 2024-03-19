import { pages } from "./modules/pages";
import { generateRandomBoard } from "./modules/board";
import { Player } from "./modules/player";

(async () => {
    const card = document.querySelector(".card");
    
    document.querySelector(".info-button").addEventListener("click", () => {
        card.classList.remove("hide");
    });

    document.querySelector(".close").addEventListener("click", () => {
        card.classList.add("hide");
    });

    const ships = [
        { ship: "carrier", length: 5 },
        { ship: "battleship", length: 4 },
        { ship: "cruiser", length: 3 },
        { ship: "submarine", length: 3 },
        { ship: "destroyer", length: 2 },
    ];

    // eslint-disable-next-line no-constant-condition
    while (true) {
        const players = await pages.loadStart();

        const player1Board = players.player1.computer
            ? generateRandomBoard(ships)
            : await pages.loadConfigure(players.player1.name, ships);

        const player2Board = players.player2.computer
            ? generateRandomBoard(ships)
            : await pages.loadConfigure(players.player2.name, ships);

        const player1 = new Player(players.player1.name, player1Board);
        const player2 = new Player(players.player2.name, player2Board);

        await pages.loadGame(
            {
                player1,
                player1Board,
                computer1: players.player1.computer,
            },
            {
                player2,
                player2Board,
                computer2: players.player2.computer,
            },
        );
    }
})().catch((error) => {
    alert(error + ". Try refreshing the page");
});
