import { tr } from "../i18n";
import { Component } from "../micro";
import { getNickname, post } from "../utils";

export default class Statistics extends Component {
    async init() {
        document.title = tr("Statistics");
        await this.fetchMatchData();
        await this.showStatistics();
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

    convertToSeconds(duration) {
        const [minutes, seconds] = duration.split(":").map(Number);
        return minutes * 60 + seconds;
    }

    convertToMinutesAndSeconds(totalSeconds) {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
    }

    async fetchMatchData() {
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

                let player1Name = await getNickname(result["player1"]);
                let player2Name = await getNickname(result["player2"]);

                const gamemode = this.gamemodeName(result["tid"], result["gamemode"]);

                if (result["score1"] > result["score2"]) {
                    if (gamemode !== tr("Local") && player1Name === actualName) {
                        this.winCount++;
                    }
                } else {
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
            }
        }
    }

    async showStatistics() {
        // prettier-ignore
        this.statisticsHTML = /* HTML */ `<ul class="list-group statistics">`;

        this.winRatio = 0;
        this.loseRatio = 0;
        this.gameDurationSum = 0;
        this.averageGameDuration = "0:00";

        if (this.matchCount !== 0) {
            this.winRatio = ((this.winCount / this.matchCount) * 100).toFixed(2);
            this.loseRatio = (100 - this.winRatio).toFixed(2);

            this.gameDurationSum = this.gameDurationArray
                .map(this.convertToSeconds)
                .reduce((sum, duration) => sum + duration, 0);

            this.averageGameDuration = this.convertToMinutesAndSeconds(this.gameDurationSum / this.matchCount);

            this.localRatio = ((this.localCount / this.matchCount) * 100).toFixed(2);
            this.remoteRatio = ((this.remoteCount / this.matchCount) * 100).toFixed(2);
            this.tournamentRatio = ((this.tournamentCount / this.matchCount) * 100).toFixed(2);
        }

        const donutChartConfig = {
            width: "400",
            height: "200",
            viewWidth: 50,
            viewHeight: 50,
            colorNumber: "2",
            color1: "#00FF00",
            color2: "#FF0000",
            fillPercent1: this.winRatio,
            fillPercent2: this.loseRatio,
            title: "Win / Lose ratio",
            titleColor: "#d89123",
        };

        const donutChartConfig2 = {
            width: "400",
            height: "200",
            viewWidth: 50,
            viewHeight: 50,
            colorNumber: "3",
            color1: "#00FF00",
            color2: "#FF0000",
            color2: "#0000FF",
            fillPercent1: this.localRatio,
            fillPercent2: this.remoteRatio,
            fillPercent3: this.tournamentRatio,
            title: "Gamemode Distrib",
            titleColor: "#d89123",
        };

        const lineChartPoints = this.gameDurationArray.map((duration, index) => {
            return { x: index, y: this.convertToSeconds(duration) };
        });

        const lineChartConfig = {
            width: 600,
            height: 300,
            viewWidth: 600,
            viewHeight: 400,
            points: lineChartPoints,
            lineColor: "#00FF00",
            circleColor: "#00FFFF",
            title: "Game Duration",
            duration: true,
        };

        const lineChartPoints2 = this.averageGamePointArray.map((point, index) => {
            return { x: index, y: point };
        });

        const lineChartConfig2 = {
            width: 600,
            height: 300,
            viewWidth: 600,
            viewHeight: 400,
            points: lineChartPoints2,
            lineColor: "#00FF00",
            circleColor: "#00FFFF",
            title: "Average Point in Game",
            duration: false,
        };

        // prettier-ignore
        this.statisticsHTML += /* HTML */ `<div class="container-fluid donut-chart-container">`
        this.statisticsHTML += `<DonutChart config='${JSON.stringify({ donutChartConfig: donutChartConfig })}' />`;
        this.statisticsHTML += `<DonutChart config='${JSON.stringify({ donutChartConfig: donutChartConfig2 })}' />`;
        this.statisticsHTML += /* HTML */ `</div>`;

        if (this.remoteCount >= 2 || this.tournamentCount >= 2) {
            // prettier-ignore
            this.statisticsHTML += /* HTML */ `<div class="container-fluid line-chart-container">`;
            this.statisticsHTML += `<LineChart config='${JSON.stringify({ lineChartConfig: lineChartConfig })}' />`;
            this.statisticsHTML += `<LineChart config='${JSON.stringify({ lineChartConfig: lineChartConfig2 })}' />`;
            this.statisticsHTML += /* HTML */ `</div>`;
        }

        this.statisticsHTML += `</ul>`;
    }

    render() {
        return /* HTML */ ` <div class="container-fluid dashboard-container">
            <ProfileNavBar />
            ${this.statisticsHTML}
        </div>`;
    }
}
