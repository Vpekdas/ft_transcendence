import { Component, html } from "../micro";
import { SCALE, POLYGON_VERTICES } from "../constant";

export default class Coordinates extends Component {
    constructor() {
        super();
    }

    calculateDistance(x1, y1, x2, y2) {
        return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    }

    async render() {
        this.query(".fluid-container.coordinates-container").do(async () => {
            const coordinates = document.querySelectorAll(".coordinates");

            var click = 0,
                skip = 0,
                topSkip = 0,
                x,
                y,
                xp,
                yp,
                distance;

            const firstPolyVertices = [];
            const secondPolyVertices = [];
            const closestVertices = [];

            const vertices = POLYGON_VERTICES.split(" ");

            coordinates.forEach((coordinate) => {
                coordinate.addEventListener("click", async () => {
                    coordinate.querySelector("polygon").classList.add("glow");

                    if (coordinate.getAttribute("skip")) {
                        skip++;
                    }

                    if (coordinate.getAttribute("topSkip")) {
                        topSkip++;
                    }

                    if (click === 0) {
                        for (let i = 0; i < vertices.length; i++) {
                            const splitPos = vertices[i].split(",");
                            x = parseInt(splitPos[0] / SCALE) + parseInt(coordinate.getAttribute("x"));
                            y = parseInt(splitPos[1] / SCALE) + parseInt(coordinate.getAttribute("y"));
                            firstPolyVertices.push({ x: x, y: y });
                        }
                        click++;
                        return;
                    } else {
                        for (let i = 0; i < vertices.length; i++) {
                            const splitPos = vertices[i].split(",");
                            x = parseInt(splitPos[0] / SCALE) + parseInt(coordinate.getAttribute("x"));
                            y = parseInt(splitPos[1] / SCALE) + parseInt(coordinate.getAttribute("y"));
                            secondPolyVertices.push({ x: x, y: y });
                        }

                        for (let i = 0; i < firstPolyVertices.length; i++) {
                            for (let j = 0; j < secondPolyVertices.length; j++) {
                                x = firstPolyVertices[i].x;
                                y = firstPolyVertices[i].y;
                                xp = secondPolyVertices[j].x;
                                yp = secondPolyVertices[j].y;
                                distance = this.calculateDistance(x, y, xp, yp);
                                closestVertices.push({ x: x, y: y, xp: xp, yp: yp, distance: distance });
                            }
                        }

                        closestVertices.sort((a, b) => a.distance - b.distance);

                        console.table(closestVertices);

                        let points = "";

                        points += closestVertices[0].x + "," + closestVertices[0].y + " ";

                        for (let i = 1; i < closestVertices.length; i++) {
                            if (
                                (closestVertices[0].x === closestVertices[i].x &&
                                    closestVertices[0].y === closestVertices[i].y) ||
                                (closestVertices[0].xp === closestVertices[i].xp &&
                                    closestVertices[0].yp === closestVertices[i].yp)
                            ) {
                                continue;
                            }

                            if (
                                topSkip === 2 ||
                                (skip === 2 && closestVertices[0].distance !== closestVertices[1].distance)
                            ) {
                                i++;
                            }
                            points += closestVertices[i].x + "," + closestVertices[i].y + " ";
                            points += closestVertices[i].xp + "," + closestVertices[i].yp + " ";
                            break;
                        }

                        points += closestVertices[0].xp + "," + closestVertices[0].yp;

                        const navigate = document.getElementById("navigate");
                        var newPoly = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
                        newPoly.setAttribute("class", "poly");
                        newPoly.setAttribute("points", points);
                        newPoly.setAttribute("fill", "cyan");
                        newPoly.setAttribute("stroke-width", "3");

                        navigate.append(newPoly);

                        click = 0;
                        skip = 0;
                        topSkip = 0;
                        firstPolyVertices.length = 0;
                        secondPolyVertices.length = 0;
                        closestVertices.length = 0;
                    }
                });
            });
        });
    }
}
//     <polygon
//     class="poly"
//     points="${POLYGON_VERTICES}"
//     fill="#58402A"
//     stroke="#676158"
//     stroke-width="30"
//     transform="scale(0.07) translate(65, 65)"
// />

return html(
    /* HTML */ ` <div class="fluid-container coordinates-container">
        <svg id="navigate" height="100%" width="100%" viewBox="0 0 300 300">
            <polygon points="${POLYGON_VERTICES}" fill="#d9cba3" stroke="black" stroke-width="3" />
            <svg class="coordinates" x="269" y="135">
                <polygon
                    class="poly"
                    points="${POLYGON_VERTICES}"
                    fill="#58402A"
                    stroke-width="20"
                    transform="scale(0.1)"
                />
            </svg>
            <svg class="coordinates" x="202" y="251">
                <polygon
                    class="poly"
                    points="${POLYGON_VERTICES}"
                    fill="#58402A"
                    stroke-width="20"
                    transform="scale(0.1)"
                />
            </svg>
            <svg class="coordinates" x="68" y="251" skip="yes">
                <polygon
                    class="poly"
                    points="${POLYGON_VERTICES}"
                    fill="#58402A"
                    stroke-width="20"
                    transform="scale(0.1)"
                />
            </svg>
            <svg class="coordinates" x="1" y="135" skip="yes">
                <polygon
                    class="poly"
                    points="${POLYGON_VERTICES}"
                    fill="#58402A"
                    stroke-width="20"
                    transform="scale(0.1)"
                />
            </svg>
            <svg class="coordinates" x="68" y="19" skip="yes" topSkip="yes">
                <polygon
                    class="poly"
                    points="${POLYGON_VERTICES}"
                    fill="#58402A"
                    stroke-width="20"
                    transform="scale(0.1)"
                />
            </svg>
            <svg class="coordinates" x="202" y="19" topSkip="yes">
                <polygon
                    class="poly"
                    points="${POLYGON_VERTICES}"
                    fill="#58402A"
                    stroke-width="20"
                    transform="scale(0.1)"
                />
            </svg>
        </svg>
    </div>`
);
