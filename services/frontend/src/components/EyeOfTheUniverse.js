import { tr } from "../i18n";
import { Component } from "../micro";

/** @type {import("../micro").Component}  */
export default class EyeOfTheUniverse extends Component {
    async init() {
        dom.querySelector("#eye-of-the-universe").do(() => {
            class SVGLightning {
                constructor(svg) {
                    this.svg = svg;
                    this.lightning = [];
                    this.lightTimeCurrent = 0;
                    this.lightTimeTotal = 50;
                    this.now = Date.now();
                    this.then = this.now;
                    this.delta = 0;
                    this.init();
                }

                init() {
                    this.loop();
                }

                rand(min, max) {
                    return Math.floor(Math.random() * (max - min + 1) + min);
                }

                createLightning(x, y) {
                    const lightning = {
                        x,
                        y,
                        xRange: this.rand(5, 30),
                        yRange: this.rand(5, 25),
                        path: [{ x, y }],
                        pathLimit: this.rand(20, 50),
                        grower: 0,
                        growerLimit: 10,
                    };
                    this.lightning.push(lightning);
                    this.renderLightning(lightning);
                }

                // Ensure that if the lightning has reached its point, add another point to the path
                // If it has grown enough, stop updating the lightning path
                updateLightning() {
                    this.lightning = this.lightning.filter((light) => {
                        light.grower += this.delta;
                        if (light.grower >= light.growerLimit) {
                            light.grower = 0;
                            light.growerLimit *= 1.05;
                            light.path.push({
                                x:
                                    light.path[light.path.length - 1].x +
                                    (this.rand(0, light.xRange) - light.xRange / 2),
                                y: light.path[light.path.length - 1].y + this.rand(0, light.yRange),
                            });
                            if (light.path.length > light.pathLimit) {
                                return false;
                            }
                            this.renderLightning(light);
                        }
                        return true;
                    });
                }

                renderLightning(light) {
                    // Start by creating an "M" command to move the "pen" to the first point (index 0) of the lightning path,
                    // then use "L" commands to draw lines to subsequent points.
                    const pathData = light.path
                        .map((point, index) => {
                            return index === 0 ? `M${point.x},${point.y}` : `L${point.x},${point.y}`;
                        })
                        .join(" ");

                    let pathElement = document.getElementById(`lightning-${light.path[0].x}-${light.path[0].y}`);

                    // If we haven't found a similar pattern, we create a new one. If it exists, we won't create a new one but just re-render it.
                    if (!pathElement) {
                        pathElement = document.createElementNS("http://www.w3.org/2000/svg", "path");
                        pathElement.setAttribute("id", `lightning-${light.path[0].x}-${light.path[0].y}`);
                        pathElement.setAttribute("stroke", "hsla(270, 100%, 20%, 0.8)");
                        pathElement.setAttribute("stroke-width", this.rand(1, 4));
                        pathElement.setAttribute("fill", "none");
                        pathElement.setAttribute("filter", "url(#glow)");
                        this.svg.appendChild(pathElement);
                    }
                    pathElement.setAttribute("d", pathData);
                }

                lightningTimer() {
                    this.lightTimeCurrent += this.delta;
                    if (this.lightTimeCurrent >= this.lightTimeTotal) {
                        // Start X from 100px from the left and right edges.
                        const newX = this.rand(100, window.innerWidth - 100);

                        // Ensure that lightning does not start at ground level.
                        const newY = this.rand(0, window.innerHeight / 2);
                        const createCount = this.rand(3, 7);
                        for (let i = 0; i < createCount; i++) {
                            this.createLightning(newX, newY, true);
                        }
                        this.lightTimeCurrent = 0;
                        this.lightTimeTotal = this.rand(700, 2000);
                    }
                }

                clearSVG() {
                    while (this.svg.firstChild) {
                        this.svg.removeChild(this.svg.firstChild);
                    }
                }

                loop() {
                    requestAnimationFrame(this.loop.bind(this));
                    this.now = Date.now();
                    this.delta = this.now - this.then;
                    this.then = this.now;
                    this.clearSVG();
                    this.updateLightning();
                    this.lightningTimer();
                }
            }

            const svg = document.getElementById("eye-of-the-universe");
            new SVGLightning(svg);
        });
    }

    render() {
        return /* HTML */ `<svg id="eye-of-the-universe" viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <filter id="glow">
                    <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
                    <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>
        </svg>`;
    }
}
