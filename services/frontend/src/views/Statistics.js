import { Component, html } from "../micro";
import NavBar from "../components/NavBars/HomeNavBar";
import DonutChart from "../components/Charts/DonutChart";
import LineChart from "../components/Charts/LineChart";
import ProfileNavBar from "../components/NavBars/ProfileNavBar";
import { isLoggedIn } from "../utils";
import { navigateTo } from "../router";
export default class Statistics extends Component {
    constructor() {
        super();
    }

    async render() {
        if (!(await isLoggedIn())) {
            navigateTo("/login");
        }
        this.setTitle("Statistics");

        return html(
            /* HTML */
            ` <div>
                <NavBar />
                <div class="container-fluid dashboard-container">
                    <ProfileNavBar />
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
                        <LineChart
                            width="400"
                            height="200"
                            viewWidth="380"
                            viewHeight="100"
                            points="0,0 10,10 50,100"
                        />
                    </ul>
                </div>
            </div>`
        );
    }
}

// TODO Win/Loss Ratio Chart: Donut Chart.
// TODO Most Used Skins: Donut Chart.
// TODO Game Duration Chart: Line Chart.
// TODO Points per Game Chart: Bar Chart.
// TODO Heatmap of Ball Hits: Heatmap
