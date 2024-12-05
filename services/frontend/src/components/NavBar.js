import { Component, globalComponents, html } from "../micro";

const activeRoutes = new Map();

activeRoutes.set("/", "");
activeRoutes.set("/profile", "");
activeRoutes.set("/counter", "");

export default class NavBar extends Component {
    constructor() {
        super();
    }

    async render() {
        const currentRoute = window.location.pathname;

        if (activeRoutes.has(currentRoute)) {
            activeRoutes.set(currentRoute, "active");
            for (let [key] of activeRoutes) {
                if (key != currentRoute) {
                    activeRoutes.set(key, "");
                }
            }
        }

        function activeTabClass(t) {
            if (window.location.pathname.startsWith(t)) return "active";
            return "";
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
                </ul>
            </div>`
        );
    }
}
globalComponents.set("NavBar", NavBar);

// TODO Add a dynamic function to update the "active" class on nav links based on the current URL.
// TODO This ensures that the user can visually see which page they are currently on.
