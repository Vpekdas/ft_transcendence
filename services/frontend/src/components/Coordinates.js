import { SCALE, POLYGON_VERTICES } from "../constant";
import { FIRST_COORDINATES, SECOND_COORDINATES, THIRD_COORDINATES } from "../constant";
import { Component } from "../micro";

/** @type {import("../micro").Component} */
export default class Coordinates extends Component {
    calculateDistance(x1, y1, x2, y2) {
        return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    }

    isRIghtCoordinate(userPath, rightPath) {
        if (userPath.length !== rightPath.length) {
            return false;
        }
        for (let i = 0; i < rightPath.length; i++) {
            if (userPath[i] !== rightPath[i]) {
                return false;
            }
        }
        const coordinate = document.querySelector(".fluid-container.coordinates-container");
        if (coordinate) {
            const paths = document.querySelectorAll(".path");
            paths.forEach((path) => path.remove());
        }
        return true;
    }

    async init() {
        document.querySelector(".fluid-container.coordinates-container").do(async (container) => {
            const coordinates = container.querySelectorAll(".coordinates");

            var click = 0,
                skip = 0,
                topSkip = 0,
                validatedStep = 0,
                x,
                y,
                xp,
                yp,
                distance;

            const firstPolyVertices = [];
            const secondPolyVertices = [];
            const closestVertices = [];
            const drawnPolygons = [];

            const vertices = POLYGON_VERTICES.split(" ");

            coordinates.forEach((coordinate) => {
                coordinate.addEventListener("click", async () => {
                    coordinate.querySelector("polygon").classList.add("glow");

                    // Handling an edge case where 3 polygons on the left create a polygon at the bottom edge instead of the top.
                    // This adjustment improves visual consistency.
                    if (coordinate.getAttribute("skip")) {
                        skip++;
                    }

                    if (coordinate.getAttribute("topSkip")) {
                        topSkip++;
                    }

                    // Ensure that a polygon is drawn only when there are exactly 2 clicks.
                    // For x and y, take the point in the small polygon scale and then add its position on x and y relative to the large polygons.
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

                        // Calculate the distance between each point of the first polygon and each point of the second polygon.
                        // This is done for every point in both polygons.
                        for (let i = 0; i < firstPolyVertices.length; i++) {
                            for (let j = 0; j < secondPolyVertices.length; j++) {
                                x = firstPolyVertices[i].x;
                                y = firstPolyVertices[i].y;
                                xp = secondPolyVertices[j].x;
                                yp = secondPolyVertices[j].y;
                                distance = calculateDistance(x, y, xp, yp);
                                closestVertices.push({ x: x, y: y, xp: xp, yp: yp, distance: distance });
                            }
                        }

                        // Sort every pair of coordinates by their distance.
                        closestVertices.sort((a, b) => a.distance - b.distance);

                        let points = "";

                        // The first index is always the closest, so we can push it.
                        points += closestVertices[0].x + "," + closestVertices[0].y + " ";

                        for (let i = 1; i < closestVertices.length; i++) {
                            // Ensure that the same point is not used twice. If this is not done, it can draw a triangle instead of a rectangle.
                            if (
                                (closestVertices[0].x === closestVertices[i].x &&
                                    closestVertices[0].y === closestVertices[i].y) ||
                                (closestVertices[0].xp === closestVertices[i].xp &&
                                    closestVertices[0].yp === closestVertices[i].yp)
                            ) {
                                continue;
                            }

                            // Handle edge case where 3 polygons on the left create a polygon at the bottom instead of the top.
                            // This ensures that the rectangle is drawn at the top for visual consistency.
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

                        // ! create a function.
                        // Ensure that nothing is drawn if the user double-clicks on the same polygon.
                        const splitPoints = points.split(" ");
                        if (splitPoints[0] === splitPoints[3] && splitPoints[1] === splitPoints[2]) {
                            click = 0;
                            skip = 0;
                            topSkip = 0;
                            firstPolyVertices.length = 0;
                            secondPolyVertices.length = 0;
                            closestVertices.length = 0;
                            return;
                        }

                        // ! create a function.
                        // Ensure the same polygon is not drawn twice.
                        for (let i = 0; i < drawnPolygons.length; i++) {
                            if (points === drawnPolygons[i]) {
                                click = 0;
                                skip = 0;
                                topSkip = 0;
                                firstPolyVertices.length = 0;
                                secondPolyVertices.length = 0;
                                closestVertices.length = 0;
                                return;
                            }
                        }

                        // ! create a function.
                        // Ensure the same polygon is not drawn twice in the reverse order.

                        for (let i = 0; i < drawnPolygons.length; i++) {
                            console.log(
                                "points: ",
                                points,
                                "polygons: ",
                                drawnPolygons[i].split(" ").reverse().join(" ")
                            );

                            if (points === drawnPolygons[i].split(" ").reverse().join(" ")) {
                                click = 0;
                                skip = 0;
                                topSkip = 0;
                                firstPolyVertices.length = 0;
                                secondPolyVertices.length = 0;
                                closestVertices.length = 0;
                                return;
                            }
                        }

                        drawnPolygons.push(points);

                        // Draw the polygon.
                        const navigate = container.querySelector("#navigate");
                        var newPoly = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
                        newPoly.setAttribute("class", "path");
                        newPoly.setAttribute("points", points);

                        navigate.append(newPoly);

                        // Reset and clear all arrays.
                        click = 0;
                        skip = 0;
                        topSkip = 0;
                        firstPolyVertices.length = 0;
                        secondPolyVertices.length = 0;
                        closestVertices.length = 0;

                        window.addEventListener("keydown", (event) => {
                            if (event.key === "c") {
                                const coordinate = document.querySelector(".fluid-container.coordinates-container");
                                if (coordinate) {
                                    const paths = document.querySelectorAll(".path");
                                    paths.forEach((path) => path.remove());
                                    drawnPolygons.length = 0;
                                }
                            }
                        });

                        if (validatedStep === 0) {
                            if (isRIghtCoordinate(drawnPolygons, FIRST_COORDINATES)) {
                                validatedStep++;
                                drawnPolygons.length = 0;
                            }
                        } else if (validatedStep === 1) {
                            if (isRIghtCoordinate(drawnPolygons, SECOND_COORDINATES)) {
                                validatedStep++;
                                drawnPolygons.length = 0;
                            }
                        } else {
                            if (isRIghtCoordinate(drawnPolygons, THIRD_COORDINATES)) {
                                validatedStep++;
                                drawnPolygons.length = 0;
                            }
                        }

                        if (validatedStep === 3) {
                            console.log("congrats x)");
                        }
                    }
                });
            });
        });
    }

    render() {
        return /* HTML */ ` <div class="fluid-container coordinates-container">
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
        </div>`;
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
