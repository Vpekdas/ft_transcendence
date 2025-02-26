import { tr } from "../i18n";
import { Component } from "../micro";
import { post } from "../utils";

export default class Settings extends Component {
    async init() {
        document.title = tr("Settings");

        this.info = await post("/api/player/c/profile").then((res) => res.json());
    }

    render() {
        return /* HTML */ `<div class="container-fluid dashboard-container">
            <ProfileNavBar />
            <ul class="list-group settings">
                <ChangeProfilePictureForm is-external="${this.info.external}" />
                <ChangeNicknameForm is-external="${this.info.external}" nickname="${this.info.nickname}" />
                <ChangePasswordForm is-external="${this.info.external}" />
                <Activate2FAForm is-external="${this.info.external}" two-factor="${this.info.two_factor}" />
            </ul>
        </div> `;
    }
}
