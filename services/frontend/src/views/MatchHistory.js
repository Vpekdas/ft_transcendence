import { Component, globalComponents, html } from "../micro";
import NavBar from "../components/NavBar";
import ProfileDashboard from "./ProfileDashboard";

export default class MatchHistory extends Component {
    constructor() {
        super();
    }

    async render() {
        this.setTitle("Match History");
        return html(
            this.parent,
            /* HTML */
            ` <div>
                <NavBar />
                <div class="container-fluid dashboard-container">
                    <ul class="nav flex-column nav-underline dashboard-tab">
                        <li class="nav-item">
                            <a class="nav-link" data-link href="/profile/match-history">Match History</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" data-link href="/profile/statistics">Statistics</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" data-link href="/profile/skins">Skins</a>
                        </li>

                        <li class="nav-item">
                            <a class="nav-link" data-link href="/profile/settings">Settings</a>
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
