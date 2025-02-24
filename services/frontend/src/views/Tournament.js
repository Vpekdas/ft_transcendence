import { getOriginNoProtocol, getNickname, post, api } from "../utils";
import { tr } from "../i18n";
import { Component, params, navigateTo } from "../micro";

export default class Tournament extends Component {
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

    async clean() {
        if (this.ws) this.ws.close();
    }

    async init() {
        document.title = tr("Tournament");

        this.id = params.get("id");
        this.playerInfo = await post("/api/player/c/profile").then((res) => res.json());
        this.host = undefined;
        this.roundsHtml = "";

        const [_, setRounds] = this.usePersistent("rounds", []);
        const [players, setPlayers] = this.usePersistent("tplayers", []);

        this.onready = () => {
            this.ws = new WebSocket(`wss://${getOriginNoProtocol()}/ws/tournament/${this.id}`);

            this.ws.onopen = (event) => {
                this.ws.send(JSON.stringify({ type: "join" }));
            };
            this.ws.onmessage = async (event) => {
                const data = JSON.parse(event.data);

                if (data["type"] == "players") {
                    let playersList = [];
                    for (let p of data["players"]) {
                        playersList.push({ id: p, nickname: await getNickname(p) });
                    }
                    setPlayers(playersList);
                    this.host = data["host"];

                    if (this.host != this.playerInfo.id) {
                        const startBtn = document.querySelector("#start-tournament");
                        startBtn.disabled = true;
                        startBtn.style.opacity = "0.3";
                        startBtn.style.pointerEvents = "none";
                    }
                } else if (data["type"] == "rounds") {
                    setRounds(data["rounds"]);
                    this.createBracket(data["rounds"]);
                    this.createRoundTier();
                    // createBinaryParticle(15);
                    // createDotParticle(15);
                } else if (data["type"] == "match") {
                    navigateTo(`/play/pong/${data["id"]}`);
                }
            };

            document.querySelector("#start-tournament").addEventListener("click", () => {
                this.ws.send(JSON.stringify({ type: "start" }));
            });
        };
    }

    render() {
        const [rounds, _] = this.usePersistent("rounds", []);
        const [players, setPlayers] = this.usePersistent("tplayers", []);

        let roundsHtml = "";

        for (let round of rounds()) {
            let games = round["games"];
            // prettier-ignore
            roundsHtml += /* HTML */ ` <div class="container-fluid round-container">
                <TournamentRound roundCount="${games.length}" data='${JSON.stringify(games)}' />
                <div class="container-fluid bracket-container">
                    <div class="bracket" row="1">
                        <div class="dot"></div>
                        <div class="dot"></div>
                        <div class="dot"></div>
                    </div>
                    <span class="round-tier"></span>
                </div>
            </div>`;
        }

        let playersHTML = "";

        for (let player of players()) {
            playersHTML += /* HTML */ `<span
                ><img
                    src="${api("/api/player/" + player.id + "/picture")}"
                    alt=""
                    width="40vw"
                />${player.nickname}</span
            >`;
        }

        return /* HTML */ ` <HomeNavBar />
            <div class="container-fluid dashboard-container tournament-container" id="tournament-container">
                <div class="particle-container"></div>
                <div class="container-fluid dashboard-container match-container" id="match-container">
                    ${roundsHtml}
                </div>
                <div class="container-fluid dashboard-container player-container">
                    <h2 id="tournament-title">
                        <i class="bi bi-clock"></i>
                        <span>${tr("Tournament")}</span>
                    </h2>
                    <div id="player-list">${playersHTML}</div>
                    <button id="start-tournament">
                        <i class="bi bi-rocket-takeoff"></i> <span>${tr("Start !")}</span>
                    </button>
                </div>
            </div>`;
    }
}
