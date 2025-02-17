import { Component } from "../../micro";

/** @type {import("../../micro").Component} */
export default class LineChart extends Component {
    async init() {
        this.config = JSON.parse(this.attributes.get("config"));

        this.width = this.config.lineChartConfig.width;
        this.height = this.config.lineChartConfig.height;

        this.viewWidth = this.config.lineChartConfig.viewWidth;
        this.viewHeight = this.config.lineChartConfig.viewHeight;

        this.points = this.generatePoints(this.config.lineChartConfig.points);
        this.circles = this.generateCircles(this.config.lineChartConfig.points);

        this.onready = async () => {
            const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
            const tooltipList = [...tooltipTriggerList].map(
                (tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl)
            );
        };
    }

    generatePoints(data) {
        const xScale = this.viewWidth / (data.length - 1);
        const yMax = Math.max(...data.map((point) => point.y));
        const yScale = this.viewHeight / yMax;

        return data
            .map((point, index) => {
                const x = index * xScale;
                const y = this.viewHeight - point.y * yScale;
                return `${x},${y}`;
            })
            .join(" ");
    }

    convertToMinutesAndSeconds(totalSeconds) {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
    }

    generateCircles(data) {
        const xScale = this.viewWidth / (data.length - 1);
        const yMax = Math.max(...data.map((point) => point.y));
        const yScale = this.viewHeight / yMax;

        return data
            .map((point, index) => {
                const x = index * xScale;
                const y = this.viewHeight - point.y * yScale;
                const duration = this.convertToMinutesAndSeconds(point.y);
                return `<circle cx="${x}" cy="${y}" data-bs-toggle="tooltip" title="${duration}" r="4"></circle>`;
            })
            .join(" ");
    }

    render() {
        return /* HTML */ ` <svg
            width="${this.width}"
            height="${this.height}"
            viewBox="0 0 ${this.viewWidth} ${this.viewHeight}"
            class="line-chart"
        >
            <polyline fill="none" stroke="#d2320a" stroke-width="2" points="${this.points}" />
            ${this.circles}
        </svg>`;
    }
}

// TODO: Add a function to dynamically add circles to the line chart.
// TODO: Add a title to the line chart.

/* <circle cx="00" cy="120" data-value="" r="4"></circle>
<circle cx="20" cy="60" data-value="" r="4"></circle>
<circle cx="40" cy="80" data-value="" r="4"></circle>
<circle cx="60" cy="20" data-value="" r="4"></circle> */
