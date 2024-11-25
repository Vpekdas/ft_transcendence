import { Component, globalComponents, html } from "../micro";
import NavBar from "../components/NavBar";
import GameCanvas from "../components/Canvas";

export default class Game extends Component {
    constructor() {
        super();
    }

    async render() {
        this.setTitle("Game");

        return html(
            /* HTML */
            ` <div>
                <NavBar />
                <GameCanvas />
            </div>`
        );
    }
}
globalComponents.set("Game", Game);
