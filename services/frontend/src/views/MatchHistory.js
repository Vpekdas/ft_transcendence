import { Component, globalComponents, html } from "../micro";
import NavBar from "../components/NavBar";

export default class MatchHistory extends Component {
    constructor() {
        super();
    }

    async render() {
        this.setTitle("Match History");
        return html(
            /* HTML */
            ` <div>
                <NavBar />
                <div class="container-fluid dashboard-container">
                    <ul class="nav flex-column dashboard-tab">
                        <li class="nav-item">
                            <a class="nav-link custom-link" data-link href="/profile/match-history">
                                <i class="bi bi-clock-history"></i>
                                <span>Match History</span>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link custom-link" data-link href="/profile/statistics">
                                <i class="bi bi-file-bar-graph"></i>
                                <span>Statistics</span>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link custom-link" data-link href="/profile/skins">
                                <i class="bi bi-stars"></i>
                                <span>Skins</span>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link custom-link " data-link href="/profile/settings">
                                <i class="bi bi-gear"></i>
                                <span>Settings</span>
                            </a>
                        </li>
                    </ul>
                    <ul class="list-group match-history">
                        <li class="list-group-item">Game 1</li>
                        <li class="list-group-item">Game 2</li>
                        <li class="list-group-item">Game 3</li>
                        <li class="list-group-item">Game 4</li>
                        <li class="list-group-item">Game 5</li>
                        <li class="list-group-item">Game 6</li>
                    </ul>
                </div>
            </div>`
        );
    }
}
globalComponents.set("MatchHistory", MatchHistory);
