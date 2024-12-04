import { Component, globalComponents, html } from "../micro";
import NavBar from "../components/NavBar";
import { navigateTo } from "../router";
import { isLoggedIn } from "../api";

export default class ProfileDashboard extends Component {
    constructor() {
        super();
    }

    async render() {
        this.setTitle("Profile Dashboard");

        isLoggedIn().then((value) => {
            if (!value) navigateTo("login");
        });

        return html(
            /* HTML */
            `<div>
                <NavBar />
                <div class="container-fluid dashboard-container">
                    <ul class="nav flex-column dashboard-tab">
                        <li class="nav-item">
                            <a class="nav-link custom-link" data-link href="/profile/match-history">Match History</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link custom-link" data-link href="/profile/statistics">Statistics</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link custom-link" data-link href="/profile/skins">Skins</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link custom-link " data-link href="/profile/settings">Settings</a>
                        </li>
                    </ul>
                </div>
            </div>`
        );
    }
}
globalComponents.set("ProfileDashboard", ProfileDashboard);

// TODO Add a dynamic function to update the "active" class on nav links based on the current URL.
// TODO This ensures that the user can visually see which page they are currently on.
