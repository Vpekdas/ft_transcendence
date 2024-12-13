import { fetchApi, isLoggedIn } from "../api";
import { Component, globalComponents, html } from "../micro";
import { navigateTo } from "../router";
import OuterWilds from "../components/OuterWilds";

export default class Home extends Component {
    constructor() {
        super();
    }

    async render() {
        this.setTitle("Home");

        if (!(await isLoggedIn())) {
            navigateTo("/login");
        }

        this.query("#play-pong-1v1local").on("click", () => {
            localStorage.setItem("pongGamemode", "1v1local");
            navigateTo("/play");
        });

        this.query("#play-pong-1v1").on("click", () => {
            localStorage.setItem("pongGamemode", "1v1");
            navigateTo("/play");
        });

        return html(
            /* HTML */
            `<div>
                <NavBar />
                <div class="container-fluid game-container">
                    <div id="toast-container"></div>
                    <div class="card pong-game">
                        <h5 class="card-title pong-game">Pong Game</h5>
                        <img src="/favicon.svg" class="card-img-top pong-game" alt="..." />
                        <div class="card-body pong-game">
                            <p class="card-text pong-game">Play 1v1 local.</p>
                            <button type="button" class="btn btn-success play" id="play-pong-1v1local">Play</button>
                        </div>
                    </div>
                    <div class="card pong-game">
                        <h5 class="card-title pong-game">Pong Game</h5>
                        <img src="/favicon.svg" class="card-img-top pong-game" alt="..." />
                        <div class="card-body pong-game">
                            <p class="card-text pong-game">Play 1v1 remote.</p>
                            <button type="button" class="btn btn-success play" id="play-pong-1v1">Play</button>
                        </div>
                    </div>
                </div>
                <div id="outer-wilds"><OuterWilds /></div>
            </div>`
        );
    }
}
globalComponents.set("Home", Home);
