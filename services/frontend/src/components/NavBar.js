import { Component, globalComponents, html } from "../micro";

export default class NavBar extends Component {
    constructor() {
        super();
    }

    async render() {
        console.log(window.location);
        let activeHome, activeProfile, activeCounter;

        if (window.location.href === "http://localhost:8080/") {
            activeHome = "active";
            activeProfile = "";
            activeCounter = "";
        } else if (window.location.href === "http://localhost:8080/profile") {
            activeHome = "";
            activeProfile = "active";
            activeCounter = "";
        } else if (window.location.href === "http://localhost:8080/counter") {
            activeHome = "";
            activeProfile = "";
            activeCounter = "active";
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
                        <a class="icon-link nav-link custom-link ${activeHome}" data-link href="/">
                            <img src="/favicon.svg" class="img-fluid" width="21" height="21" />
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link custom-link ${activeProfile}" data-link href="/profile">
                            <i class="bi bi-person-badge"></i>
                            <span>Profile</span>
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link custom-link ${activeCounter}" data-link href="/counter">Counter</a>
                    </li>
                </ul>
            </div>`
        );
    }
}
globalComponents.set("NavBar", NavBar);

// TODO Add a dynamic function to update the "active" class on nav links based on the current URL.
// TODO This ensures that the user can visually see which page they are currently on.
