import { Component } from "../micro";
import DonutChart from "./Charts/DonutChart";
import BarChart from "./Charts/BarChart";
import HeatMap from "./Charts/HeatMap";

export default class Accordion extends Component {
    constructor(config, chartConfig, barChartConfig) {
        super();
        this.config = config;
        this.chartConfig = chartConfig;
        this.barChartConfig = barChartConfig;
        this.id = this.generateRandomId();
    }
    async init() {
        this.onready = async () => {};
    }

    // Generate random id, It allow to accordion toggle off once at time.
    // if we give the same id for each accordion, well they close all at same time.
    // 36 Ensure it converts in base 36 (from a-z including 0-9).
    // Substring 2 because we want to skip "0.2" generate by math.random.
    generateRandomId() {
        return "accordion-" + Math.random().toString(36).substring(2, 9);
    }

    renderDonutChart() {
        const donutChartInstance = new DonutChart(this.chartConfig);
        donutChartInstance.init();
        return donutChartInstance.render();
    }

    renderBarChart() {
        const barChartInstance = new BarChart(this.barChartConfig);
        barChartInstance.init();
        return barChartInstance.render();
    }

    renderHeatMap() {
        const heatMapInstance = new HeatMap();
        heatMapInstance.init();
        return heatMapInstance.render();
    }

    render() {
        return /* HTML */ `
            <div class="accordion-item match-history">
                <h2 class="accordion-header match-history" id="heading-${this.id}">
                    <button
                        class="accordion-button collapsed match-history"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#panelsStayOpen-collapse-${this.id}"
                        aria-expanded="false"
                        aria-controls="panelsStayOpen-collapse-${this.id}"
                    >
                        <div class="container-fluid match-history-container">
                            <span class=${this.config.player1Class}>
                                <span class="history-player-name">${this.config.player1Name}</span>
                                <span class="score">${this.config.player1Score}</span>
                            </span>
                            <span class="vs match-history">vs</span>
                            <span class=${this.config.player2Class}>
                                <span class="history-player-name">${this.config.player2Name}</span>
                                <span class="score">${this.config.player2Score}</span>
                            </span>
                            <span class="history-time">${this.config.historyTime}</span>
                            <span class="history-gamemode">${this.config.gamemode}</span>
                            <span class="history-date">${this.config.date}</span>
                        </div>
                    </button>
                </h2>
                <div
                    id="panelsStayOpen-collapse-${this.id}"
                    class="accordion-collapse collapse match-history"
                    aria-labelledby="heading-${this.id}"
                >
                    <div class="accordion-body match-history">
                        ${this.renderDonutChart()} ${this.renderBarChart()} ${this.renderHeatMap()}
                    </div>
                </div>
            </div>
        `;
    }
}
