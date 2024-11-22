import { Component, globalComponents, html } from "../micro";

// https://heyoka.medium.com/scratch-made-svg-donut-pie-charts-in-html5-2c587e935d72

export default class Chart extends Component {
    constructor() {
        super();
    }

    // r = 100/(2π)

    // stroke-dashoffset="25" -> stroke-dashoffset moves counter-clockwise.
    // So, we’d need to set this value for 25% in the opposite direction from 3:00 back to 12:00)

    // strokeDasharray = Circumference − All preceding segments’ total length + First segment’s offset

    async render() {
        const r = 15.91549430918954;

        const width = parseInt(this.attrib("width"));

        const color1 = this.attrib("color1");
        const color2 = this.attrib("color2");

        const strokeDasharray = 0;
        const strokeOffset = 0;

        return html(
            this.parent,
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
                <circle
                    class="donut-segment"
                    cx="21"
                    cy="21"
                    r="${r}"
                    fill="transparent"
                    stroke="${color1}"
                    stroke-width="3"
                    stroke-dasharray="85 15"
                    stroke-dashoffset="25"
                ></circle>
                <circle
                    class="donut-segment"
                    cx="21"
                    cy="21"
                    r="${r}"
                    fill="transparent"
                    stroke="${color2}"
                    stroke-width="3"
                    stroke-dasharray="15 85"
                    stroke-dashoffset="40"
                ></circle>
            </svg>`
        );
    }
}
globalComponents.set("Chart", Chart);
