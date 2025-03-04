import { tr } from "../../i18n";
import { Component } from "../../micro";

export default class PointsCard extends Component {
    render() {
        return /* HTML */ ` <div class="card settings">
            <h5 class="card-title settings" data-text="${tr("Number of points per game")}">
                ${tr("Number of points per game")}
            </h5>
            <div class="btn-group player-count" role="group" aria-label="Basic radio toggle button group">
                <input type="number" name="points" value="7" id="tournament-points" />
            </div>
        </div>`;
    }
}
