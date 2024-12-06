import { isLoggedIn, post } from "../api";
import { Component, globalComponents, html } from "../micro";
import { action } from "../game";
import { PongGame } from "../PongGame";
import { navigateTo } from "../router";

export default class Pong extends Component {
    constructor() {
        super();
    }

    async render() {
        if (!(await isLoggedIn())) {
            navigateTo("/login");
        }

        this.query("#pong").do(async (c) => {
            const game = new PongGame();
            game.setup(this, c);
        });

        return html(
            /* HTML */ ` <div>
                <NavBar />
                <div id="pong"></div>
            </div>`
        );
    }
}
globalComponents.set("Pong", Pong);
