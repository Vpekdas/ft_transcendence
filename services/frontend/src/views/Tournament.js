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

export default class Tournament extends Component {
    constructor() {
        super();
    }

    async render() {
        this.setTitle("Tournament");

        const id = this.attrib("id");

        return html(
            /* HTML */
            ` <div>
                <NavBar />
            </div>`
        );
    }
}
globalComponents.set("Tournament", Tournament);
