import { Component, globalComponents, html } from "../micro";
import NavBar from "../components/NavBar";
import DonutChart from "../components/DonutChart";
import { fetchApi, isLoggedIn } from "../api";
import ChangePasswordForm from "../components/ChangePassword";
import ChangeNicknameForm from "../components/ChangeNickname";
import DeleteAccount from "../components/DeleteAccount";
import ChangeProfilePicture from "../components/ChangeProfilePicture";
import { navigateTo } from "../router";
import { tr } from "../i18n";
import TournamentNameCard from "../components/TournamentNameCard";
import PlayerCountCard from "../components/PlayerCountCard";
import TournamentPrivacyCard from "../components/TournamentPrivacyCard";

export default class CreateTournament extends Component {
    constructor() {
        super();
    }

    async render() {
        this.setTitle("CreateTournament");

        const id = this.attrib("id");

        return html(
            /* HTML */
            ` <div>
                <NavBar />
                <div class="container-fluid dashboard-container tournament-container">
                    <TournamentNameCard />
                    <PlayerCountCard />
                    <TournamentPrivacyCard />
                    <button type="submit" class="btn btn-primary settings">Create</button>
                </div>
            </div>`
        );
    }
}
globalComponents.set("CreateTournament", CreateTournament);

/*

{
    "name",
    "playerCount", // 2, 4, 8, 16
    "openType", // "open", "password",
    "password", // optional
    "game": "pong"
}

*/
