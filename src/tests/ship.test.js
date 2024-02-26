import { Ship } from "../modules/ship";

const ship = new Ship(4);

test("creating a ship with invalid length throws an error", () => {
    expect(() => new Ship(45)).toThrow();
});

test("ship has correct length", () => {
    expect(ship.length).toBe(4);
});

test("hit method increases the number of hits", () => {
    ship.hit();

    expect(ship.hits).toBe(1);
});

test("isSunk method returns a boolean based on whether a ship is considered sunk", () => {
    expect(ship.isSunk()).toBe(false);
});
