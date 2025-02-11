import { tr } from "../i18n";
import { Component, navigateTo } from "../micro";

export default class Home extends Component {
    async init() {
        document.title = tr("Home");

        this.onready = () => {
            document.querySelector("#play-pong-1v1local").addEventListener("click", () => {
                navigateTo("/matchmake/pong?gamemode=1v1local");
            });

            document.querySelector("#play-pong-1v1").addEventListener("click", () => {
                navigateTo("/matchmake/pong?gamemode=1v1");
            });

            document.querySelector("#play-pong-tournament").addEventListener("click", () => {
                navigateTo("/create-tournament");
            });
        };
    }

    render() {
        return /* HTML */ `
            <HomeNavBar />
            <div class="container-fluid home-container">
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
                <div class="container-fluid outer-wilds-container">
                    <OuterWilds />
                    <Coordinates />
                    <EyeOfTheUniverse />
                </div>
            </div>
            <Chatbox />
        `;
    }
}
