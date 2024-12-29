import { Component, html } from "../micro";
import NavBar from "../components/NavBars/HomeNavBar";
import ProfileNavBar from "../components/NavBars/ProfileNavBar";
import { isLoggedIn } from "../utils";
import { navigateTo } from "../router";

export default class MatchHistory extends Component {
    constructor() {
        super();
    }

    async render() {
        if (!(await isLoggedIn())) {
            navigateTo("/login");
        }
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
