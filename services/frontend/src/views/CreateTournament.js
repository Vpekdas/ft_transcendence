import { post } from "../utils";
import { tr } from "../i18n";
import { navigateTo, Component } from "../micro";

export default class CreateTournament extends Component {
    async init() {
        document.title = tr("Create Tournament");

        let playerCount = 2;

        this.onready = () => {
            document.querySelector("#btnradio2").addEventListener("change", async () => {
                playerCount = 2;
            });
            document.querySelector("#btnradio4").addEventListener("change", async () => {
                playerCount = 4;
            });
            document.querySelector("#btnradio8").addEventListener("change", async () => {
                playerCount = 8;
            });

            document.querySelector(".btn.btn-primary.settings").addEventListener("click", async () => {
                const tournamentName = document.getElementById("tournament-name").value;
                const tournamentPoints = document.getElementById("tournament-points").value;

                const resp = await post("/api/tournament/create", {
                    body: JSON.stringify({
                        name: tournamentName,
                        playerCount: playerCount,
                        openType: "open",
                        password: undefined,
                        game: "pong",
                        fillWithAI: false,
                        gameSettings: {
                            maxScore: parseInt(tournamentPoints),
                        },
                    }),
                }).then((r) => r.json());

                const tournamentId = resp["id"];

                navigateTo(`/tournament/${tournamentId}`);
            });
        };
    }

    render() {
        return /* HTML */ ` <div>
            <HomeNavBar />
            <div class="container-fluid dashboard-container create-tournament-container">
                <TournamentNameCard />
                <PlayerCountCard />
                <PointsCard />
                <button type="submit" class="btn btn-primary settings">${tr("Create")}</button>
            </div>
        </div>`;
    }
}
