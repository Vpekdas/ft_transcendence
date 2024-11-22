import { Component, globalComponents, html } from "../micro";
import NavBar from "../components/NavBar";
import ProfileDashboard from "./ProfileDashboard";

// https://heyoka.medium.com/scratch-made-svg-donut-pie-charts-in-html5-2c587e935d72

export default class Statistics extends Component {
    constructor() {
        super();
    }

    async render() {
        return html(
            this.parent,
            /* HTML */
            ` <div>
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
globalComponents.set("Statistics", Statistics);
