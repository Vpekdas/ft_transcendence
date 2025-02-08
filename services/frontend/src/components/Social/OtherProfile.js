import { tr } from "../../i18n";
import { Component } from "../../micro";
import { api, fetchApi, post, getNickname, getUserIdByNickname } from "../../utils";
import Accordion from "../Accordion";
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

        const div = document.createElement("div");
        div.classList.add("card", "settings", "other-profile");

        const header = document.createElement("h5");
        header.classList.add("card-title", "settings");
        header.innerHTML = tr("Profile Picture");

        const img = document.createElement("img");
        img.classList.add("card-img-top", "profile");
        img.src = api("/api/player/" + actualId + "/picture");

        const div2 = document.createElement("div");
        div2.classList.add("card", "settings", "other-profile");

        const secondHeader = document.createElement("h5");
        secondHeader.classList.add("card-title", "settings");
        secondHeader.innerHTML = tr("Nickname");

        const nickname = document.createElement("div");
        nickname.classList.add("card-body", "settings", "other-profile");
        nickname.innerHTML = actualName;

        div.appendChild(header);
        div.appendChild(img);

        div2.appendChild(secondHeader);
        div2.appendChild(nickname);

        const dataContainer = document.getElementById("other-profile-data");
        dataContainer.appendChild(div);
        dataContainer.appendChild(div2);
    }

    async showMatchHistory() {
        this.results = await post("/api/player/c/matches").then((res) => res.json());

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

                const config = {
                    player1Class: player1Class,
                    player2Class: player2Class,
                    player1Name: result["player1"],
                    player2Name: result["player2"],
                    player1Score: result["score1"],
                    player2Score: result["score2"],
                    historyTime: this.timeInMinutes(result["timeEnded"] - result["timeStarted"]),
                    gamemode: this.gamemodeName(result["tid"], result["gamemode"]),
                    date: this.timeAsDate(result["timeEnded"]),
                };

                this.appendAccordionInstances(config);
            }
        }
    }

    // TODO: Get the date from backend.
    appendAccordionInstances(config) {
        const chartConfig = {
            width: "200",
            colorNumber: "2",
            color1: "#4287f5",
            color2: "#42f58d",
            fillPercent1: "30",
            fillPercent2: "70",
        };

        const accordionInstance = new Accordion(config, chartConfig);
        accordionInstance.init();
        this.accordionContainer.innerHTML += accordionInstance.render();
    }

    async init() {
        this.onready = async () => {
            this.dataContainer = document.getElementById("other-profile-data");
            const profile = document.getElementById("other-player-profile");
            const navLinks = document.querySelectorAll(".nav-item");

            await this.showProfile();

            navLinks.forEach((link) => {
                link.addEventListener("click", async () => {
                    this.dataContainer.innerHTML = "";
                    const data = link.querySelector(".nav-link").getAttribute("data");

                    if (data === "Profile") {
                        await this.showProfile();
                    } else if (data === "Match History") {
                        // Create the accordion container
                        this.accordionContainer = document.createElement("div");
                        this.accordionContainer.classList.add("accordion", "container");
                        this.accordionContainer.id = "match-history-accordion";
                        this.dataContainer.appendChild(this.accordionContainer);

                        // Create accordions.
                        await this.showMatchHistory();
                    } else if (data === "Statistics") {
                    }
                });
            });

            const returnBtn = document.getElementById("confirm-button");

            returnBtn.addEventListener("click", async () => {
                profile.style.display = "none";
            });
        };
    }

    render() {
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
            <ul class="list-group settings other-profile" id="other-profile-data"></ul>
            <button id="confirm-button" class="modal-button other-profile">Return</button>
        </div>`;
    }
}
