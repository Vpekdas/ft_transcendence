import { tr } from "../i18n";
import { Component } from "../micro";

/** @type {import("../micro").Component} */
export default class MatchHistory extends Component {
    async init() {
        document.title = tr("Match History");
    }
    render() {
        return /* HTML */ ` <div class="container-fluid dashboard-container">
            <ProfileNavBar />
            <ul class="list-group match-history">
                <li class="list-group-item">Game 1</li>
                <li class="list-group-item">Game 2</li>
                <li class="list-group-item">Game 3</li>
                <li class="list-group-item">Game 4</li>
                <li class="list-group-item">Game 5</li>
                <li class="list-group-item">Game 6</li>
            </ul>
        </div>`;
    }
}
