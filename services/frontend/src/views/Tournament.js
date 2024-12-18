import { Component, globalComponents, html } from "../micro";
import NavBar from "../components/NavBars/HomeNavBar";
import DonutChart from "../components/Charts/DonutChart";
import { fetchApi, isLoggedIn, getOriginNoProtocol } from "../api";
import ChangePasswordForm from "../components/Forms/ChangePasswordForm";
import ChangeNicknameForm from "../components/Forms/ChangeNicknameForm";
import DeleteAccountForm from "../components/Forms/DeleteAccountForm";
import ChangeProfilePictureForm from "../components/Forms/ChangeProfilePictureForm";
import { navigateTo } from "../router";
import { tr } from "../i18n";

export default class Tournament extends Component {
    constructor() {
        super();
    }

    async render() {
        this.setTitle("Tournament");

        const id = this.attrib("id");
        // const ws = new WebSocket(`ws://${getOriginNoProtocol()}:8000/tournament/${id}`);
        // ws.onopen = () => {};
        // ws.onmessage = () => {};

        return html(
            /* HTML */
            ` <div>
                <NavBar />
            </div>`
        );
    }
}
globalComponents.set("Tournament", Tournament);
