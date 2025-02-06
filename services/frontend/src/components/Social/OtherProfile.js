import { tr } from "../../i18n";
import { Component } from "../../micro";
import { api, fetchApi, post, getNickname } from "../../utils";

/** @type {import("../../micro").Component} */

export default class OtherProfile extends Component {
    showProfile() {
        const div = document.createElement("div");
        div.classList.add("card", "settings", "other-profile");

        const header = document.createElement("h5");
        header.classList.add("card-title", "settings");
        header.innerHTML = tr("Profile Picture");

        const img = document.createElement("img");
        img.classList.add("card-img-top", "profile");
        img.src = api("/api/player/c/picture");

        const div2 = document.createElement("div");
        div2.classList.add("card", "settings", "other-profile");

        const secondHeader = document.createElement("h5");
        secondHeader.classList.add("card-title", "settings");
        secondHeader.innerHTML = tr("Nickname");

        const nickname = document.createElement("div");
        nickname.classList.add("card-body", "settings", "other-profile");
        nickname.innerHTML = "Actual nickname";

        div.appendChild(header);
        div.appendChild(img);

        div2.appendChild(secondHeader);
        div2.appendChild(nickname);

        this.dataContainer.appendChild(div);
        this.dataContainer.appendChild(div2);
    }

    async showMatchHistory() {
        const ul = document.createElement("ul");
        ul.classList.add("list-group", "match-history");

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

                const li = document.createElement("list-group-item");
                li.classList.add("list-group-item");

                const player1 = document.createElement("span");
                player1.classList.add(player1Class);
                const historyPlayer1 = document.createElement("span");
                historyPlayer1.classList.add("history-player-name");
                historyPlayer1.innerHTML = result["player1"];
                const scorePlayer1 = document.createElement("span");
                scorePlayer1.classList.add("score");
                scorePlayer1.innerHTML = result["score1"];

                player1.appendChild(historyPlayer1);
                player1.appendChild(scorePlayer1);

                const vs = document.createElement("span");
                vs.classList.add("vs");
                vs.innerHTML = "vs";

                const player2 = document.createElement("span");
                player2.classList.add(player2Class);
                const historyPlayer2 = document.createElement("span");
                historyPlayer2.classList.add("history-player-name");
                historyPlayer2.innerHTML = result["player2"];
                const scorePlayer2 = document.createElement("span");
                scorePlayer2.classList.add("score");
                scorePlayer2.innerHTML = result["score2"];

                player2.appendChild(historyPlayer2);
                player2.appendChild(scorePlayer2);

                const time = document.createElement("span");
                time.classList.add("history-time");
                time.innerHTML = this.timeInMinutes(result["timeEnded"] - result["timeStarted"]);

                const gamemode = document.createElement("span");
                gamemode.classList.add("history-gamemode");
                gamemode.innerHTML = this.gamemodeName(result["tid"], result["gamemode"]);

                const date = document.createElement("span");
                date.classList.add("history-date");
                date.innerHTML = this.timeAsDate(result["timeEnded"]);

                li.appendChild(player1);
                li.appendChild(vs);
                li.appendChild(player2);
                li.appendChild(time);
                li.appendChild(gamemode);
                li.appendChild(date);

                ul.appendChild(li);

                this.dataContainer.appendChild(ul);
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

    async init() {
        this.results = await post("/api/player/c/matches").then((res) => res.json());

        if (this.results != undefined && this.results["results"] != undefined) {
            for (let result of this.results["results"]) {
                result["player1"] = await getNickname(result["player1"]);
                result["player2"] = await getNickname(result["player2"]);
            }
        }

        this.onready = async () => {
            this.dataContainer = document.getElementById("other-profile-data");
            this.showProfile();

            const navLinks = document.querySelectorAll(".nav-item");

            navLinks.forEach((link) => {
                link.addEventListener("click", async () => {
                    const data = link.querySelector(".nav-link").getAttribute("data");
                    this.dataContainer.innerHTML = "";

                    if (data === "Profile") {
                        this.showProfile();
                    } else if (data === "Match History") {
                        await this.showMatchHistory();
                    } else if (data === "Statistics") {
                    }
                });
            });
        };
    }

    render() {
        return /* HTML */ ` <div class="container-fluid dashboard-container other-profile">
            <div class="container-fluid dashboard-navbar other-profile">
                <ul class="nav flex-column dashboard-tab other-profile">
                    <li class="nav-item">
                        <a class="nav-link custom-link" data="Profile">
                            <i class="bi bi-person-badge"></i>
                            <span>${tr("Profile")}</span>
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link custom-link" data="Match History">
                            <i class="bi bi-clock-history"></i>
                            <span>${tr("Match History")}</span>
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link custom-link" data="Statistics">
                            <i class="bi bi-file-bar-graph"></i>
                            <span>${tr("Statistics")}</span>
                        </a>
                    </li>
                </ul>
            </div>
            <ul class="list-group settings other-profile" id="other-profile-data"></ul>
        </div>`;
    }
}
