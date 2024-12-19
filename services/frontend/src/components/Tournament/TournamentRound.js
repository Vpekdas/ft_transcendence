import { Component, globalComponents, html } from "../../micro";
import NavBar from "../../components/NavBars/HomeNavBar";
import { tr } from "../../i18n";
import { getNickname } from "../../api";

export default class TournamentRound extends Component {
    constructor() {
        super();
    }

    createRound(player1, player2, score1, score2) {
        return /* HTML */ `
            <div class="container-fluid tournament-match-container">
                <div class="tournament-match">
                    <span class="player-1">${player1}</span>
                    <span class="player-2">${player2}</span>
                </div>
                <div class="tournament-match score">
                    <span class="player-1">${score1}</span>
                    <span class="player-2">${score2}</span>
                </div>
            </div>
        `;
    }

    async render() {
        let rounds = "";
        let roundCount = parseInt(this.attrib("roundCount"));
        const data = JSON.parse(this.attrib("data"));

        for (let i = 0; i < roundCount; i++) {
            const player1 = data[i]["player1"] ? await getNickname("" + data[i]["player1"]) : "<i>TBD</i>";
            const player2 = data[i]["player2"] ? await getNickname("" + data[i]["player2"]) : "<i>TBD</i>";
            const score1 = data[i]["score1"] ? data[i]["score1"] : "0";
            const score2 = data[i]["score2"] ? data[i]["score1"] : "0";

            rounds += this.createRound(player1, player2, score1, score2);
        }

        return html(/* HTML */ ` <div class="tournament-round">${rounds}</div>`);
    }
}
globalComponents.set("TournamentRound", TournamentRound);
