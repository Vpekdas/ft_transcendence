import { Component } from "../../micro";

const r = 15.91549430918954;
/** @type {import("../../micro").Component} */
export default class DonutChart extends Component {
    constructor(config) {
        super();
        this.config = config;
    }

    generateSegment(color, dashArray, dashOffset, textPosition, content) {
        return /* HTML */ `
            <circle
                class="donut-segment"
                cx="21"
                cy="21"
                r="${r}"
                fill="transparent"
                stroke="${color}"
                stroke-width="6"
                stroke-dasharray="${dashArray}"
                stroke-dashoffset="${dashOffset}"
                style="--neon-color: ${color};"
            ></circle>
            <text
                class="chart-content"
                x="${textPosition.x}"
                y="${textPosition.y}"
                text-anchor="middle"
                alignment-baseline="middle"
                font-size="3"
                fill="#000"
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
        const x = 21 + r * Math.cos(radians);
        const y = 21 - r * Math.sin(radians);

        return { x, y };
    }

    async init() {
        this.width = this.config.width;

        const colorNumber = this.config.colorNumber;

        const circles = [];

        for (let i = 0; i < colorNumber; i++) {
            const circle = {
                color: "",
                fillPercent: "",
                fillOffset: "",
                textPosition: { x: 0, y: 0 },
                content: "",
            };
            circle.color = this.config["color" + (i + 1)];

            const fillingPercent = this.config["fillPercent" + (i + 1)];
            const notFilledPercent = 100 - fillingPercent;

            circle.fillPercent = fillingPercent + " " + notFilledPercent.toString();
            circle.fillOffset = this.calculateOffset(circles, i);
            circle.textPosition = this.calculateTextPosition(fillingPercent, circle.fillOffset);
            circle.content = fillingPercent.toString();

            circles.push(circle);
        }

        this.segment = "";
        for (let i = 0; i < circles.length; i++) {
            this.segment += this.generateSegment(
                circles[i].color,
                circles[i].fillPercent,
                circles[i].fillOffset,
                circles[i].textPosition,
                circles[i].content
            );
        }
    }

    render() {
        return /* HTML */ ` <svg width="${this.width}" height="${this.width * 1.2}" viewBox="0 0 42 42" class="donut">
            <text x="21" y="0" text-anchor="middle" alignment-baseline="middle" font-size="4" fill="#d2320a">
                ${this.config.title}
            </text>
            <circle class="donut-hole" cx="21" cy="21" r="${r}" fill="transparent"></circle>
            ${this.segment}
        </svg>`;
    }
}
