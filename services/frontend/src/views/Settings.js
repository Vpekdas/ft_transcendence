import { Component, globalComponents, html } from "../micro";
import NavBar from "../components/NavBar";
import DonutChart from "../components/DonutChart";
import { fetchApi, isLoggedIn } from "../api";
import ChangePasswordForm from "../components/ChangePassword";
import ChangeNicknameForm from "../components/ChangeNickname";
import DeleteAccount from "../components/DeleteAccount";
import ChangeProfilePicture from "../components/ChangeProfilePicture";
import { navigateTo } from "../router";
import { tr } from "../i18n";

export default class Settings extends Component {
    constructor() {
        super();
    }

    async render() {
        if (!(await isLoggedIn())) {
            navigateTo("/login");
        }

        this.setTitle("Settings");

        const profilePictureLanguage = tr("Profile Picture");
        const uploadLanguage = tr("Upload");

        return html(
            /* HTML */
            ` <div>
                <NavBar />
                <div class="container-fluid dashboard-container">
                    <ProfileNavBar />
                    <ul class="list-group settings">
                        <ChangeProfilePicture />
                        <ChangePasswordForm />
                        <ChangeNicknameForm />
                        <DeleteAccount />
                    </ul>
                </div>
            </div>`
        );
    }
}
globalComponents.set("Settings", Settings);
