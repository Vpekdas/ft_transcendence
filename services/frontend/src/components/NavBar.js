import { Component, globalComponents, html } from "../micro";
import { isLoggedIn } from "../api";

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
            logoutNavItem = `<li class="nav-item">
                        <a class="nav-link custom-link ${activeTabClass("/logout")}" data-link href="/logout"
                            >Logout</a
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
                            <span>Profile</span>
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link custom-link ${activeTabClass("/counter")}" data-link href="/counter"
                            >Counter</a
                        >
                    </li>
                    ${logoutNavItem}
                </ul>
            </div>`
        );
    }
}
globalComponents.set("NavBar", NavBar);
