import { Component } from "../../micro";

/** @type {import("../../micro").Component} */
export default class LineChart extends Component {
    async init() {
        this.width = parseInt(this.attributes.get("width"));
        this.height = parseInt(this.attributes.get("height"));

        this.viewWidth = parseInt(this.attributes.get("viewWidth"));
        this.viewHeight = parseInt(this.attributes.get("viewHeight"));

        this.points = this.attributes.get("points");
    }

    render() {
        return /* HTML */ ` <svg
            width="${this.width}"
            height="${this.height}"
            viewBox="0 0 ${this.viewWidth} ${this.viewHeight}"
            class="line-chart"
        >
            <polyline fill="none" stroke="#d2320a" stroke-width="2" points="${this.points}" />
        </svg>`;
    }
}

// TODO: Add a function to dynamically add circles to the line chart.
// TODO: Add a title to the line chart.

/* <circle cx="00" cy="120" data-value="" r="4"></circle>
<circle cx="20" cy="60" data-value="" r="4"></circle>
<circle cx="40" cy="80" data-value="" r="4"></circle>
<circle cx="60" cy="20" data-value="" r="4"></circle> */
