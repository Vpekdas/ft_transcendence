import { Component } from "../../micro";

/** @type {import("../../micro").Component} */
export default class LineChart extends Component {
    async init() {
        this.config = JSON.parse(this.attributes.get("config"));

        this.width = this.config.lineChartConfig.width;
        this.height = this.config.lineChartConfig.height;

        this.viewWidth = this.config.lineChartConfig.viewWidth;
        this.viewHeight = this.config.lineChartConfig.viewHeight;

        this.padding = 20;
        this.paddingTop = 10;

        this.points = this.generatePoints(this.config.lineChartConfig.points);
        this.circles = this.generateCircles(this.config.lineChartConfig.points);

        this.duration = this.config.lineChartConfig.duration;

        this.onready = async () => {
            const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
            const tooltipList = [...tooltipTriggerList].map(
                (tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl)
            );
        };
    }

    generatePoints(data) {
        const xScale = (this.viewWidth - 2 * this.padding) / (data.length - 1);
        const yMax = Math.max(...data.map((point) => point.y));
        const yScale = this.viewHeight / yMax;

        return data
            .map((point, index) => {
                const x = this.padding + index * xScale;
                const y = this.viewHeight - point.y * yScale + this.paddingTop;

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
        const xScale = (this.viewWidth - 2 * this.padding) / (data.length - 1);
        const yMax = Math.max(...data.map((point) => point.y));
        const yScale = this.viewHeight / yMax;

        return data
            .map((point, index) => {
                const x = this.padding + index * xScale;
                const y = this.viewHeight - point.y * yScale;
                let duration = "";
                if (this.duration) {
                    duration = this.convertToMinutesAndSeconds(point.y);
                } else {
                    duration = point.y;
                }
                return `<circle cx="${x}" cy="${y + this.paddingTop}" data-bs-toggle="tooltip" title="${duration}" r="4" fill="${this.config.lineChartConfig.circleColor}"></circle>`;
            })
            .join(" ");
    }

    render() {
        const xAxis = /* HTML */ `
            <line
                x1="${this.padding}"
                y1="${this.viewHeight}"
                x2="${this.viewWidth - this.padding}"
                y2="${this.viewHeight}"
                stroke="black"
            />
            ${this.config.lineChartConfig.points
                .map((point, index) => {
                    const x =
                        this.padding +
                        (index * (this.viewWidth - 2 * this.padding)) / (this.config.lineChartConfig.points.length - 1);
                    return `<text x="${x}" y="${this.viewHeight + this.padding}" text-anchor="middle">${index}</text>`;
                })
                .join("")}
        `;

        const yAxis = /* HTML */ `
            <line x1="${this.padding}" y1="0" x2="${this.padding}" y2="${this.viewHeight}" stroke="black" />
            ${[0, ...this.config.lineChartConfig.points.map((point) => point.y)]
                .map((yValue, index) => {
                    const y =
                        this.viewHeight -
                        (yValue * this.viewHeight) /
                            Math.max(...this.config.lineChartConfig.points.map((point) => point.y));
                    return `<text x="${this.padding - this.paddingTop}" y="${y + this.paddingTop}" text-anchor="end">${yValue}</text>`;
                })
                .join("")}
        `;

        return /* HTML */ ` <svg
            width="${this.width}"
            height="${this.height}"
            viewBox="0 0 ${this.viewWidth} ${this.viewHeight + 40}"
            class="line-chart"
        >
            <text x="${this.viewWidth / 2}" y="20" text-anchor="middle" class="chart-title">
                ${this.config.lineChartConfig.title}
            </text>
            <g class="x-axis">${xAxis}</g>
            <g class="y-axis">${yAxis}</g>
            <polyline
                fill="none"
                stroke="${this.config.lineChartConfig.lineColor}"
                stroke-width="2"
                points="${this.points}"
            />
            ${this.circles}
        </svg>`;
    }
}
