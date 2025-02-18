import { Component } from "../../micro";

/** @type {import("../../micro").Component} */

// https://expensive.toys/blog/svg-filter-heat-map

export default class HeatMap extends Component {
    async init() {
        this.pixels = "";

        let points = JSON.parse(this.attributes.get("config"));

        // Find the cell with the maximum number of points, which will be used as the max range for normalization.
        let maxPointsInCell = 0;
        for (let y = 0; y < 24; y++) {
            for (let x = 0; x < 36; x++) {
                let x2 = x - 18;
                let y2 = y - 12;
                let pointCount = points.filter((p) => p.x > x2 && p.x <= x2 + 1 && p.y > y2 && p.y <= y2 + 1).length;
                if (pointCount > maxPointsInCell) {
                    maxPointsInCell = pointCount;
                }
            }
        }

        for (let y = 0; y < 24; y++) {
            for (let x = 0; x < 36; x++) {
                let x2 = x - 18;
                let y2 = y - 12;
                let pointCount = points.filter((p) => p.x > x2 && p.x <= x2 + 1 && p.y > y2 && p.y <= y2 + 1).length;

                // Normalize and ensure value is not greater than 1.
                let intensity = pointCount / maxPointsInCell;
                intensity = Math.min(intensity, 1);

                this.pixels += /* HTML */ `<div
                    class="rainbow"
                    style="--intensity: ${intensity}; --x: ${x}; --y: ${y};"
                    data-bs-toggle="tooltip"
                    data-bs-placement="top"
                    title="${intensity}"
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
            <div class="container-fluid heatmap-container">
                <h5 class="heatmap-title">Heatmap</h5>
                <div class="heatmap">${this.pixels}</div>
            </div>`;
    }
}
