import { tr } from "../i18n";
import { Component } from "../micro";
import { getNickname, post } from "../utils";

export default class MatchHistory extends Component {
    async init() {
        document.title = tr("Match History");

        this.results = await post("/api/player/c/matches").then((res) => res.json());

        if (this.results != undefined && this.results["results"] != undefined) {
            for (let result of this.results["results"]) {
                result["player1"] = await getNickname(result["player1"]);
                result["player2"] = await getNickname(result["player2"]);
            }
        }
    }

    timeInMinutes(s) {
        if (s < 10) {
            return "0:0" + s;
        } else if (s < 60) {
            return "0:" + s;
        } else {
            let r = s % 60;
            if (r < 10) return s / 60 + ":";
            else return s / 60 + ":0" + r;
        }
    }

    gamemodeName(tid, gamemode) {
        if (tid != undefined) {
            return tr("Tournament");
        } else if (gamemode == "1v1local") {
            return tr("Local");
        } else if (gamemode == "1v1") {
            return tr("Remote");
        }
    }

    render() {
        let html = "";

        if (this.results != undefined && this.results["results"] != undefined) {
            for (let result of this.results["results"]) {
                let player1Class = "";
                let player2Class = "";

                if (result["score1"] > result["score2"]) {
                    player1Class = "history-winner";
                    player2Class = "history-looser";
                } else {
                    player1Class = "history-looser";
                    player2Class = "history-winner";
                }

                html += /* HTML */ ` <li class="list-group-item">
                    <span class="${player1Class}">
                        <span class="history-player-name">${result["player1"]}</span>
                        <span class="score">${result["score1"]}</span>
                    </span>
                    <span class="vs">vs</span>
                    <span class="${player2Class}">
                        <span class="score">${result["score2"]}</span>
                        <span class="history-player-name">${result["player2"]}</span>
                    </span>
                    <span class="history-time">${this.timeInMinutes(result["timeEnded"] - result["timeStarted"])}</span>
                    <span class="history-gamemode">${this.gamemodeName(result["tid"], result["gamemode"])}</span>
                </li>`;
            }
        }

        return /* HTML */ ` <div class="container-fluid dashboard-container">
            <ProfileNavBar />
            <ul class="list-group match-history">
                ${html}
            </ul>
        </div>`;
    }
}
