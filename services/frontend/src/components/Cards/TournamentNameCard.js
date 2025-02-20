import { tr } from "../../i18n";
import { Component } from "../../micro";

/** @type {import("../../micro").Component} */

export default class TournamentNameCard extends Component {
    render() {
        return /* HTML */ ` <div class="card settings">
            <h5 class="card-title settings" data-text="${tr("Tournament Name")}">${tr("Tournament Name")}</h5>
            <div class="card-body settings">
                <p class="card-text settings">${tr("Choose the tournament name here.")}</p>
                <input
                    type="text"
                    id="tournament-name"
                    class="form-control settings"
                    aria-describedby="tournamentName"
                    autocomplete="off"
                    placeholder="${tr("Tournament Name")}"
                    required
                />
            </div>
        </div>`;
    }
}
