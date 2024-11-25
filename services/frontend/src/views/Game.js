import { Component, globalComponents, html } from "../micro";
import NavBar from "../components/NavBar";

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
                <canvas id="myCanvas" width="1920" height="780" style="border:1px solid #000000;"> </canvas>
            </div>`
        );
    }
}
globalComponents.set("Game", Game);
