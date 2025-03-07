import { SCALE, POLYGON_VERTICES, FIRST_COORDINATES, SECOND_COORDINATES, THIRD_COORDINATES } from "../constant";
import { Component } from "../micro";
import { showToast } from "../utils";

export default class Coordinates extends Component {
    calculateDistance(x1, y1, x2, y2) {
        return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    }

    checkSinglePath(coordinates, points) {
        let matchStep = 0;

        for (let i = 0; i < coordinates.length; i++) {
            const rightPath = coordinates[i].split(" ");
            const userPath = points[i].split(" ");

            for (let i = 0; i < rightPath.length; i++) {
                if (userPath[i].includes(rightPath[i])) {
                    matchStep++;
                }
            }
        }

        if (matchStep !== coordinates.length * 4) {
            return false;
        } else {
            return true;
        }
    }

    checkAllPath(step, points) {
        if (step === 1 && points.length === 2) {
            return this.checkSinglePath(FIRST_COORDINATES, points);
        } else if (step === 2 && points.length === 3) {
            return this.checkSinglePath(SECOND_COORDINATES, points);
        } else if (step === 3 && points.length === 5) {
            return this.checkSinglePath(THIRD_COORDINATES, points);
        }

        return false;
    }

    clearPolygon(drawnPolygons) {
        const coordinate = document.getElementById("navigate");
        // Remove all glow path.
        if (coordinate) {
            const paths = document.querySelectorAll(".path");
            paths.forEach((path) => path.remove());
            drawnPolygons.length = 0;
        }
        const polygons = coordinate.querySelectorAll(".glow");

        // Remove all glow polygons.
        polygons.forEach((polygon) => {
            polygon.classList.remove("glow");
        });
    }

    async init() {
        this.onready = () => {
            const container = document.getElementById("navigate");
            const coordinates = container.querySelectorAll(".coordinates");

            var click = 0,
                skip = 0,
                topSkip = 0,
                step = 1,
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
                coordinate.addEventListener("click", () => {
                    coordinate.querySelector(".poly").classList.add("glow");
                    coordinate.querySelector(".small-poly").classList.add("glow");

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
                                distance = this.calculateDistance(x, y, xp, yp);
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

                        // Ensure the same polygon is not drawn twice in the reverse order.
                        for (let i = 0; i < drawnPolygons.length; i++) {
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
                        const navigate = document.getElementById("navigate");
                        var newPoly = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
                        newPoly.setAttribute("class", "path");
                        newPoly.setAttribute("points", points);

                        navigate.append(newPoly);

                        const blackHole = document.getElementById("black-hole");
                        const intro = document.getElementById("intro-container-5");
                        const introToHide = document.getElementById("intro-container-3");

                        if (this.checkAllPath(step, drawnPolygons)) {
                            if (step === 3) {
                                introToHide.style.display = "none";
                                showToast(
                                    `Coordinates indicate the Eye of the Universe. Arriving in 3 seconds through hyperspace!`,
                                    "bi bi-compass"
                                );
                                setTimeout(() => {
                                    blackHole.style.display = "flex";
                                    intro.style.display = "flex";
                                }, 3000);
                            } else {
                                showToast(
                                    `Coordinates aligned for step ${step}. Proceed to the next step.`,
                                    "bi bi-compass"
                                );
                            }

                            if (step !== 3) {
                                setTimeout(() => {
                                    this.clearPolygon(drawnPolygons);
                                }, 3000);
                            }

                            step++;
                        }

                        if (step === 4) {
                            const audio = document.getElementById("background-music");
                            if (audio && audio.duration > 0 && !audio.paused) {
                                audio.pause();
                            }
                            const audioSource = document.getElementById("audio-source");
                            audioSource.src = "/music/Final Voyage.mp3";
                            audio.load();
                            audio.play();
                            step++;
                        }

                        // Reset and clear all arrays.
                        click = 0;
                        skip = 0;
                        topSkip = 0;
                        firstPolyVertices.length = 0;
                        secondPolyVertices.length = 0;
                        closestVertices.length = 0;

                        window.addEventListener("keydown", (event) => {
                            if (event.key === "c") {
                                this.clearPolygon(drawnPolygons);
                            }
                        });
                    }
                });
            });
        };
    }

    render() {
        return /* HTML */ `<svg id="navigate" height="100%" width="100%" viewBox="0 0 300 300">
            <polygon points="${POLYGON_VERTICES}" fill="#d9cba3" stroke="black" stroke-width="3" />
            <svg class="coordinates" x="269" y="135">
                <polygon
                    class="poly"
                    points="${POLYGON_VERTICES}"
                    fill="#58402A"
                    stroke-width="20"
                    transform="scale(0.1)"
                />
                <polygon
                    class="small-poly"
                    points="${POLYGON_VERTICES}"
                    fill="#58402A"
                    stroke="#676158"
                    stroke-width="50"
                    transform="scale(0.07) translate(65, 65)"
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
                <polygon
                    class="small-poly"
                    points="${POLYGON_VERTICES}"
                    fill="#58402A"
                    stroke="#676158"
                    stroke-width="50"
                    transform="scale(0.07) translate(65, 65)"
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
                <polygon
                    class="small-poly"
                    points="${POLYGON_VERTICES}"
                    fill="#58402A"
                    stroke="#676158"
                    stroke-width="50"
                    transform="scale(0.07) translate(65, 65)"
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
                <polygon
                    class="small-poly"
                    points="${POLYGON_VERTICES}"
                    fill="#58402A"
                    stroke="#676158"
                    stroke-width="50"
                    transform="scale(0.07) translate(65, 65)"
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
                <polygon
                    class="small-poly"
                    points="${POLYGON_VERTICES}"
                    fill="#58402A"
                    stroke="#676158"
                    stroke-width="50"
                    transform="scale(0.07) translate(65, 65)"
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
                <polygon
                    class="small-poly"
                    points="${POLYGON_VERTICES}"
                    fill="#58402A"
                    stroke="#676158"
                    stroke-width="50"
                    transform="scale(0.07) translate(65, 65)"
                />
            </svg>
        </svg> `;
    }
}
