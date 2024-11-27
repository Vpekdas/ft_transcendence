import { Component, globalComponents, html } from "../micro";

export default class LineChart extends Component {
    constructor() {
        super();
    }

    async render() {
        return html(
            /* HTML */ ` <svg width="100" height="100" viewBox="0 0 500 100" class="chart">
                <polyline
                    fill="none"
                    stroke="#0074d9"
                    stroke-width="2"
                    points="
                    00,120
                    20,60
                    40,80
                    60,20

                  "
                />
                <circle cx="00" cy="120" data-value="" r="4"></circle>
                <circle cx="20" cy="60" data-value="" r="4"></circle>
                <circle cx="40" cy="80" data-value="" r="4"></circle>
                <circle cx="60" cy="20" data-value="" r="4"></circle>

            </svg>`
        );
    }
}
globalComponents.set("LineChart", LineChart);
