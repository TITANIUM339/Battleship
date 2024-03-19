import { GameBoard, generateRandomBoard } from "./board";
import { Human } from "./human";
import { Computer } from "./computer";
import { Player } from "./player";

const pages = (() => {
    const content = document.querySelector(".content");
    const message = document.querySelector(".message");

    async function loadStart() {
        try {
            content.innerHTML = await (
                await fetch("./pages/start.html")
            ).text();
        } catch {
            return Promise.reject("Network Error");
        }

        message.innerText = "";

        const player1 = content.querySelector("#player1");
        const player2 = content.querySelector("#player2");
        const computer1 = content.querySelector("#computer1");
        const computer2 = content.querySelector("#computer2");

        return new Promise((resolve) => {
            content
                .querySelector("form")
                .addEventListener("submit", (event) => {
                    event.preventDefault();

                    if (event.target.checkValidity()) {
                        resolve({
                            player1: {
                                name: player1.value,
                                computer: computer1.checked,
                            },
                            player2: {
                                name: player2.value,
                                computer: computer2.checked,
                            },
                        });
                    }
                });
        });
    }

    function generateBoard() {
        const board = document.createElement("div");
        board.className = "board";

        const letters = document.createElement("div");
        letters.className = "letters";

        const numbers = document.createElement("div");
        numbers.className = "numbers";

        const A = 65;

        for (let i = 0; i < 10; i++) {
            const letter = document.createElement("div");
            letter.innerText = String.fromCharCode(A + i);

            const number = document.createElement("div");
            number.innerText = i + 1;

            letters.appendChild(letter);
            numbers.appendChild(number);
        }

        const grid = document.createElement("div");
        grid.className = "grid";

        for (let y = 0; y < 10; y++) {
            for (let x = 0; x < 10; x++) {
                const cell = document.createElement("div");
                cell.className = "cell";
                cell.dataset.x = x;
                cell.dataset.y = y;
                cell.appendChild(document.createElement("div"));

                grid.appendChild(cell);
            }
        }

        board.appendChild(letters);
        board.appendChild(numbers);
        board.appendChild(grid);

        return board;
    }

    let draggedShip = null;

    let highlight = [];

    function clearHighlight() {
        for (let i = 0; i < highlight.length; i++) {
            highlight[i].classList.remove("valid");
            highlight[i].classList.remove("invalid");
        }

        highlight = [];
    }

    function generateShips(ships) {
        const shipsContainer = document.createElement("div");
        shipsContainer.className = "ships";
        shipsContainer.addEventListener("dragstart", (event) => {
            event.preventDefault();
        });

        for (let i = 0; i < ships.length; i++) {
            const ship = document.createElement("div");
            ship.className = "ship";
            ship.draggable = true;
            ship.dataset.name = ships[i].ship;
            ship.dataset.length = ships[i].length;

            const name = document.createElement("div");
            name.innerText = ships[i].ship;
            name.addEventListener("dragstart", (event) => {
                event.stopPropagation();
                event.preventDefault();
            });

            const length = document.createElement("div");
            length.innerText = ships[i].length;
            length.addEventListener("dragstart", (event) => {
                event.stopPropagation();
                event.preventDefault();
            });

            ship.addEventListener("dragstart", (event) => {
                event.stopPropagation();
                draggedShip = event.target;
                event.dataTransfer.setData("text", "");
            });

            ship.addEventListener("dragend", function () {
                draggedShip = null;
                clearHighlight();
            });

            ship.appendChild(name);
            ship.appendChild(length);
            shipsContainer.append(ship);
        }

        return shipsContainer;
    }

    function convertTo2dArray(array1d) {
        const array2d = Array.from(Array(10), () => new Array(10));

        for (let y = 0, index = 0; y < 10; y++) {
            for (let x = 0; x < 10; x++) {
                array2d[x][y] = array1d[index++];
            }
        }

        return array2d;
    }

    async function loadConfigure(name, ships) {
        try {
            content.innerHTML = await (
                await fetch("./pages/configure.html")
            ).text();
        } catch {
            return Promise.reject("Network Error");
        }

        message.innerText = `Configure your fleet, ${name}`;

        content.querySelector(".board-container").appendChild(generateBoard());

        const shipsContainer = content.querySelector(
            ".ships-container > :first-child",
        );

        shipsContainer.appendChild(generateShips(ships));

        const board = convertTo2dArray(content.querySelectorAll(".cell"));

        const yAxis = content.querySelector("#axis");

        let valid = true;

        let shipsConfiguration = [];

        for (let y = 0; y < 10; y++) {
            for (let x = 0; x < 10; x++) {
                board[x][y].addEventListener("dragover", (event) => {
                    if (valid) event.preventDefault();
                });

                board[x][y].addEventListener("dragenter", () => {
                    if (!draggedShip) return;

                    clearHighlight();

                    valid = true;

                    const shipLength = draggedShip.dataset.length;

                    for (let i = 0; i < shipLength; i++) {
                        if (!yAxis.checked) {
                            if (
                                x + i > 9 ||
                                board[x + i][y].classList.contains("occupied")
                            ) {
                                valid = false;
                                break;
                            }

                            highlight.push(board[x + i][y]);
                        } else {
                            if (
                                y + i > 9 ||
                                board[x][y + i].classList.contains("occupied")
                            ) {
                                valid = false;
                                break;
                            }

                            highlight.push(board[x][y + i]);
                        }
                    }

                    for (let i = 0; i < highlight.length; i++) {
                        if (valid) {
                            highlight[i].classList.add("valid");
                        } else {
                            highlight[i].classList.add("invalid");
                        }
                    }
                });

                board[x][y].addEventListener("drop", (event) => {
                    event.preventDefault();

                    if (!valid) return;

                    draggedShip.remove();

                    const shipConfiguration = {
                        name: draggedShip.dataset.name,
                        coordinate: [
                            Number(event.target.dataset.x),
                            Number(event.target.dataset.y),
                        ],
                        orientation: yAxis.checked ? 1 : 0,
                        length: Number(draggedShip.dataset.length),
                    };

                    shipsConfiguration.push(shipConfiguration);

                    for (let i = 0; i < highlight.length; i++) {
                        highlight[i].classList.add("occupied");
                    }
                });
            }
        }

        let randomBoard = null;

        content.querySelector(".random").addEventListener("click", () => {
            for (let y = 0; y < 10; y++) {
                for (let x = 0; x < 10; x++) {
                    board[x][y].classList.remove("occupied");
                }
            }

            shipsContainer.innerHTML = "";

            randomBoard = generateRandomBoard(ships);

            for (let y = 0; y < 10; y++) {
                for (let x = 0; x < 10; x++) {
                    if (randomBoard.board[x][y].ship !== null) {
                        board[x][y].classList.add("occupied");
                    }
                }
            }
        });

        content.querySelector(".reset").addEventListener("click", () => {
            shipsConfiguration = [];
            randomBoard = null;

            for (let y = 0; y < 10; y++) {
                for (let x = 0; x < 10; x++) {
                    board[x][y].classList.remove("occupied");
                }
            }

            shipsContainer.replaceChildren(generateShips(ships));
        });

        return new Promise((resolve) => {
            content.querySelector(".done").addEventListener("click", () => {
                if (randomBoard) {
                    resolve(randomBoard);
                    return;
                }

                if (shipsConfiguration.length === ships.length) {
                    const board = new GameBoard();

                    for (let i = 0; i < shipsConfiguration.length; i++) {
                        board.placeShip(
                            shipsConfiguration[i].name,
                            shipsConfiguration[i].coordinate,
                            shipsConfiguration[i].orientation,
                            shipsConfiguration[i].length,
                        );
                    }

                    resolve(board);
                }
            });
        });
    }

    function renderBoard(domBoard, board, sunkShip) {
        for (let i = 0; i < 10; i++) {
            for (let j = 0; j < 10; j++) {
                if (sunkShip !== null && board[i][j].ship === sunkShip) {
                    domBoard[i][j].classList.add("occupied");
                }

                if (board[i][j].attacked && board[i][j].ship !== null) {
                    domBoard[i][j].firstChild.classList.add("hit");
                } else if (board[i][j].attacked) {
                    domBoard[i][j].firstChild.classList.add("miss");
                }
            }
        }
    }

    function showBoard(domBoard, board) {
        for (let i = 0; i < 10; i++) {
            for (let j = 0; j < 10; j++) {
                if (board[i][j].ship !== null) {
                    domBoard[i][j].classList.add("occupied");
                }
            }
        }
    }

    function hideBoard(domBoard, board, unSunkShips) {
        function contains(ship) {
            for (let i = 0; i < unSunkShips.length; i++) {
                if (ship === unSunkShips[i][0]) {
                    return true;
                }
            }

            return false;
        }

        for (let i = 0; i < 10; i++) {
            for (let j = 0; j < 10; j++) {
                if (contains(board[i][j].ship)) {
                    domBoard[i][j].classList.remove("occupied");
                }
            }
        }
    }

    async function loadGame(
        { player1, player1Board, computer1 },
        { player2, player2Board, computer2 },
    ) {
        try {
            content.innerHTML = await (await fetch("./pages/game.html")).text();
        } catch {
            return Promise.reject("Network Error");
        }

        content
            .querySelector(".player1 > .board-container")
            .appendChild(generateBoard());
        content
            .querySelector(".player2 > .board-container")
            .appendChild(generateBoard());

        content.querySelector(".player1").querySelector(".name").innerText =
            `${player1.name}`;
        content.querySelector(".player2").querySelector(".name").innerText =
            `${player2.name}`;

        const player1DomBoard = convertTo2dArray(
            content.querySelector(".player1").querySelectorAll(".cell"),
        );
        const player2DomBoard = convertTo2dArray(
            content.querySelector(".player2").querySelectorAll(".cell"),
        );

        const toggleBoard1 = content.querySelector(".player1 > .toggle-board");
        const toggleBoard2 = content.querySelector(".player2 > .toggle-board");

        if (!computer1 && !computer2) {
            toggleBoard1.classList.remove("hide");
            toggleBoard2.classList.remove("hide");
        } else if (!computer1 || !computer2) {
            showBoard(
                computer1 ? player2DomBoard : player1DomBoard,
                computer1 ? player2Board.board : player1Board.board,
            );
        }

        let toggle1Pressed = false;
        toggleBoard1.addEventListener("click", (event) => {
            if (event.target.classList.contains("disabled")) return;

            if (toggle1Pressed) {
                hideBoard(
                    player1DomBoard,
                    player1Board.board,
                    player1Board.unSunkShips,
                );

                event.target.innerText = "Show board";

                toggle1Pressed = false;
            } else {
                showBoard(player1DomBoard, player1Board.board);

                event.target.innerText = "Hide board";

                toggle1Pressed = true;
            }
        });

        let toggle2Pressed = false;
        toggleBoard2.addEventListener("click", (event) => {
            if (event.target.classList.contains("disabled")) return;

            if (toggle2Pressed) {
                hideBoard(
                    player2DomBoard,
                    player2Board.board,
                    player2Board.unSunkShips,
                );

                event.target.innerText = "Show board";

                toggle2Pressed = false;
            } else {
                showBoard(player2DomBoard, player2Board.board);

                event.target.innerText = "Hide board";

                toggle2Pressed = true;
            }
        });

        const player1Handler = computer1
            ? new Computer(player1)
            : new Human(player1, player2DomBoard);
        const player2Handler = computer2
            ? new Computer(player2)
            : new Human(player2, player1DomBoard);

        return new Promise((resolve) => {
            let restart = false;

            content.querySelector(".restart").addEventListener("click", () => {
                Player.clearBoards();
                restart = true;
                resolve();
            });

            // Main game loop.
            (async () => {
                while (
                    !player1Board.allShipsAreSunk() &&
                    !player2Board.allShipsAreSunk() &&
                    !restart
                ) {
                    message.innerText = `${player1.turn ? player1.name : player2.name}'s turn`;

                    if (!computer1 && !computer2) {
                        if (player1.turn) {
                            toggleBoard1.classList.remove("disabled");
                            toggleBoard2.classList.add("disabled");

                            hideBoard(
                                player2DomBoard,
                                player2Board.board,
                                player2Board.unSunkShips,
                            );
                        } else {
                            toggleBoard2.classList.remove("disabled");
                            toggleBoard1.classList.add("disabled");

                            hideBoard(
                                player1DomBoard,
                                player1Board.board,
                                player1Board.unSunkShips,
                            );
                        }

                        toggle1Pressed = toggle2Pressed = false;

                        toggleBoard1.innerText = toggleBoard2.innerText =
                            "Show board";
                    }

                    player1.turn
                        ? await player1Handler.play()
                        : await player2Handler.play();

                    const sunkShip = player1.turn
                        ? player1Board.sunkShips[
                              player1Board.sunkShips.length - 1
                          ]
                        : player2Board.sunkShips[
                              player2Board.sunkShips.length - 1
                          ];

                    const sunkShipName = sunkShip ? sunkShip[0] : null;

                    renderBoard(
                        player1.turn ? player1DomBoard : player2DomBoard,
                        player1.turn ? player1Board.board : player2Board.board,
                        sunkShipName,
                    );
                }

                if (!restart) {
                    message.innerText = `${player1Board.allShipsAreSunk() ? player2.name : player1.name} wins!`;
                }
            })();
        });
    }

    return { loadStart, loadConfigure, loadGame };
})();

export { pages };
