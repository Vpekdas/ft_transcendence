import { Component, globalComponents, html } from "../micro";
import { tr } from "../i18n";
import { fetchApi, post } from "../api";

export default class PlayerCountCard extends Component {
    constructor() {
        super();
    }

    async render() {
        return html(
            /* HTML */ ` <div class="card settings">
                <h5 class="card-title settings">Player Count</h5>
                <div class="btn-group player-count" role="group" aria-label="Basic radio toggle button group">
                    <input type="radio" class="btn-check" name="btnradio" id="btnradio1" autocomplete="off" checked />
                    <label class="btn btn-outline-primary" for="btnradio1">2</label>

                    <input type="radio" class="btn-check" name="btnradio" id="btnradio2" autocomplete="off" />
                    <label class="btn btn-outline-primary" for="btnradio2">4</label>

                    <input type="radio" class="btn-check" name="btnradio" id="btnradio3" autocomplete="off" />
                    <label class="btn btn-outline-primary" for="btnradio3">8</label>

                    <input type="radio" class="btn-check" name="btnradio" id="btnradio4" autocomplete="off" />
                    <label class="btn btn-outline-primary" for="btnradio4">16</label>
                </div>
            </div>`
        );
    }
}
globalComponents.set("PlayerCountCard", PlayerCountCard);
