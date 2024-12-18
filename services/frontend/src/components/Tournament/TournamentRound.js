import { Component, globalComponents, html } from "../../micro";
import NavBar from "../../components/NavBars/HomeNavBar";
import { tr } from "../../i18n";

export default class TournamentRound extends Component {
    constructor() {
        super();
    }

    createRound() {
        return /* HTML */ `
            <div class="container-fluid tournament-match-container">
                <div class="tournament-match">
                    <span class="player-1">Player 1</span>
                    <span class="player-2">Player 2</span>
                </div>
                <div class="tournament-match score">
                    <span class="player-1">42</span>
                    <span class="player-2">21</span>
                </div>
            </div>
        `;
    }

    async render() {
        let rounds = "";
        let roundCount = parseInt(this.attrib("roundCount"));

        for (let i = 0; i < roundCount; i++) {
            rounds += this.createRound();
        }

        return html(/* HTML */ ` <div class="tournament-round">${rounds}</div>`);
    }
}
globalComponents.set("TournamentRound", TournamentRound);
