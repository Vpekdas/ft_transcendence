import { tr } from "../i18n";
import { navigateTo } from "../micro";

/** @type {import("../micro").Component} */
export default async function Home({ object, dom }) {
    document.title = tr("Home");

    dom.querySelector("#play-pong-1v1local").on("click", () => {
        navigateTo("/matchmake/pong?gamemode=1v1local");
    });

    dom.querySelector("#play-pong-1v1").on("click", () => {
        navigateTo("/matchmake/pong?gamemode=1v1");
    });

    dom.querySelector("#play-pong-tournament").on("click", () => {
        navigateTo("/create-tournament");
    });

    return /* HTML */ `
        <NavBar />
        <div class="container-fluid game-container">
            <div id="toast-container"></div>
            <div class="card pong-game">
                <h5 class="card-title pong-game">Pong</h5>
                <img src="/favicon.svg" class="card-img-top pong-game" alt="..." />
                <div class="card-body pong-game">
                    <p class="card-text pong-game">${tr("Play 1v1 Local Pong.")}</p>
                    <button type="button" class="btn btn-success play" id="play-pong-1v1local">${tr("Play")}</button>
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
    `;
}
