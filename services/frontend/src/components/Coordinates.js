import { Component, html } from "../micro";

export default class Coordinates extends Component {
    constructor() {
        super();
    }

    IsALineDrawable(positions) {
        // Ensure that If you click twice same polygon, It will not create a line.
        if (positions[0] === positions[2] && positions[1] === positions[3]) {
            return false;
        }

        const lines = document.querySelectorAll(".lines");

        var x1, y1, x2, y2;
        var x1p, y1p, x2p, y2p;

        for (let i = 0; i < lines.length; i++) {
            x1 = lines[i].getAttribute("x1");
            y1 = lines[i].getAttribute("y1");
            x2 = lines[i].getAttribute("x2");
            y2 = lines[i].getAttribute("y2");
            for (let j = i + 1; j < 4; j++) {
                x1p = lines[j].getAttribute("x1");
                y1p = lines[j].getAttribute("y1");
                x2p = lines[j].getAttribute("x2");
                y2p = lines[j].getAttribute("y2");

                if (x1 === x1p && y1 === y1p && x2 === x2p && y2 === y2p) {
                    return false;
                }
            }
        }

        return true;
    }

    async render() {
        this.query(".fluid-container.coordinates-container").do(async () => {
            const coordinates = document.querySelectorAll(".coordinates");
            const positions = [];

            coordinates.forEach((coordinate) => {
                coordinate.addEventListener("click", async () => {
                    positions.push(parseInt(coordinate.getAttribute("x")));
                    positions.push(parseInt(coordinate.getAttribute("y")));

                    // !  Find a solution to compare 2 same lines but not on same direction.
                    // Ex: 0-10, 20-30 === 20-30, 0-10
                    if (positions.length === 4 && this.IsALineDrawable(positions)) {
                        const navigate = document.getElementById("navigate");
                        var newLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
                        newLine.setAttribute("class", "line");

                        // ! 15 is a magic number, find the formula.
                        newLine.setAttribute("x1", positions[0] + 15);
                        newLine.setAttribute("y1", positions[1] + 15);
                        newLine.setAttribute("x2", positions[2] + 15);
                        newLine.setAttribute("y2", positions[3] + 15);

                        newLine.setAttribute("stroke", "black");
                        navigate.append(newLine);
                        positions.length = 0;
                    }
                });
            });
        });

        return html(
            /* HTML */ ` <div class="fluid-container coordinates-container">
                <svg id="navigate" height="100%" width="100%" viewBox="0 0 300 300">
                    <polygon
                        points="300,150 225,280 75,280 0,150 75,20 225,20"
                        fill="orange"
                        stroke="blue"
                        stroke-width="3"
                    />
                    <svg class="coordinates" x="263" y="135">
                        <polygon
                            class="poly"
                            points="300,150 225,280 75,280 0,150 75,20 225,20"
                            fill="orange"
                            stroke="blue"
                            stroke-width="20"
                            transform="scale(0.1)"
                        />
                    </svg>
                    <svg class="coordinates" x="200" y="245">
                        <polygon
                            class="poly"
                            points="300,150 225,280 75,280 0,150 75,20 225,20"
                            fill="orange"
                            stroke="blue"
                            stroke-width="20"
                            transform="scale(0.1)"
                        />
                    </svg>
                    <svg class="coordinates" x="70" y="245">
                        <polygon
                            class="poly"
                            points="300,150 225,280 75,280 0,150 75,20 225,20"
                            fill="orange"
                            stroke="blue"
                            stroke-width="20"
                            transform="scale(0.1)"
                        />
                    </svg>
                    <svg class="coordinates" x="8" y="135">
                        <polygon
                            class="poly"
                            points="300,150 225,280 75,280 0,150 75,20 225,20"
                            fill="orange"
                            stroke="blue"
                            stroke-width="20"
                            transform="scale(0.1)"
                        />
                    </svg>
                    <svg class="coordinates" x="70" y="25">
                        <polygon
                            class="poly"
                            points="300,150 225,280 75,280 0,150 75,20 225,20"
                            fill="orange"
                            stroke="blue"
                            stroke-width="20"
                            transform="scale(0.1)"
                        />
                    </svg>
                    <svg class="coordinates" x="200" y="25">
                        <polygon
                            class="poly"
                            points="300,150 225,280 75,280 0,150 75,20 225,20"
                            fill="orange"
                            stroke="blue"
                            stroke-width="20"
                            transform="scale(0.1)"
                        />
                    </svg>
                </svg>
            </div>`
        );
    }
}
