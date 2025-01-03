import { Component, html } from "../../micro";
import { tr } from "../../i18n";

export default class ProfileNavBar extends Component {
    constructor() {
        super();
    }

    async render() {
        function activeTabClass(t) {
            if (window.location.pathname == t) return "active";
            return "";
        }

        const matchHistoryLanguage = tr("Match History");
        const statisticsLanguage = tr("Statistics");
        const skinsLanguage = tr("Skins");
        const settingsLanguage = tr("Settings");

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
                            <span>${matchHistoryLanguage}</span>
                        </a>
                    </li>
                    <li class="nav-item">
                        <a
                            class="nav-link custom-link ${activeTabClass("/profile/statistics")}"
                            data-link
                            href="/profile/statistics"
                        >
                            <i class="bi bi-file-bar-graph"></i>
                            <span>${statisticsLanguage}</span>
                        </a>
                    </li>
                    <li class="nav-item">
                        <a
                            class="nav-link custom-link ${activeTabClass("/profile/skins")}"
                            data-link
                            href="/profile/skins"
                        >
                            <i class="bi bi-stars"></i>
                            <span>${skinsLanguage}</span>
                        </a>
                    </li>
                    <li class="nav-item">
                        <a
                            class="nav-link custom-link ${activeTabClass("/profile/settings")}"
                            data-link
                            href="/profile/settings"
                        >
                            <i class="bi bi-gear"></i>
                            <span>${settingsLanguage}</span>
                        </a>
                    </li>
                </ul>
            </div>`
        );
    }
}
