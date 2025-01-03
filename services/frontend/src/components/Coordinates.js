import { Component, html } from "../micro";

export default class Coordinates extends Component {
    constructor() {
        super();
    }

    async render() {
        return html(
            /* HTML */ ` <div class="fluid-container coordinates-container">
                <svg height="100%" width="100%" viewBox="0 0 300 300">
                    <polygon
                        points="300,150 225,280 75,280 0,150 75,20 225,20"
                        fill="orange"
                        stroke="blue"
                        stroke-width="3"
                    />
                    <svg x="263" y="135">
                        <polygon
                            points="300,150 225,280 75,280 0,150 75,20 225,20"
                            fill="orange"
                            stroke="blue"
                            stroke-width="20"
                            transform="scale(0.1)"
                        />
                    </svg>
                    <svg x="200" y="245">
                        <polygon
                            points="300,150 225,280 75,280 0,150 75,20 225,20"
                            fill="orange"
                            stroke="blue"
                            stroke-width="20"
                            transform="scale(0.1)"
                        />
                    </svg>
                    <svg x="70" y="245">
                        <polygon
                            points="300,150 225,280 75,280 0,150 75,20 225,20"
                            fill="orange"
                            stroke="blue"
                            stroke-width="20"
                            transform="scale(0.1)"
                        />
                    </svg>
                    <svg x="8" y="135">
                        <polygon
                            points="300,150 225,280 75,280 0,150 75,20 225,20"
                            fill="orange"
                            stroke="blue"
                            stroke-width="20"
                            transform="scale(0.1)"
                        />
                    </svg>
                    <svg x="70" y="25">
                        <polygon
                            points="300,150 225,280 75,280 0,150 75,20 225,20"
                            fill="orange"
                            stroke="blue"
                            stroke-width="20"
                            transform="scale(0.1)"
                        />
                    </svg>
                    <svg x="200" y="25">
                        <polygon
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
