import { tr } from "../../i18n";
import { fetchApi, showToast } from "../../utils";
import { Component } from "../../micro";

export default class ChangePasswordForm extends Component {
    async init() {
        this.onready = () => {
            document.querySelector(".btn.btn-primary.settings").addEventListener("click", async () => {
                const oldPassword = document.querySelector("#old-password").value;
                const newPassword = document.querySelector("#new-password").value;
                const newPasswordConfirm = document.querySelector("#new-password-confirm").value;

                if (newPassword !== newPasswordConfirm) {
                    showToast(tr("Old password and new password are not the same."), "bi bi-exclamation-triangle-fill");
                    return;
                }

                const response = await fetchApi("/api/player/c/password/update", {
                    method: "POST",
                    body: JSON.stringify({
                        oldPassword: oldPassword,
                        newPassword: newPassword,
                    }),
                })
                    .then((res) => res.json())
                    .catch((err) => {
                        showToast(tr("An error occurred. Please try again."), "bi bi-exclamation-triangle-fill");
                    });

                if (response.error) {
                    showToast(response.error, "bi bi-exclamation-triangle-fill");
                }
            });
        };
    }
    render() {
        return /* HTML */ `<div class="container-fluid settings">
            <div id="toast-container"></div>
            <div class="card settings">
                <h5 class="card-title settings" data-text="${tr("Password")}">${tr("Password")}</h5>
                <div class="card-body settings">
                    <p class="card-text settings">${tr("Update your password in the form below.")}</p>
                    <input
                        type="password"
                        id="old-password"
                        class="form-control settings"
                        aria-describedby="passwordHelpBlock"
                        placeholder="${tr("Old password")}"
                        autocomplete="off"
                    />
                    <input
                        type="password"
                        id="new-password"
                        class="form-control settings"
                        aria-describedby="passwordHelpBlock"
                        placeholder="${tr("New password")}"
                        autocomplete="off"
                    />
                    <input
                        type="password"
                        id="new-password-confirm"
                        class="form-control settings"
                        aria-describedby="passwordHelpBlock"
                        placeholder="${tr("Confirm new password")}"
                        autocomplete="off"
                    />
                    <button type="submit" class="btn btn-primary settings">${tr("Change")}</button>
                </div>
            </div>
        </div>`;
    }
}
