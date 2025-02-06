import { tr } from "../i18n";
import { Component } from "../micro";

export default class Statistics extends Component {
    async init() {
        document.title = tr("Statistics");
    }

    render() {
        return /* HTML */ ` <div class="container-fluid dashboard-container">
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
                <LineChart width="400" height="200" viewWidth="380" viewHeight="100" points="0,0 10,10 50,100" />
            </ul>
        </div>`;
    }
}

// TODO Win/Loss Ratio Chart: Donut Chart.
// TODO Game Duration Chart: Line Chart.
// TODO Points per Game Chart: Bar Chart.
// TODO Heatmap of Ball Hits: Heatmap
