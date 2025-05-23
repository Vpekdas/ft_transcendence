import { Component } from "../../micro";
import { post, showToast, api } from "../../utils";
import { tr } from "../../i18n";

export default class Blacklist extends Component {
    async init() {
        this.blacklistHTML = "";
        this.info = await post("/api/blocked-users").then((res) => res.json());

        for (let i = 0; i < this.info.blocked_users.length; i++) {
            this.blacklistHTML += /* HTML */ `<div class="friend">
                <img src="${api("/api/player/" + this.info.blocked_users[i].id + "/picture")}" />
                <span class="friend-name" friend-id="${this.info.blocked_users[i].id}"
                    >${this.info.blocked_users[i].nickname}</span
                >
                ${this.createStatus(this.info.blocked_users[i].is_online)}
                <div class="btn btn-primary settings view-friend">
                    <i class="bi bi-binoculars-fill"></i>
                    ${tr("View Profile")}
                </div>
                <div class="btn btn-primary settings remove-friend">
                    <i class="bi bi-person-x-fill"></i>
                    ${tr("Remove blocked user")}
                </div>
            </div>`;
        }

        this.onready = async () => {
            const profiles = document.querySelectorAll(".friend");
            const [otherProfileNickname, setOtherProfileNickname] = this.usePersistent("otherProfileNickname", -1);

            profiles.forEach(async (profile) => {
                const id = profile.querySelector(".friend-name").getAttribute("friend-id");

                const viewBtn = profile.querySelector(".btn.btn-primary.settings.view-friend");
                viewBtn.addEventListener("click", async () => {
                    setOtherProfileNickname(id);
                });

                const removeBlockBtn = profile.querySelector(".btn.btn-primary.settings.remove-friend");
                removeBlockBtn.addEventListener("click", async () => {
                    const response = await post("/api/unblock-user/" + id)
                        .then((res) => res.json())
                        .catch((err) => {});

                    if (response.error) {
                        showToast(tr(response.error), "bi bi-exclamation-triangle-fill");
                    } else {
                        showToast(tr("User removed from blocked list successfully"), "bi bi-check-circle-fill");
                        setOtherProfileNickname(-1);
                    }
                });
            });
        };
    }

    activeTabClass(t) {
        if (window.location.pathname == t) return "active";
        return "";
    }

    createStatus(isOnline) {
        const color = isOnline ? "green" : "red";
        return /* HTML */ `
            <svg class="circle-status" xmlns="http://www.w3.org/2000/svg">
                <circle class="circle-color" r="10" cx="50%" cy="50%" fill="${color}" />
            </svg>
        `;
    }

    render() {
        return /* HTML */ `
            <div class="container-fluid dashboard-container">
                <ProfileNavBar />
                <div class="container-fluid social-container">
                    <ul class="nav navbar social">
                        <li class="nav-item icon-link social">
                            <a
                                class="nav-link custom-link ${this.activeTabClass("/profile/social/friends")}"
                                href="/profile/social/friends"
                            >
                                ${tr("Friends")}
                            </a>
                            <a
                                class="nav-link custom-link ${this.activeTabClass("/profile/social/blacklist")}"
                                href="/profile/social/blacklist"
                            >
                                ${tr("Blocked users")}
                            </a>
                        </li>
                        <div class="container-fluid friend-container">${this.blacklistHTML}</div>
                    </ul>
                </div>
            </div>
            <Chatbox />
        `;
    }
}
