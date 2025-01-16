import { tr } from "../../i18n";
import { Component } from "../../micro";

/** @type {import("../../micro").Component} */

export default class ProfileNavBar extends Component {
    activeTabClass(t) {
        if (window.location.pathname == t) return "active";
        return "";
    }

    render() {
        /* HTML */ `<div class="container-fluid dashboard-navbar">
            <ul class="nav flex-column dashboard-tab">
                <li class="nav-item">
                    <a
                        class="nav-link custom-link ${activeTabClass("/profile/match-history")}"
                        data-link
                        href="/profile/match-history"
                    >
                        <i class="bi bi-clock-history"></i>
                        <span>${tr("Match History")}</span>
                    </a>
                </li>
                <li class="nav-item">
                    <a
                        class="nav-link custom-link ${activeTabClass("/profile/statistics")}"
                        data-link
                        href="/profile/statistics"
                    >
                        <i class="bi bi-file-bar-graph"></i>
                        <span>${tr("Statistics")}</span>
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link custom-link ${activeTabClass("/profile/skins")}" data-link href="/profile/skins">
                        <i class="bi bi-stars"></i>
                        <span>${tr("Skins")}</span>
                    </a>
                </li>
                <li class="nav-item">
                    <a
                        class="nav-link custom-link ${activeTabClass("/profile/settings")}"
                        data-link
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
