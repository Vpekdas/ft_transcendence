import { PongGame } from "../PongGame";

/** @type {import("../micro").Component} */
export default async function Pong({ dom }) {
    dom.querySelector("#pong").do(async (c) => {
        const game = new PongGame();
        game.setup(this, c); // TODO: this should not be used here
    });

    return /* HTML */ ` <div>
        <NavBar />
        <div id="pong"></div>
    </div>`;
}
