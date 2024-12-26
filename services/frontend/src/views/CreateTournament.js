import { Component, globalComponents, html } from "../micro";
import NavBar from "../components/NavBars/HomeNavBar";
import DonutChart from "../components/Charts/DonutChart";
import { fetchApi, isLoggedIn, post } from "../api";
import ChangePasswordForm from "../components/Forms/ChangePasswordForm";
import ChangeNicknameForm from "../components/Forms/ChangeNicknameForm";
import DeleteAccountForm from "../components/Forms/DeleteAccountForm";
import ChangeProfilePictureForm from "../components/Forms/ChangeProfilePictureForm";
import { navigateTo } from "../router";
import { tr } from "../i18n";
import TournamentNameCard from "../components/Cards/TournamentNameCard";
import PlayerCountCard from "../components/Cards/PlayerCountCard";
import TournamentPrivacyCard from "../components/Cards/TournamentPrivacyCard";

export default class CreateTournament extends Component {
    constructor() {
        super();
    }

    async render() {
        this.setTitle("CreateTournament");

        let playerCount = 2,
            openType = "open";

        this.query("#btnradio2").on("change", async () => {
            playerCount = 2;
        });

        this.query("#btnradio4").on("change", async () => {
            playerCount = 4;
        });
        this.query("#btnradio8").on("change", async () => {
            playerCount = 8;
        });

        this.query("#btn-open").on("change", async () => {
            openType = "open";
        });

        this.query("#btn-password").on("change", async () => {
            openType = "password";
        });

        this.query("#btn-invite-only").on("change", async () => {
            openType = "invite";
        });

        this.query(".btn.btn-primary.settings").on("click", async () => {
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

        return html(
            /* HTML */
            ` <div>
                <NavBar />
                <div class="container-fluid dashboard-container create-tournament-container">
                    <TournamentNameCard />
                    <PlayerCountCard />
                    <TournamentPrivacyCard />
                    <button type="submit" class="btn btn-primary settings">${tr("Create")}</button>
                </div>
            </div>`
        );
    }
}
globalComponents.set("CreateTournament", CreateTournament);

/*

{
    "name",
    "playerCount", // 2, 4, 8,
    "openType", // "open", "password",
    "password", // optional
    "game": "pong",
    "gameSettings": {},
}

*/
