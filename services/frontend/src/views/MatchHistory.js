import { Component, globalComponents, html } from "../micro";
import NavBar from "../components/NavBar";
import ProfileNavBar from "../components/ProfileNavBar";

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
                    <ProfileNavBar />
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
