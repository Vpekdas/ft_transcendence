import { fetchApi, isLoggedIn } from "../api";
import { Component, html } from "../micro";
import { navigateTo } from "../router";
import { tr } from "../i18n";

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

        this.query("#play-pong-tournament").on("click", () => {
            navigateTo("/create-tournament");
        });

        return html(
            /* HTML */
            `<div>
                <NavBar />
                <div class="container-fluid game-container">
                    <div id="toast-container"></div>
                    <div class="card pong-game">
                        <h5 class="card-title pong-game">Pong</h5>
                        <img src="/favicon.svg" class="card-img-top pong-game" alt="..." />
                        <div class="card-body pong-game">
                            <p class="card-text pong-game">${tr("Play 1v1 Local Pong.")}</p>
                            <button type="button" class="btn btn-success play" id="play-pong-1v1local">
                                ${tr("Play")}
                            </button>
                        </div>
                    </div>
                    <div class="card pong-game">
                        <h5 class="card-title pong-game">Pong</h5>
                        <img src="/favicon.svg" class="card-img-top pong-game" alt="..." />
                        <div class="card-body pong-game">
                            <p class="card-text pong-game">${tr("Play 1v1 Online Pong.")}</p>
                            <button type="button" class="btn btn-success play" id="play-pong-1v1">${tr("Play")}</button>
                        </div>
                    </div>
                    <div class="card pong-game">
                        <h5 class="card-title pong-game">Pong</h5>
                        <img src="/favicon.svg" class="card-img-top pong-game" alt="..." />
                        <div class="card-body pong-game">
                            <p class="card-text pong-game">${tr("Create a Pong Tournament.")}</p>
                            <button type="button" class="btn btn-success play" id="play-pong-tournament">
                                ${tr("Create")}
                            </button>
                        </div>
                    </div>
                </div>
            </div>`
        );
    }
}
