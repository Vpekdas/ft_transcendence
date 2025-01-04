import { Component } from "../micro";
import NavBar from "../components/NavBars/HomeNavBar";

export default class NotFound extends Component {
    constructor() {
        super();
    }

    async render() {
        this.setTitle("404 - Divergence");
        return html(
            /* HTML */
            ` <div>
                <div id="background">
                    <div class="glitch-wrapper">
                        <div class="glitch" data-glitch="404 - Divergence">404 - Divergence</div>
                    </div>
                    <p>It seems you've diverged from the main timeline. This page doesn't exist in this world line.</p>
                    <p>Return to the main timeline and continue your journey.</p>
                    <button type="button" onclick="window.location.href='/'" class="btn btn-warning return-home-button">
                        Return to Main Timeline
                    </button>
                </div>
            </div>`
        );
    }
}
