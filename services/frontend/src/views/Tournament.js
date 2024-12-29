import { Component, html } from "../micro";
import { getOriginNoProtocol, getNickname } from "../api";
import { navigateTo } from "../router";
import { tr } from "../i18n";

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

            for (let i = 0; i < 3; i++) {
                let dot = document.createElement("div");
                dot.className = "dot";

                const bracket = document.querySelectorAll(".bracket");
                bracket[1].appendChild(dot);
            }
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

    createRoundTier() {
        const roundNames = [tr("Quarterfinals"), tr("Semifinals"), tr("Final")];
        const roundTiers = document.querySelectorAll(".round-tier");
        let offset = 0;

        if (roundTiers.length == 1) {
            offset = 2;
        } else if (roundTiers.length == 2) {
            offset = 1;
        }

        roundTiers.forEach((roundTier, index) => {
            roundTier.textContent = roundNames[index + offset];
        });
    }

    async render() {
        this.setTitle(tr("Tournament"));

        const id = this.attrib("id");

        this.query("#tournament-container").do(async () => {
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

                    if (container != null) {
                        container.replaceChildren([]);

                        for (let round of data["rounds"]) {
                            let games = round["games"];
                            container.appendChild(
                                html(
                                    /* HTML */ ` <div class="container-fluid round-container">
                                        <TournamentRound roundCount="${games.length}" data=${JSON.stringify(games)} />
                                        <div class="container-fluid bracket-container">
                                            <div class="bracket" row="1">
                                                <div class="dot"></div>
                                                <div class="dot"></div>
                                                <div class="dot"></div>
                                            </div>
                                            <span class="round-tier"></span>
                                        </div>
                                    </div>`
                                )
                            );
                        }
                        this.createBracket(data["rounds"]);
                        this.createRoundTier();
                        // this.createBinaryParticle(15);
                        // this.createDotParticle(15);

                        const winner =
                            "winner" in data && data["winner"] !== null
                                ? await getNickname(data["winner"])
                                : "<i>TDB</i>";

                        container.appendChild(
                            html(
                                /* HTML */ `<div class="container-fluid round-container">
                                    <div class="container-fluid tournament-match-container">
                                        <div class="tournament-round">
                                            <div class="player-info">
                                                <span class="player-name">${winner}</span>
                                            </div>
                                        </div>
                                        <div class="container-fluid bracket-container">
                                            <div>
                                                <span class="round-tier">${tr("Winner")}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>`
                            )
                        );
                    }
                } else if (data["type"] == "match") {
                    navigateTo(`/play/${data["id"]}`);
                }
            };

            this.query("#start-tournament").on("click", () => {
                ws.send(JSON.stringify({ type: "start" }));
            });
        });

        return html(
            /* HTML */
            ` <div>
                <NavBar />
                <div class="container-fluid dashboard-container tournament-container" id="tournament-container">
                    <div class="particle-container"></div>
                    <div class="container-fluid dashboard-container match-container" id="match-container"></div>
                    <div class="container-fluid dashboard-container player-container">
                        <h2 id="tournament-title">
                            <i class="bi bi-clock"></i>
                            <span>Tournament Name</span>
                        </h2>
                        <div id="player-list"></div>
                        <button id="start-tournament">
                            <i class="bi bi-rocket-takeoff"></i> <span>${tr("Start !")}</span>
                        </button>
                    </div>
                </div>
            </div>`
        );
    }
}
