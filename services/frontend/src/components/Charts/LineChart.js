import { Component, globalComponents, html } from "../../micro";

export default class LineChart extends Component {
    constructor() {
        super();
    }

    async render() {
        const width = parseInt(this.attrib("width"));
        const height = parseInt(this.attrib("height"));

        const viewWidth = parseInt(this.attrib("viewWidth"));
        const viewHeight = parseInt(this.attrib("viewHeight"));

        const points = this.attrib("points");

        return html(
            /* HTML */ ` <svg
                width="${width}"
                height="${height}"
                viewBox="0 0 ${viewWidth} ${viewHeight}"
                class="line-chart"
            >
                <polyline fill="none" stroke="#d2320a" stroke-width="2" points="${points}" />
            </svg>`
        );
    }
}
globalComponents.set("LineChart", LineChart);

// TODO: Add a function to dynamically add circles to the line chart.
// TODO: Add a title to the line chart.

{
    /* <circle cx="00" cy="120" data-value="" r="4"></circle>
<circle cx="20" cy="60" data-value="" r="4"></circle>
<circle cx="40" cy="80" data-value="" r="4"></circle>
<circle cx="60" cy="20" data-value="" r="4"></circle> */
}
