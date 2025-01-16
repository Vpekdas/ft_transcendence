import { tr } from "../../i18n";
import { Component } from "../../micro";

export default class NavBar extends Component {
    activeTabClass(t) {
        return window.location.pathname.startsWith(t) ? "active" : "";
    }

    render() {
        return /* HTML */ `
            <ul class="nav navbar">
                <div class="background-elements">
                    <div class="glitch-wrapper">
                        <div class="glitch text-layer text-layer-1">FT-TRANSCENDENCE</div>
                        <div class="glitch text-layer text-layer-2">FT-TRANSCENDENCE</div>
                        <div class="glitch text-layer text-layer-3">FT-TRANSCENDENCE</div>
                    </div>
                </div>
                <li class="nav-item icon-link">
                    <a class="icon-link nav-link custom-link ${this.activeTabClass("/")}" href="/">
                        <img src="/favicon.svg" class="img-fluid" width="21" height="21" />
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link custom-link ${this.activeTabClass("/profile")}" href="/profile/match-history">
                        <i class="bi bi-person-badge"></i>
                        <span>${tr("Profile")}</span>
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link custom-link ${this.activeTabClass("/duck")}" href="/duck">Clicker</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link custom-link ${this.activeTabClass("/solar-system")}" href="/solar-system">
                        <i class="bi bi-rocket"></i>
                        <span>${tr("Solar System")}</span>
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link custom-link ${this.activeTabClass("/logout")}" href="/logout">
                        <i class="bi bi-box-arrow-in-right"></i>
                        <span>${tr("Logout")}</span></a
                    >
                </li>
                <li class="nav-item">
                    <a class="nav-link custom-link ${this.activeTabClass("/test")}" href="/test"> <span>Test</span></a>
                </li>
                <div class="language-picker-container">
                    <LanguagePicker />
                </div>
            </ul>
        `;
    }
}
