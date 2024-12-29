import { Component, html } from "../../micro";
import { tr } from "../../i18n";
import { fetchApi } from "../../utils";

export default class ChangePasswordForm extends Component {
    constructor() {
        super();
    }

    async render() {
        this.query(".btn.btn-primary.settings").on("click", async () => {
            const oldPassword = document.getElementById("old-password").value;
            const newPassword = document.getElementById("new-password").value;
            const newPasswordConfirm = document.getElementById("new-password-confirm").value;

            if (newPassword != newPasswordConfirm) {
                this.showToast(
                    tr("Old password and new password are not the same."),
                    "bi bi-exclamation-triangle-fill"
                );
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
                    this.showToast(tr("An error occurred. Please try again."), "bi bi-exclamation-triangle-fill");
                });

            if (response.error) {
                this.showToast(response.error, "bi bi-exclamation-triangle-fill");
            }
        });
        return html(
            /* HTML */ `<div class="container-fluid settings">
                <div id="toast-container"></div>
                <div class="card settings">
                    <h5 class="card-title settings">${tr("Password")}</h5>
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
            </div>`
        );
    }
}
