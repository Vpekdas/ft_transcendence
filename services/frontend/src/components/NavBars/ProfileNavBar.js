import { tr } from "../../i18n";
import { Component } from "../../micro";

/** @type {import("../../micro").Component} */

export default class ProfileNavBar extends Component {
    activeTabClass(t) {
        if (window.location.pathname == t) return "active";
        return "";
    }

    render() {
        return /* HTML */ `<div class="container-fluid dashboard-navbar">
            <ul class="nav flex-column dashboard-tab">
                <li class="nav-item">
                    <a
                        class="nav-link custom-link ${this.activeTabClass("/profile/match-history")}"
                        href="/profile/match-history"
                    >
                        <i class="bi bi-clock-history"></i>
                        <span>${tr("Match History")}</span>
                    </a>
                </li>
                <li class="nav-item">
                    <a
                        class="nav-link custom-link ${this.activeTabClass("/profile/statistics")}"
                        href="/profile/statistics"
                    >
                        <i class="bi bi-file-bar-graph"></i>
                        <span>${tr("Statistics")}</span>
                    </a>
                </li>
                <li class="nav-item">
                    <a
                        class="nav-link custom-link ${this.activeTabClass("/profile/skins")}"
                        data-link
                        href="/profile/skins"
                    >
                        <i class="bi bi-stars"></i>
                        <span>${tr("Skins")}</span>
                    </a>
                </li>
                <li class="nav-item">
                    <a
                        class="nav-link custom-link ${this.activeTabClass("/profile/settings")}"
                        href="/profile/settings"
                    >
                        <i class="bi bi-gear"></i>
                        <span>${tr("Settings")}</span>
                    </a>
                </li>
            </ul>
        </div>`;
    }
}
