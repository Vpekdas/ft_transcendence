import { Component } from "../../micro";

const r = 15.91549430918954;
/** @type {import("../../micro").Component} */
export default class DonutChart extends Component {
    generateSegment(color, dashArray, dashOffset, textPosition, content, title) {
        if (content === "0.00") {
            content = "";
        }

        return /* HTML */ `
            <circle
                class="donut-segment"
                cx="${this.config.donutChartConfig.viewWidth / 2}"
                cy="${this.config.donutChartConfig.viewHeight / 2}"
                r="${r}"
                fill="transparent"
                stroke="${color}"
                stroke-width="9"
                stroke-dasharray="${dashArray}"
                stroke-dashoffset="${dashOffset}"
                style="--neon-color: ${color}; --dasharray: ${dashArray}; --dashoffset: ${dashOffset};"
                data-bs-toggle="tooltip"
                title="${title}"
            ></circle>
            <text
                class="chart-content"
                x="${textPosition.x}"
                y="${textPosition.y}"
                text-anchor="middle"
                font-size="3"
                fill="white"
                >${content}</text
            >
        `;
    }

    calculateOffset(circles, length) {
        if (length === 0) {
            return 25;
        }
        let precedingSegments = 0;

        for (let i = 0; i < length; i++) {
            precedingSegments += Number(circles[i].fillPercent.split(" ")[0]);
        }

        return 100 - precedingSegments + 25;
    }

    calculateTextPosition(percentageFilled, dashOffset) {
        const angle = (dashOffset - percentageFilled / 2) * 3.6;
        const radians = (angle * Math.PI) / 180;
        const x = this.config.donutChartConfig.viewWidth / 2 + r * Math.cos(radians);
        const y = this.config.donutChartConfig.viewHeight / 2 - r * Math.sin(radians);

        return { x, y };
    }

    async init() {
        this.config = JSON.parse(this.attributes.get("config"));

        this.width = this.config.donutChartConfig.width;
        this.height = this.config.donutChartConfig.height;

        const colorNumber = this.config.donutChartConfig.colorNumber;

        const circles = [];

        for (let i = 0; i < colorNumber; i++) {
            const circle = {
                color: "",
                fillPercent: "",
                fillOffset: "",
                textPosition: { x: 0, y: 0 },
                content: "",
                segmentTitle: "",
            };
            circle.color = this.config.donutChartConfig["color" + (i + 1)];

            const fillingPercent = this.config.donutChartConfig["fillPercent" + (i + 1)];
            const notFilledPercent = 100 - fillingPercent;

            circle.fillPercent = fillingPercent + " " + notFilledPercent.toString();
            circle.fillOffset = this.calculateOffset(circles, i);
            circle.textPosition = this.calculateTextPosition(fillingPercent, circle.fillOffset);
            circle.content = fillingPercent.toString();

            const segmentTitle = this.config.donutChartConfig["segmentTitle" + (i + 1)];

            circle.segmentTitle = segmentTitle;

            circles.push(circle);
        }

        this.segment = "";
        for (let i = 0; i < circles.length; i++) {
            this.segment += this.generateSegment(
                circles[i].color,
                circles[i].fillPercent,
                circles[i].fillOffset,
                circles[i].textPosition,
                circles[i].content,
                circles[i].segmentTitle
            );
        }

        this.onready = async () => {
            this.onready = async () => {
                const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
                const tooltipList = [...tooltipTriggerList].map(
                    (tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl)
                );
            };
        };
    }

    render() {
        return /* HTML */ ` <svg
            width="${this.width}"
            height="${this.height}"
            viewBox="0 0 ${this.config.donutChartConfig.viewWidth} ${this.config.donutChartConfig.viewHeight}"
            class="donut"
        >
            <text
                x="${this.config.donutChartConfig.viewWidth / 2}"
                y="4"
                text-anchor="middle"
                class="chart-title donut"
            >
                ${this.config.donutChartConfig.title}
            </text>
            <circle
                class="donut-hole"
                cx="${this.config.donutChartConfig.viewWidth / 2}"
                cy="${this.config.donutChartConfig.viewHeight / 2}"
                r="${r}"
                fill="transparent"
            ></circle>
            ${this.segment}
        </svg>`;
    }
}
