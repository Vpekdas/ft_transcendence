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

    createBracket(games) {
        const brackets = document.querySelectorAll(".bracket");

        if (games.length == 1) {
            brackets.forEach((bracket) => {
                bracket.style.display = "none";
            });
        }

        if (games.length == 2) {
            brackets.forEach((bracket) => {
                // Display all brackets.
                bracket.style.display = "flex";
                // ! I will remove magic percent.
                bracket.style.height = "50%";
            });
            // Remove the additional brackets on second column.
            brackets[1].style.display = "none";
        }

        if (games.length == 3) {
            brackets.forEach((bracket) => {
                bracket.style.display = "flex";
            });
            const bracketContainer = document.querySelector(".container-fluid.bracket-container");

            // Add another bracket with the right percent.
            const newBracket = document.createElement("div");
            newBracket.className = "bracket";
            newBracket.setAttribute("row", "1");
            // ! I will remove magic percent.
            newBracket.style.height = "25%";
            bracketContainer.appendChild(newBracket);

            brackets[0].style.height = "25%";
            brackets[2].style.display = "none";
        }
    }

    createBinaryParticle(particleNumber) {
        const container = document.querySelector(".particle-container");

        for (let i = 0; i < particleNumber; i++) {
            const particle = document.createElement("div");

            if (i % 2 === 0) {
                particle.textContent = "0";
            } else {
                particle.textContent = "1";
            }

            particle.classList.add("binary-particle");

            particle.style.setProperty("--startY", `${Math.random() * 100}vh`);
            particle.style.setProperty("--startX", `${Math.random() * 100}vw`);
            particle.style.setProperty("--endY", `${Math.random() * 100}vh`);
            particle.style.setProperty("--endX", `${Math.random() * 100}vw`);

            container.appendChild(particle);
        }
    }

    createDotParticle(particleNumber) {
        const container = document.querySelector(".particle-container");

        for (let i = 0; i < particleNumber; i++) {
            const particle = document.createElement("div");

            particle.classList.add("dot-particle");

            particle.style.setProperty("--startY", `${Math.random() * 100}vh`);
            particle.style.setProperty("--startX", `${Math.random() * 100}vw`);
            particle.style.setProperty("--endY", `${Math.random() * 100}vh`);
            particle.style.setProperty("--endX", `${Math.random() * 100}vw`);

            container.appendChild(particle);
        }
    }

    async render() {
        this.setTitle("Tournament");

        const id = this.attrib("id");
        const ws = new WebSocket(`ws://${getOriginNoProtocol()}:8000/tournament/${id}`);
        ws.onopen = (event) => {
            ws.send(JSON.stringify({ type: "join" }));
        };
        ws.onmessage = async (event) => {
            const data = JSON.parse(event.data);

            if (data["type"] == "players") {
                let players = "";
                for (let p of data["players"]) {
                    let nickname = await getNickname(p);
                    players += /* HTML */ `<span>${nickname}</span>`;
                }
                document.getElementById("player-list").innerHTML = players;
            } else if (data["type"] == "rounds") {
                let container = document.getElementById("match-container");

                container.replaceChildren([]);

                for (let round of data["rounds"]) {
                    let games = round["games"];
                    container.appendChild(
                        html(
                            /* HTML */ ` <div class="container-fluid round-container">
                                <TournamentRound roundCount="${games.length}" data=${JSON.stringify(games)} />
                                <div class="container-fluid bracket-container">
                                    <div class="bracket" row="1"></div>
                                </div>
                            </div>`
                        )
                    );
                }
                this.createBracket(data["rounds"]);
                this.createBinaryParticle(15);
                this.createDotParticle(15);
            } else if (data["type"] == "match") {
                // console.log(data);
                navigateTo(`/play/${data["id"]}`);
            }
        };

        this.query("#start-tournament").on("click", () => {
            ws.send(JSON.stringify({ type: "start" }));
        });

        return html(
            /* HTML */
            ` <div>
                <NavBar />
                <div class="container-fluid dashboard-container tournament-container">
                    <div class="particle-container"></div>
                    <div class="container-fluid dashboard-container match-container" id="match-container"></div>
                    <div class="container-fluid dashboard-container player-container">
                        <h2 id="tournament-title">
                            <i class="bi bi-clock"></i>
                            <span>Tournament Name</span>
                        </h2>
                        <div id="player-list"></div>
                        <button id="start-tournament"><i class="bi bi-rocket-takeoff"></i> <span>Start !</span></button>
                    </div>
                </div>
            </div>`
        );
    }
}
globalComponents.set("Tournament", Tournament);
