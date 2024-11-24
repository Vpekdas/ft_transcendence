import { Component, globalComponents, html } from "../micro";
import NavBar from "../components/NavBar";
import ProfileDashboard from "./ProfileDashboard";
import Chart from "../components/Chart";

export default class Settings extends Component {
    constructor() {
        super();
    }

    async render() {
        this.setTitle("Settings");

        this.query(".form-control").on("change", async (event) => {
            const picture = event.target.files[0];
            const data = new FormData();
            data.append("picture", picture);

            console.log(data.get("picture"));
        });

        return html(
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
                    <ul class="list-group settings">
                        <div class="card">
                            <img src="/favicon.svg" class="card-img-top profile" />
                            <div class="card-body">
                                <h5 class="card-title">Profile Picture</h5>
                                <div class="input-group">
                                    <input
                                        type="file"
                                        class="form-control"
                                        id="inputGroupFile04"
                                        aria-describedby="inputGroupFileAddon04"
                                        aria-label="Upload"
                                    />
                                    <button class="btn btn-outline-secondary" type="button" id="inputGroupFileAddon04">
                                        Upload
                                    </button>
                                </div>
                            </div>
                        </div>
                    </ul>
                </div>
            </div>`
        );
    }
}
globalComponents.set("Settings", Settings);
