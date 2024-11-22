import { Component, globalComponents, html } from "../micro";
import NavBar from "../components/NavBar";
import { navigateTo } from "../main";
import { isLoggedIn } from "../api";

export default class ProfileDashboard extends Component {
    constructor() {
        super();
    }

    async render() {
        this.setTitle("Profile Dashboard");

        if (!isLoggedIn()) {
            navigateTo("login");
            return;
        }

        return html(
            this.parent,
            /* HTML */
            `<div>
                <NavBar />
                <div class="container-fluid dashboard-container">
                    <ul class="nav flex-column nav-underline dashboard-tab">
                        <li class="nav-item">
                            <a class="nav-link" data-link href="/profile/match-history">Match History</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" data-link href="/profile/statistics">Statistics</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" data-link href="/profile/skins">Skins</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" data-link href="/profile/settings">Settings</a>
                        </li>
                    </ul>
                </div>
            </div>`
        );
    }
}
globalComponents.set("ProfileDashboard", ProfileDashboard);
