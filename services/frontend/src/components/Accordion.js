import { Component } from "../micro";
import * as bootstrap from "bootstrap";
export default class Accordion extends Component {
    async init() {
        this.config = JSON.parse(this.attributes.get("config"));
        this.barChart1 = this.config.barChart1;
        this.barChart2 = this.config.barChart2;
        this.heatMap = this.config.heatMap;

        this.id = this.generateRandomId();

        this.onready = async () => {
            const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
            const tooltipList = [...tooltipTriggerList].map(
                (tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl)
            );
        };
    }

    // Generate random id, It allow to accordion toggle off once at time.
    // if we give the same id for each accordion, well they close all at same time.
    // 36 Ensure it converts in base 36 (from a-z including 0-9).
    // Substring 2 because we want to skip "0.2" generate by math.random.
    generateRandomId() {
        return "accordion-" + Math.random().toString(36).substring(2, 9);
    }

    render() {
        // prettier-ignore
        let charts = /* HTML */ `<div class="container-fluid bar-chart-container">
            <BarChart config='${JSON.stringify(this.barChart1)}' />
            <BarChart config='${JSON.stringify(this.barChart2)}' />
        </div>
        <HeatMap config='${JSON.stringify(this.heatMap)}' />`;

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
                            <span class="${this.config.config.player1Class}">
                                <span class="history-player-name">${this.config.config.player1Name}</span>
                                <span class="score">${this.config.config.player1Score}</span>
                            </span>
                            <span class="vs match-history">vs</span>
                            <span class="${this.config.config.player2Class}">
                                <span class="history-player-name">${this.config.config.player2Name}</span>
                                <span class="score">${this.config.config.player2Score}</span>
                            </span>
                            <span class="history-time">${this.config.config.historyTime}</span>
                            <span class="history-gamemode">${this.config.config.gamemode}</span>
                            <span class="history-date">${this.config.config.date}</span>
                        </div>
                    </button>
                </h2>
                <div
                    id="panelsStayOpen-collapse-${this.id}"
                    class="accordion-collapse collapse match-history"
                    aria-labelledby="heading-${this.id}"
                >
                    <div class="accordion-body match-history">${charts}</div>
                </div>
            </div>
        `;
    }
}
