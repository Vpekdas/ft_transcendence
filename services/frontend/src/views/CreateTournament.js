import { post } from "../utils";
import { tr } from "../i18n";
import { navigateTo } from "../micro";

/** @type {import("../micro").Component} */
export default async function CreateTournamen({ dom }) {
    document.title = tr("Create Tournament");

    let playerCount = 2,
        openType = "open";

    dom.querySelector("#btnradio2").on("change", async () => {
        playerCount = 2;
    });
    dom.querySelector("#btnradio4").on("change", async () => {
        playerCount = 4;
    });
    dom.querySelector("#btnradio8").on("change", async () => {
        playerCount = 8;
    });

    dom.querySelector("#btn-open").on("change", async () => {
        openType = "open";
    });
    dom.querySelector("#btn-password").on("change", async () => {
        openType = "password";
    });
    dom.querySelector("#btn-invite-only").on("change", async () => {
        openType = "invite";
    });

    dom.querySelector(".btn.btn-primary.settings").on("click", async () => {
        const tournamentName = document.getElementById("tournament-name").value;
        const tournamentPassword = document.getElementById("tournament-password").value;

        const resp = await post("/api/tournament/create", {
            body: JSON.stringify({
                name: tournamentName,
                playerCount: playerCount,
                openType: openType,
                password: tournamentPassword.length == 0 ? undefined : tournamentPassword,
                game: "pong",
                fillWithAI: false,
                gameSettings: {},
            }),
        }).then((r) => r.json());

        const tournamentId = resp["id"];

        navigateTo(`/tournament/${tournamentId}`);
    });

    return /* HTML */ ` <div>
        <NavBar />
        <div class="container-fluid dashboard-container create-tournament-container">
            <TournamentNameCard />
            <PlayerCountCard />
            <TournamentPrivacyCard />
            <button type="submit" class="btn btn-primary settings">${tr("Create")}</button>
        </div>
    </div>`;
}
