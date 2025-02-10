import { Component } from "../../micro";

/** @type {import("../../micro").Component} */

// https://expensive.toys/blog/svg-filter-heat-map

export default class HeatMap extends Component {
    async init() {
        this.pixels = "";

        let points = [
            { x: 3.1, y: 0 },
            { x: 3.2, y: 0 },
            { x: 3.3, y: 0 },
            { x: 4.2, y: 0 },
            { x: 4.3, y: 0 },
            { x: 4.4, y: 0 },
            { x: 4.5, y: 0 },
            { x: 1.5, y: 0 },
        ];

        for (let y = 0; y < 24; y++) {
            for (let x = 0; x < 36; x++) {
                let x2 = x - 18;
                let y2 = y - 12;

                let intensity =
                    (points.filter((p) => p.x > x2 && p.x <= x2 + 1 && p.y > y2 && p.y <= y2 + 1).length /
                        points.length) *
                    2.0;

                this.pixels += /* HTML */ `<div
                    class="rainbow"
                    style="--intensity: ${intensity}"
                    data-intensity="${intensity}"
                ></div>`;
            }
        }
    }

    render() {
        return /* HTML */ ` <svg xmlns="http://www.w3.org/2000/svg" width="0" height="0">
                <filter id="thermal-vision" color-interpolation-filters="sRGB">
                    <feComponentTransfer>
                        <feFuncR type="table" tableValues="0  0.125  0.8    1      1" />
                        <feFuncG type="table" tableValues="0  0      0      0.843  1" />
                        <feFuncB type="table" tableValues="0  0.549  0.466  0      1" />
                    </feComponentTransfer>
                </filter>
            </svg>
            <div class="heatmap">${this.pixels}</div>`;
    }
}
