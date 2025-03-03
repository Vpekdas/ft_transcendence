import { Component } from "../micro";
import { tr } from "../i18n";

export default class NotFound extends Component {
    async init() {
        document.title = "404 - Divergence";
    }

    render() {
        return /* HTML */ ` <div id="background">
            <div class="glitch-wrapper">
                <div class="glitch" data-glitch="404 - Divergence">404 - Divergence</div>
            </div>
            <p>${tr("It seems you've diverged from the main timeline. This page doesn't exist in this world line.")}</p>
            <p>${tr("Return to the main timeline and continue your journey.")}</p>
            <button type="button" onclick="window.location.href='/'" class="btn btn-warning return-home-button">
                ${tr("Return to Main Timeline")}
            </button>
        </div>`;
    }
}
