import { Component, globalComponents, html } from "../micro";
import { tr } from "../i18n";
import { fetchApi } from "../api";

export default class ChangePasswordForm extends Component {
    constructor() {
        super();
    }

    async render() {
        const changeLanguage = tr("Change");

        this.query(".btn.btn-primary.ChangePassword").on("click", async (event) => {
            const oldPassword = document.getElementById("oldPassword").value;
            const newPassword = document.getElementById("newPassword").value;

            const response = await fetchApi("/api/updatePassword", {
                method: "POST",
                body: JSON.stringify({
                    oldPassword: oldPassword,
                    newPassword: newPassword,
                }),
            })
                .then((res) => res.json())
                .catch((err) => {
                    error: "Bad input";
                });

            console.log("changePassword response: ", response);
        });
        return html(
            /* HTML */ `<div class="container-fluid ChangePasswordForm">
                <input
                    type="password"
                    id="oldPassword"
                    class="form-control"
                    aria-describedby="passwordHelpBlock"
                    placeholder="${tr("New password")}"
                    autocomplete="off"
                />
                <input
                    type="password"
                    id="newPassword"
                    class="form-control"
                    aria-describedby="passwordHelpBlock"
                    placeholder="${tr("Old password")}"
                    autocomplete="off"
                />
                <button type="submit" class="btn btn-primary ChangePassword">${changeLanguage}</button>
            </div>`
        );
    }
}
globalComponents.set("ChangePasswordForm", ChangePasswordForm);
