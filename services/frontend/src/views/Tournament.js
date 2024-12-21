import { Component, globalComponents, html } from "../micro";
import NavBar from "../components/NavBars/HomeNavBar";
import DonutChart from "../components/Charts/DonutChart";
import { fetchApi, isLoggedIn, getOriginNoProtocol, getNickname } from "../api";
import ChangePasswordForm from "../components/Forms/ChangePasswordForm";
import ChangeNicknameForm from "../components/Forms/ChangeNicknameForm";
import DeleteAccountForm from "../components/Forms/DeleteAccountForm";
import ChangeProfilePictureForm from "../components/Forms/ChangeProfilePictureForm";
import { navigateTo } from "../router";
import { tr } from "../i18n";
import TournamentRound from "../components/Tournament/TournamentRound";

export default class Tournament extends Component {
    constructor() {
        super();
    }

    async render() {
        this.setTitle("Tournament");

        const id = this.attrib("id");
        const ws = new WebSocket(`ws://${getOriginNoProtocol()}:8000/tournament/${id}`);
        ws.onopen = (event) => {
            ws.send(JSON.stringify({ type: "join" }));
        };
        ws.onmessage = async (event) => {
            const data = JSON.parse(event.data);

            if (data["type"] == "players") {
                let players = "";
                for (let p of data["players"]) {
                    let nickname = await getNickname(p);
                    players += /* HTML */ `<span>${nickname}</span>`;
                }
                document.getElementById("player-list").innerHTML = players;
            } else if (data["type"] == "rounds") {
                let container = document.getElementById("match-container");

                container.replaceChildren([]);

                for (let round of data["rounds"]) {
                    let games = round["games"];
                    container.appendChild(
                        html(
                            /* HTML */ ` <div class="container-fluid round-container">
                                <TournamentRound roundCount="${games.length}" data=${JSON.stringify(games)} />
                                <div class="container-fluid bracket-container">
                                    <div class="bracket" row="1"></div>
                                </div>
                            </div>`
                        )
                    );
                }

                // ! Improve this !
                const brackets = document.querySelectorAll(".bracket");
                const games = data["rounds"];

                console.log(games);
                if (games.length == 1) {
                    brackets.forEach((bracket) => {
                        bracket.style.display = "none";
                    });
                }

                if (games.length == 2) {
                    brackets.forEach((bracket) => {
                        bracket.style.display = "flex";
                        bracket.style.height = "50%";
                    });
                    brackets[1].style.display = "none";
                }

                if (games.length == 3) {
                    brackets.forEach((bracket) => {
                        bracket.style.display = "flex";
                    });
                    const bracketContainer = document.querySelector(".container-fluid.bracket-container");

                    const newBracket = document.createElement("div");
                    newBracket.className = "bracket";
                    newBracket.setAttribute("row", "1");
                    newBracket.style.height = "25%";
                    bracketContainer.appendChild(newBracket);

                    brackets[0].style.height = "25%";
                    brackets[2].style.display = "none";
                }
            } else if (data["type"] == "match") {
                // console.log(data);
                navigateTo(`/play/${data["id"]}`);
            }
        };

        this.query("#start-tournament").on("click", () => {
            ws.send(JSON.stringify({ type: "start" }));
        });

        return html(
            /* HTML */
            ` <div>
                <NavBar />
                <div class="container-fluid dashboard-container tournament-container">
                    <div class="container-fluid dashboard-container match-container" id="match-container"></div>
                    <div class="container-fluid dashboard-container player-container">
                        <h2>Tournament Name</h2>
                        <div id="player-list"></div>
                        <div class="btn-create-tournament-container">
                            <button class="btn btn-primary settings" id="start-tournament">Start Game</button>
                        </div>
                    </div>
                </div>
            </div>`
        );
    }
}
globalComponents.set("Tournament", Tournament);
