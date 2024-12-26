import { Component, globalComponents, html } from "../../micro";
import { isLoggedIn } from "../../api";
import { tr } from "../../i18n";
import LanguagePicker from "../LanguagePicker";

export default class NavBar extends Component {
    constructor() {
        super();
    }

    async render() {
        function activeTabClass(t) {
            if (window.location.pathname.startsWith(t)) return "active";
            return "";
        }

        let logoutNavItem;

        if (await isLoggedIn()) {
            logoutNavItem = /* HTML */ `<li class="nav-item">
                <a class="nav-link custom-link ${activeTabClass("/logout")}" data-link href="/logout">
                    <i class="bi bi-box-arrow-in-right"></i>
                    <span>${tr("Logout")}</span></a
                >
            </li>`;
        }

        return html(
            /* HTML */ ` <div>
                <ul class="nav navbar">
                    <div class="background-elements">
                        <div class="glitch-wrapper">
                            <div class="glitch text-layer text-layer-1">FT-TRANSCENDENCE</div>
                            <div class="glitch text-layer text-layer-2">FT-TRANSCENDENCE</div>
                            <div class="glitch text-layer text-layer-3">FT-TRANSCENDENCE</div>
                        </div>
                    </div>
                    <li class="nav-item icon-link">
                        <a class="icon-link nav-link custom-link ${activeTabClass("/")}" data-link href="/">
                            <img src="/favicon.svg" class="img-fluid" width="21" height="21" />
                        </a>
                    </li>
                    <li class="nav-item">
                        <a
                            class="nav-link custom-link ${activeTabClass("/profile")}"
                            data-link
                            href="/profile/match-history"
                        >
                            <i class="bi bi-person-badge"></i>
                            <span>${tr("Profile")}</span>
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link custom-link ${activeTabClass("/counter")}" data-link href="/counter"
                            >Counter</a
                        >
                    </li>
                    <li class="nav-item">
                        <a
                            class="nav-link custom-link ${activeTabClass("/solar-system")}"
                            data-link
                            href="/solar-system"
                        >
                            <i class="bi bi-rocket"></i>
                            <span>${tr("Solar System")}</span>
                        </a>
                    </li>
                    ${logoutNavItem}
                    <div class="language-picker-container">
                        <LanguagePicker />
                    </div>
                </ul>
            </div>`
        );
    }
}
globalComponents.set("NavBar", NavBar);
