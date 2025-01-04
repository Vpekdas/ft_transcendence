import { tr } from "../../i18n";

export default async function TournamentNameCard({}) {
    return /* HTML */ ` <div class="card settings">
        <h5 class="card-title settings">${tr("Tournament Name")}</h5>
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
