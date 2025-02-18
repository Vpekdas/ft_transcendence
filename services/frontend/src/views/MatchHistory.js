import { tr } from "../i18n";
import { Component } from "../micro";
import { getNickname, post } from "../utils";

export default class MatchHistory extends Component {
    async init() {
        document.title = tr("Match History");
        await this.showMatchHistory();
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

    timeAsDate(s) {
        const date = new Date(s * 1000);
        return date.getUTCFullYear() + "-" + (date.getUTCMonth() + 1) + "-" + date.getUTCDate();
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

    async showMatchHistory() {
        this.info = await post("/api/player/c/nickname").then((res) => res.json());
        const actualName = this.info["nickname"];

        this.results = await post("/api/player/c/matches").then((res) => res.json());
        this.matchCount = 0;
        this.winCount = 0;
        this.localCount = 0;
        this.tournamentCount = 0;
        this.remoteCount = 0;
        this.gameDurationArray = [];
        this.averageGamePointArray = [];
        // prettier-ignore
        this.matchHistoryHTML = /* HTML */ `<div class="accordion container">`;

        if (this.results != undefined && this.results["results"] != undefined) {
            for (let result of this.results["results"]) {
                this.matchCount++;
                let player1Class = "history-winner";
                let player2Class = "history-looser";

                let player1Name = await getNickname(result["player1"]);
                let player2Name = await getNickname(result["player2"]);

                const gamemode = this.gamemodeName(result["tid"], result["gamemode"]);

                if (result["score1"] > result["score2"]) {
                    player1Class = "history-winner";
                    player2Class = "history-looser";

                    if (gamemode !== tr("Local") && player1Name === actualName) {
                        this.winCount++;
                    }
                } else {
                    player1Class = "history-looser";
                    player2Class = "history-winner";

                    if (gamemode !== tr("Local") && player2Name === actualName) {
                        this.winCount++;
                    }
                }

                if (player1Name === actualName) {
                    this.averageGamePointArray.push(result["score1"]);
                } else if (player2Name === actualName) {
                    this.averageGamePointArray.push(result["score2"]);
                }

                if (gamemode == tr("Local")) {
                    player1Name += "(L)";
                    player2Name += "(R)";
                    this.localCount++;
                }

                if (gamemode == tr("Remote")) {
                    this.remoteCount++;
                }

                if (gamemode == tr("Tournament")) {
                    this.tournamentCount++;
                }

                const time = this.timeInMinutes(result["timeEnded"] - result["timeStarted"]);
                this.gameDurationArray.push(time);

                const config = {
                    player1Class: player1Class,
                    player2Class: player2Class,
                    player1Name: player1Name,
                    player2Name: player2Name,
                    player1Score: result["score1"],
                    player2Score: result["score2"],
                    historyTime: time,
                    gamemode: gamemode,
                    date: this.timeAsDate(result["timeEnded"]),
                };

                if (result["stats"]["p1"]["up_count"] > result["stats"]["p2"]["up_count"]) {
                    player1Class = "bar-chart-rectangle-higher";
                    player2Class = "bar-chart-rectangle-lower";
                } else {
                    player1Class = "bar-chart-rectangle-lower";
                    player2Class = "bar-chart-rectangle-higher";
                }

                const barChartConfig1 = {
                    width: "180",
                    height: "80",
                    title: "Up Count",
                    player1Class: player1Class,
                    player1Name: player1Name,
                    firstElementWidth: result["stats"]["p1"]["up_count"],
                    player2Class: player2Class,
                    player2Name: player2Name,
                    secondElementWidth: result["stats"]["p2"]["up_count"],
                };

                if (result["stats"]["p1"]["down_count"] > result["stats"]["p2"]["down_count"]) {
                    player1Class = "bar-chart-rectangle-higher";
                    player2Class = "bar-chart-rectangle-lower";
                } else {
                    player1Class = "bar-chart-rectangle-lower";
                    player2Class = "bar-chart-rectangle-higher";
                }

                const barChartConfig2 = {
                    width: "180",
                    height: "80",
                    title: "Down Count",
                    player1Class: player1Class,
                    player1Name: player1Name,
                    firstElementWidth: result["stats"]["p1"]["down_count"],
                    player2Class: player2Class,
                    player2Name: player2Name,
                    secondElementWidth: result["stats"]["p2"]["down_count"],
                };

                const heatMapConfig = result["stats"]["heatmap"];

                // prettier-ignore
                this.matchHistoryHTML += `<Accordion config='${JSON.stringify({
                        config: config, 
                        barChart1: barChartConfig1, 
                        barChart2: barChartConfig2,
                        heatMap: heatMapConfig})}' />`;
            }
            this.matchHistoryHTML += /* HTML */ `</div>`;
        }
    }

    render() {
        return /* HTML */ ` <div class="container-fluid dashboard-container">
            <ProfileNavBar />
            <ul class="list-group match-history">
                ${this.matchHistoryHTML}
            </ul>
        </div>`;
    }
}
