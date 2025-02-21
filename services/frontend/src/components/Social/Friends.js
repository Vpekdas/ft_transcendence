import { Component } from "../../micro";

export default class Friends extends Component {
    activeTabClass(t) {
        if (window.location.pathname == t) return "active";
        return "";
    }

    render() {
        return /* HTML */ ` <div class="container-fluid dashboard-container">
            <ProfileNavBar />
            <div class="container-fluid social-container">
                <ul class="nav navbar social">
                    <li class="nav-item icon-link social">
                        <a
                            class="nav-link custom-link ${this.activeTabClass("/profile/social/friends")}"
                            href="/profile/social/friends"
                        >
                            Friends
                        </a>
                        <a
                            class="nav-link custom-link ${this.activeTabClass("/profile/social/blacklist")}"
                            href="/profile/social/blacklist"
                        >
                            Blocked users
                        </a>
                    </li>
                    <div class="container-fluid friend-container"></div>
                </ul>
            </div>
        </div>`;
    }
}
