import { Component, globalComponents, html } from "../micro";
import { tr } from "../i18n";
import { fetchApi, post } from "../api";

export default class TournamentNameCard extends Component {
    constructor() {
        super();
    }

    async render() {
        return html(
            /* HTML */ ` <div class="card settings">
                <h5 class="card-title settings">Tournament Name</h5>
                <div class="card-body settings">
                    <p class="card-text settings">You can choose tournament name here.</p>
                    <input
                        type="text"
                        id="tournament-name"
                        class="form-control settings"
                        aria-describedby="tournamentName"
                        autocomplete="off"
                        placeholder="Tournament name"
                        required
                    />
                </div>
            </div>`
        );
    }
}
globalComponents.set("TournamentNameCard", TournamentNameCard);
