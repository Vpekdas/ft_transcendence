import { tr } from "../../i18n";
import { Component } from "../../micro";
import { api, fetchApi, post, getNickname, getUserIdByNickname } from "../../utils";
export default class OtherProfile extends Component {
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

    async showProfile() {
        const actualName = this.attributes.get("nickname");
        const actualId = await getUserIdByNickname(actualName);

        this.profileHTML = /* HTML */ `
            <div class="container-fluid card-other-profile-container">
                <div class="card settings other-profile">
                    <h5 class="card-title settings">${tr("Profile Picture")}</h5>
                    <img class="card-img-top profile" src="${api("/api/player/" + actualId + "/picture")}" />
                </div>
                <div class="card settings other-profile">
                    <h5 class="card-title settings">${tr("Nickname")}</h5>
                    <div class="card-body settings other-profile">${actualName}</div>
                </div>
                <div class="card settings other-profile">
                    <h5 class="card-title settings">${tr("Elo")}</h5>
                    <div class="card-body settings other-profile">${this.elo.pongElo}</div>
                </div>
            </div>
        `;
    }

    async showMatchHistory() {
        const actualName = this.attributes.get("nickname");
        const actualId = await getUserIdByNickname(actualName);
        this.results = await post("/api/player/" + actualId + "/matches").then((res) => res.json());
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
                        this.averageGamePointArray.push(result["score1"]);
                    }
                } else {
                    player1Class = "history-looser";
                    player2Class = "history-winner";

                    if (gamemode !== tr("Local") && player2Name === actualName) {
                        this.winCount++;
                        this.averageGamePointArray.push(result["score2"]);
                    }
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

    convertToSeconds(duration) {
        const [minutes, seconds] = duration.split(":").map(Number);
        return minutes * 60 + seconds;
    }

    convertToMinutesAndSeconds(totalSeconds) {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
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

        // prettier-ignore
        this.statisticsHTML += /* HTML */ `<div class="container-fluid line-chart-container">`;
        this.statisticsHTML += `<LineChart config='${JSON.stringify({ lineChartConfig: lineChartConfig })}' />`;

        if (this.averageGamePointArray.length > 1) {
            this.statisticsHTML += `<LineChart config='${JSON.stringify({ lineChartConfig: lineChartConfig2 })}' />`;
        }
        this.statisticsHTML += /* HTML */ `</div>`;

        this.statisticsHTML += `</ul>`;
    }

    async init() {
        const [otherProfileNickname, setOtherProfileNickname] = this.usePersistent("otherProfileNickname", "");
        const [otherProfileTab, setOtherProfileTab] = this.usePersistent("otherProfileTab", "Profile");

        const actualName = this.attributes.get("nickname");
        const actualId = await getUserIdByNickname(actualName);
        this.results = await post("/api/player/" + actualId + "/matches").then((res) => res.json());
        this.elo = await post("/api/player/" + actualId + "/profile").then((res) => res.json());

        await this.showProfile();
        await this.showMatchHistory();
        await this.showStatistics();

        this.onready = async () => {
            const navLinks = document.querySelectorAll(".nav-item");

            navLinks.forEach((link) => {
                link.addEventListener("click", async () => {
                    const data = link.querySelector(".nav-link").getAttribute("data");

                    if (data === "Profile") {
                        setOtherProfileTab("Profile");
                    } else if (data === "Match History") {
                        setOtherProfileTab("Match History");
                    } else if (data === "Statistics") {
                        setOtherProfileTab("Statistics");
                    }
                });
            });

            const returnBtn = document.getElementById("confirm-button");

            returnBtn.addEventListener("click", async () => {
                setOtherProfileNickname("");
            });
        };
    }

    render() {
        const [otherProfileTab, setOtherProfileTab] = this.usePersistent("otherProfileTab", "");

        if (otherProfileTab() === "Profile") {
            this.dataHTML = this.profileHTML;
        } else if (otherProfileTab() === "Match History") {
            this.dataHTML = this.matchHistoryHTML;
        } else if (otherProfileTab() === "Statistics") {
            this.dataHTML = this.statisticsHTML;
        }

        return /* HTML */ ` <div class="container-fluid dashboard-container other-profile" id="other-player-profile">
            <div class="container-fluid dashboard-navbar other-profile">
                <ul class="nav flex-column dashboard-tab other-profile">
                    <li class="nav-item">
                        <a class="nav-link custom-link other-profile" data="Profile">
                            <i class="bi bi-person-badge"></i>
                            <span>${tr("Profile")}</span>
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link custom-link other-profile" data="Match History">
                            <i class="bi bi-clock-history"></i>
                            <span>${tr("Match History")}</span>
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link custom-link other-profile" data="Statistics">
                            <i class="bi bi-file-bar-graph"></i>
                            <span>${tr("Statistics")}</span>
                        </a>
                    </li>
                </ul>
            </div>
            <ul class="list-group settings other-profile" id="other-profile-data">
                ${this.dataHTML}
            </ul>
            <button id="confirm-button" class="modal-button other-profile">${tr("Return")}</button>
        </div>`;
    }
}
