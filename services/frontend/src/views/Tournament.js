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

        let players = "";

        const id = this.attrib("id");
        const ws = new WebSocket(`ws://${getOriginNoProtocol()}:8000/tournament/${id}`);
        ws.onopen = (event) => {
            ws.send(JSON.stringify({ type: "join" }));
        };
        ws.onmessage = async (event) => {
            const data = JSON.parse(event.data);

            console.log(data);

            if (data["type"] == "players") {
                players = "";
                for (let p of data["players"]) {
                    let nickname = (await getNickname(p).then((res) => res.json()))["nickname"];
                    players += /* HTML */ `<span>${nickname}</span>`;
                }
                document.getElementById("player-list").innerHTML = players;
            }
        };

        return html(
            /* HTML */
            ` <div>
                <NavBar />
                <div class="container-fluid dashboard-container tournament-container">
                    <div class="container-fluid dashboard-container match-container">
                        <TournamentRound roundCount="4" />
                        <TournamentRound roundCount="2" />
                        <TournamentRound roundCount="1" />
                    </div>
                    <div class="container-fluid dashboard-container player-container">
                        <h2>Tournament Name</h2>
                        <div id="player-list"></div>
                        <div class="btn-create-tournament-container">
                            <button type="submit" class="btn btn-primary settings">Start Game</button>
                        </div>
                    </div>
                </div>
            </div>`
        );
    }
}
globalComponents.set("Tournament", Tournament);
