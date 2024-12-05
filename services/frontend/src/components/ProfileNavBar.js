import { Component, globalComponents, html } from "../micro";

export default class ProfileNavBar extends Component {
    constructor() {
        super();
    }

    async render() {
        function activeTabClass(t) {
            if (window.location.pathname == t) return "active";
            return "";
        }

        return html(
            /* HTML */
            `<div class="container-fluid dashboard-navbar">
                <ul class="nav flex-column dashboard-tab">
                    <li class="nav-item">
                        <a
                            class="nav-link custom-link ${activeTabClass("/profile/match-history")}"
                            data-link
                            href="/profile/match-history"
                        >
                            <i class="bi bi-clock-history"></i>
                            <span>Match History</span>
                        </a>
                    </li>
                    <li class="nav-item">
                        <a
                            class="nav-link custom-link ${activeTabClass("/profile/statistics")}"
                            data-link
                            href="/profile/statistics"
                        >
                            <i class="bi bi-file-bar-graph"></i>
                            <span>Statistics</span>
                        </a>
                    </li>
                    <li class="nav-item">
                        <a
                            class="nav-link custom-link ${activeTabClass("/profile/skins")}"
                            data-link
                            href="/profile/skins"
                        >
                            <i class="bi bi-stars"></i>
                            <span>Skins</span>
                        </a>
                    </li>
                    <li class="nav-item">
                        <a
                            class="nav-link custom-link ${activeTabClass("/profile/settings")}"
                            data-link
                            href="/profile/settings"
                        >
                            <i class="bi bi-gear"></i>
                            <span>Settings</span>
                        </a>
                    </li>
                </ul>
            </div>`
        );
    }
}
globalComponents.set("ProfileNavBar", ProfileNavBar);
