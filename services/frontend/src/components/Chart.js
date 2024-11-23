import { Component, globalComponents, html } from "../micro";

// https://heyoka.medium.com/scratch-made-svg-donut-pie-charts-in-html5-2c587e935d72

const r = "15.91549430918954";
export default class Chart extends Component {
    constructor() {
        super();
    }

    // r = 100/(2π)

    // stroke-dashoffset="25" -> stroke-dashoffset moves counter-clockwise.
    // So, we’d need to set this value for 25% in the opposite direction from 3:00 back to 12:00)

    generateSegment(color, dashArray, dashOffset) {
        return /* HTML */ ` <circle
            class="donut-segment"
            cx="21"
            cy="21"
            r="${r}"
            fill="transparent"
            stroke="${color}"
            stroke-width="3"
            stroke-dasharray="${dashArray}"
            stroke-dashoffset="${dashOffset}"
        ></circle>`;
    }

    calculateOffset(circles, length) {
        if (length === 0) {
            return "25";
        }
        let precedingSegments = 0;
        let offset = 0;

        for (let i = 0; i < length; i++) {
            precedingSegments += Number(circles[i].fillPercent.split(" ")[0]);
        }
        offset = 100 - precedingSegments + 25;
        return offset.toString();
    }

    async render() {
        const width = parseInt(this.attrib("width"));

        const colorNumber = parseInt(this.attrib("colorNumber"));

        const circles = [];

        for (let i = 0; i < colorNumber; i++) {
            const circle = { color: "", fillPercent: "", fillOffset: "" };
            circle.color = this.attrib("color" + (i + 1));

            const fillingPercent = parseInt(this.attrib("fillPercent" + (i + 1)));
            const notFilledPercent = 100 - fillingPercent;

            circle.fillPercent = this.attrib("fillPercent" + (i + 1)) + " " + notFilledPercent.toString();
            circle.fillOffset = this.calculateOffset(circles, i);

            circles.push(circle);
        }

        let segment = "";
        for (let i = 0; i < circles.length; i++) {
            segment += this.generateSegment(circles[i].color, circles[i].fillPercent, circles[i].fillOffset);
        }

        return html(
            /* HTML */ ` <svg width="${width}" height="${width}" viewBox="0 0 42 42" class="donut">
                <circle class="donut-hole" cx="21" cy="21" r="${r}" fill="#fff"></circle>
                <circle
                    class="donut-ring"
                    cx="21"
                    cy="21"
                    r="${r}"
                    fill="transparent"
                    stroke="#d2d3d4"
                    stroke-width="3"
                ></circle>
                ${segment}
            </svg>`
        );
    }
}
globalComponents.set("Chart", Chart);
