import { Component } from "../../micro";

/** @type {import("../../micro").Component} */

export default class BarChart extends Component {
    constructor(config) {
        super();
        this.config = config;
    }
    async init() {}

    render() {
        return /* HTML */ ` <figure>
            <figcaption class="bar-chart-caption">${this.config.title}</figcaption>
            <svg
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                xmlns:xlink="http://www.w3.org/1999/xlink"
                class="bar-chart"
                width=${this.config.width}
                height=${this.config.height}
                aria-labelledby="title"
                role="img"
            >
                <title class="title-bar-chart">${this.config.title}</title>
                <g class="bar-chart">
                    <rect class=${this.config.player1Class} width=${this.config.firstElementWidth} height="19"></rect>
                    <text
                        class="bar-chart-text"
                        x=${this.config.firstElementWidth}
                        y="9.5"
                        dy=".35em"
                        text-anchor="start"
                    >
                        ${this.config.player1Name}
                    </text>
                </g>
                <g class="bar-chart">
                    <rect
                        class=${this.config.player2Class}
                        width=${this.config.secondElementWidth * 10}
                        height="19"
                        y="20"
                    ></rect>
                    <text
                        class="bar-chart-text"
                        x=${this.config.secondElementWidth * 10}
                        y="28"
                        dy=".35em"
                        text-anchor="start"
                    >
                        ${this.config.player2Name}
                    </text>
                </g>
            </svg>
        </figure>`;
    }
}
