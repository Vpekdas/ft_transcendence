import { Component, globalComponents, html } from "../micro";
import NavBar from "../components/NavBar";
import ProfileDashboard from "./ProfileDashboard";
import DonutChart from "../components/DonutChart";
import LineChart from "../components/LineChart";

export default class Statistics extends Component {
    constructor() {
        super();
    }

    async render() {
        this.setTitle("Statistics");

        return html(
            /* HTML */
            ` <div>
                <NavBar />
                <div class="container-fluid dashboard-container">
                    <ul class="nav flex-column nav-underline dashboard-tab">
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
                            <a class="nav-link custom-link" data-link href="/profile/settings">Settings</a>
                        </li>
                    </ul>
                    <ul class="list-group statistics">
                        <DonutChart
                            width="200"
                            colorNumber="3"
                            color1="#4287f5"
                            color2="#42f58d"
                            color3="#7211D8"
                            fillPercent1="30"
                            fillPercent2="25"
                            fillPercent3="45"
                        />
                        <LineChart />
                    </ul>
                </div>
            </div>`
        );
    }
}
globalComponents.set("Statistics", Statistics);

// TODO Win/Loss Ratio Chart: Donut Chart.
// TODO Most Used Skins: Donut Chart.
// TODO Game Duration Chart: Line Chart.
// TODO Points per Game Chart: Bar Chart.
// TODO Heatmap of Ball Hits: Heatmap
