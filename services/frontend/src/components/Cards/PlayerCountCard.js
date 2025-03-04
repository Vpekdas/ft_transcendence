import { tr } from "../../i18n";
import { Component } from "../../micro";

export default class PlayerCountCard extends Component {
    render() {
        return /* HTML */ ` <div class="card settings">
            <h5 class="card-title settings" data-text="${tr("Number of Players")}">${tr("Number of Players")}</h5>
            <div class="btn-group player-count" role="group" aria-label="Basic radio toggle button group">
                <input type="radio" class="btn-check" name="btnradio" id="btnradio2" autocomplete="off" checked />
                <label class="btn btn-outline-primary player-count" for="btnradio2">2</label>

                <input type="radio" class="btn-check" name="btnradio" id="btnradio4" autocomplete="off" />
                <label class="btn btn-outline-primary player-count" for="btnradio4">4</label>

                <input type="radio" class="btn-check" name="btnradio" id="btnradio8" autocomplete="off" />
                <label class="btn btn-outline-primary player-count" for="btnradio8">8</label>
            </div>
        </div>`;
    }
}
