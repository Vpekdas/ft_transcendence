import { Component, globalComponents, html } from "../../micro";
import { tr } from "../../i18n";
import { fetchApi, post } from "../../api";

export default class PlayerCountCard extends Component {
    constructor() {
        super();
    }

    async render() {
        return html(
            /* HTML */ ` <div class="card settings">
                <h5 class="card-title settings">${tr("Number of Players")}</h5>
                <div class="btn-group player-count" role="group" aria-label="Basic radio toggle button group">
                    <input type="radio" class="btn-check" name="btnradio" id="btnradio2" autocomplete="off" checked />
                    <label class="btn btn-outline-primary" for="btnradio2">2</label>

                    <input type="radio" class="btn-check" name="btnradio" id="btnradio4" autocomplete="off" />
                    <label class="btn btn-outline-primary" for="btnradio4">4</label>

                    <input type="radio" class="btn-check" name="btnradio" id="btnradio8" autocomplete="off" />
                    <label class="btn btn-outline-primary" for="btnradio8">8</label>
                </div>
            </div>`
        );
    }
}
globalComponents.set("PlayerCountCard", PlayerCountCard);
