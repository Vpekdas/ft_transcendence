import { Component, globalComponents, html } from "../micro";
import { tr } from "../i18n";
import { fetchApi } from "../api";

export default class ChangePasswordForm extends Component {
    constructor() {
        super();
    }

    async render() {
        const changeLanguage = tr("Change");

        this.query(".btn.btn-primary.change-password-button").on("click", async () => {
            const oldPassword = document.getElementById("old-password").value;
            const newPassword = document.getElementById("new-password").value;
            const newPasswordConfirm = document.getElementById("new-password-confirm").value;

            if (newPassword != newPasswordConfirm) {
                this.showToast("Old password and new password are not the same", "bi bi-exclamation-triangle-fill");
                return;
            }

            const response = await fetchApi("/api/updatePassword", {
                method: "POST",
                body: JSON.stringify({
                    oldPassword: oldPassword,
                    newPassword: newPassword,
                }),
            })
                .then((res) => res.json())
                .catch((err) => {
                    this.showToast("An error occurred. Please try again.", "bi bi-exclamation-triangle-fill");
                });

            if (response.error) {
                this.showToast(response.error, "bi bi-exclamation-triangle-fill");
            }
        });
        return html(
            /* HTML */ `<div class="container-fluid change-password">
                <div id="toast-container"></div>
                <div class="card password">
                    <h5 class="card-title">Password</h5>
                    <div class="card-body change-password">
                        <p class="card-text">You can update your password here.</p>
                        <input
                            type="password"
                            id="old-password"
                            class="form-control"
                            aria-describedby="passwordHelpBlock"
                            placeholder="${tr("Old password")}"
                            autocomplete="off"
                        />
                        <input
                            type="password"
                            id="new-password"
                            class="form-control"
                            aria-describedby="passwordHelpBlock"
                            placeholder="${tr("New password")}"
                            autocomplete="off"
                        />
                        <input
                            type="password"
                            id="new-password-confirm"
                            class="form-control"
                            aria-describedby="passwordHelpBlock"
                            placeholder="${tr("Confirm new password")}"
                            autocomplete="off"
                        />
                        <button type="submit" class="btn btn-primary change-password-button">${changeLanguage}</button>
                    </div>
                </div>
            </div>`
        );
    }
}
globalComponents.set("ChangePasswordForm", ChangePasswordForm);
