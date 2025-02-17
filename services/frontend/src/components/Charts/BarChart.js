import { Component } from "../../micro";

/** @type {import("../../micro").Component} */

export default class BarChart extends Component {
    async init() {
        this.config = JSON.parse(this.attributes.get("config"));

        const firstValue = this.config.firstElementWidth;
        const secondValue = this.config.secondElementWidth;
        const maxValue = Math.max(firstValue, secondValue);
        const maxWidth = this.config.width / 2;

        this.scaledFirstValue = 0;
        this.scaledSecondValue = 0;

        if (maxValue !== 0) {
            const normalizedFirstValue = firstValue / maxValue;
            const normalizedSecondValue = secondValue / maxValue;

            this.scaledFirstValue = normalizedFirstValue * maxWidth;
            this.scaledSecondValue = normalizedSecondValue * maxWidth;
        }
    }

    render() {
        return /* HTML */ ` <figure>
            <figcaption class="bar-chart-caption">${this.config.title}</figcaption>
            <svg
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                xmlns:xlink="http://www.w3.org/1999/xlink"
                class="bar-chart"
                width="${this.config.width}"
                height="${this.config.height}"
                aria-labelledby="title"
                role="img"
            >
                <title class="title-bar-chart">${this.config.title}</title>
                <g class="bar-chart">
                    <rect
                        class="${this.config.player1Class}"
                        width="${this.scaledFirstValue}"
                        height="19"
                        data-bs-toggle="tooltip"
                        data-bs-placement="top"
                        title="${this.config.firstElementWidth}"
                    ></rect>
                    <text class="bar-chart-text" x="${this.scaledFirstValue}" y="9.5" dy=".35em" text-anchor="start">
                        ${this.config.player1Name}
                    </text>
                </g>
                <g class="bar-chart">
                    <rect
                        class="${this.config.player2Class}"
                        width="${this.scaledSecondValue}"
                        height="19"
                        y="20"
                        data-bs-toggle="tooltip"
                        data-bs-placement="top"
                        title="${this.config.secondElementWidth}"
                    ></rect>
                    <text class="bar-chart-text" x="${this.scaledSecondValue}" y="28" dy=".35em" text-anchor="start">
                        ${this.config.player2Name}
                    </text>
                </g>
            </svg>
        </figure>`;
    }
}
