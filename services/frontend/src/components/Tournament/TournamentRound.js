import { Component, html } from "../../micro";
import NavBar from "../../components/NavBars/HomeNavBar";
import { getNickname } from "../../utils";

export default class TournamentRound extends Component {
    constructor() {
        super();
    }

    createRound(player1, player2, id1, id2, score1, score2, winner) {
        const winner1 = winner == undefined ? "" : winner == id1 ? "winner" : "looser";
        const winner2 = winner == undefined ? "" : winner == id2 ? "winner" : "looser";

        return /* HTML */ `
            <div class="container-fluid tournament-match-container">
                <div class="player-info ${winner1}">
                    <span class="player-name">${player1}</span>
                    <span class="player-score">${score1}</span>
                </div>
                <div class="glitch-wrapper vs">
                    <div class="glitch vs" data-glitch="VS">VS</div>
                </div>
                <div class="player-info ${winner2}">
                    <span class="player-name">${player2}</span>
                    <span class="player-score">${score2}</span>
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
            const score2 = data[i]["score2"] ? data[i]["score2"] : "0";
            const winner = data[i]["winner"];

            rounds += this.createRound(
                player1,
                player2,
                data[i]["player1"],
                data[i]["player2"],
                score1,
                score2,
                winner
            );
        }

        return html(/* HTML */ `<div class="tournament-round">${rounds}</div>`);
    }
}
