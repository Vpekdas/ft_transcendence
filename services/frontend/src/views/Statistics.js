import { Component, globalComponents, html } from "../micro";
import NavBar from "../components/NavBar";
import ProfileDashboard from "./ProfileDashboard";
import Chart from "../components/Chart";

export default class Statistics extends Component {
    constructor() {
        super();
    }

    async render() {
        this.setTitle("Statistics");
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
                    <ul class="list-group statistics">
                        <Chart width="200" color1="#4287f5" color2="#42f58d" />
                        <Chart width="200" color1="#4287f5" color2="#42f58d" />
                        <Chart width="200" color1="#4287f5" color2="#42f58d" />
                        <Chart width="200" color1="#4287f5" color2="#42f58d" />
                    </ul>
                </div>
            </div>`
        );
    }
}
globalComponents.set("Statistics", Statistics);
