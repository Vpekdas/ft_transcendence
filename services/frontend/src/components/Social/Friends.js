import { Component, dirty } from "../../micro";
import { post, showToast, api } from "../../utils";
import { tr } from "../../i18n";

export default class Friends extends Component {
    async init() {
        this.friendHTML = "";
        this.info = await post("/api/friends").then((res) => res.json());

        for (let i = 0; i < this.info.friends.length; i++) {
            this.friendHTML += /* HTML */ `<div class="friend">
                <img src="${api("/api/player/" + this.info.friends[i].id + "/picture")}" />
                <span class="friend-name" friend-id="${this.info.friends[i].id}">${this.info.friends[i].nickname}</span>
                ${this.createStatus(this.info.friends[i].is_online)}
                <div class="btn btn-primary settings view-friend">
                    <i class="bi bi-binoculars-fill"></i>
                    ${tr("View Profile")}
                </div>
                <div class="btn btn-primary settings remove-friend">
                    <i class="bi bi-person-x-fill"></i>
                    ${tr("Remove friend")}
                </div>
            </div>`;
        }

        this.onready = async () => {
            const profiles = document.querySelectorAll(".friend");
            const [otherProfileNickname, setOtherProfileNickname] = this.usePersistent("otherProfileNickname", "");

            profiles.forEach(async (profile) => {
                const id = profile.querySelector(".friend-name").getAttribute("friend-id");
                // const nickname = profile.querySelector(".friend-name").textContent;

                const viewBtn = profile.querySelector(".btn.btn-primary.settings.view-friend");
                viewBtn.addEventListener("click", async () => {
                    setOtherProfileNickname(id);
                });

                const removeFriendBtn = profile.querySelector(".btn.btn-primary.settings.remove-friend");
                removeFriendBtn.addEventListener("click", async () => {
                    const response = await post("/api/remove-friend/" + id)
                        .then((res) => res.json())
                        .catch((err) => {});

                    if (response.error) {
                        showToast(tr(response.error), "bi bi-exclamation-triangle-fill");
                    } else {
                        showToast(tr("User removed from friend list successfully."), "bi bi-check-circle-fill");
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
                        <div class="container-fluid friend-container">${this.friendHTML}</div>
                    </ul>
                </div>
            </div>
            <Chatbox />
        `;
    }
}
