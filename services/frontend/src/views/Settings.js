import { Component, globalComponents, html } from "../micro";
import NavBar from "../components/NavBars/HomeNavBar";
import DonutChart from "../components/Charts/DonutChart";
import { fetchApi, isLoggedIn } from "../api";
import ChangePasswordForm from "../components/Forms/ChangePasswordForm";
import ChangeNicknameForm from "../components/Forms/ChangeNicknameForm";
import DeleteAccountForm from "../components/Forms/DeleteAccountForm";
import ChangeProfilePictureForm from "../components/Forms/ChangeProfilePictureForm";
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
                        <ChangeProfilePictureForm />
                        <ChangeNicknameForm />
                        <ChangePasswordForm />
                        <DeleteAccountForm />
                    </ul>
                </div>
            </div>`
        );
    }
}
globalComponents.set("Settings", Settings);
