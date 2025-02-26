import { tr } from "../../i18n";
import { Component } from "../../micro";
import { post, fetchApi, showToast } from "../../utils";

export default class Activate2FAForm extends Component {
    async init() {
        this.twoFactorStatus = this.attributes.get("two-factor");
        this.isExternal = this.attributes.get("is-external") == "true";

        this.onready = () => {
            if (this.isExternal) {
                return;
            }

            const switch2FA = document.getElementById("switch two-factor");

            if (this.twoFactorStatus === true) {
                const checkSwitch = document.getElementById("switch two-factor");
                if (checkSwitch.getAttribute("state") === "true") {
                    checkSwitch.checked = "true";
                }
            }

            switch2FA.addEventListener("change", async () => {
                // Send a request to enable 2FA.
                this.updatedTwoFactor = await post("/api/player/c/get-2fa/true").then((res) => res.json());
                this.twoFactorStatus = this.updatedTwoFactor.state;

                if (this.twoFactorStatus === false && this.isExternal === false) {
                    const response = await post("/api/player/c/set-2fa/true", {})
                        .then((res) => res.json())
                        .catch((err) => {
                            showToast(tr("An error occurred. Please try again."), "bi bi-exclamation-triangle-fill");
                        });

                    if (response.error) {
                        showToast(response.error, "bi bi-exclamation-triangle-fill");
                    } else {
                        showToast("2FA has been successfully enabled", "bi bi-exclamation-triangle-fill");
                    }

                    // Send a request to disable 2FA.
                } else if (this.twoFactorStatus === true && this.isExternal === false) {
                    const response = await post("/api/player/c/set-2fa/false", {})
                        .then((res) => res.json())
                        .catch((err) => {
                            showToast(tr("An error occurred. Please try again."), "bi bi-exclamation-triangle-fill");
                        });

                    if (response.error) {
                        showToast(response.error, "bi bi-exclamation-triangle-fill");
                    } else {
                        showToast("2FA has been successfully disabled", "bi bi-exclamation-triangle-fill");
                    }
                }
            });
        };
    }

    render() {
        if (this.isExternal === true) {
            return "";
        }
        return /* HTML */ `
            <div class="container-fluid settings">
                <div class="card settings">
                    <h5 class="card-title settings" data-text="${tr("Activate 2FA Authentication")}">
                        ${tr("Activate 2FA Authentication")}
                    </h5>
                    <div class="card-body settings">
                        <p class="card-text settings">${tr("Activate 2FA Authentication for your account here.")}</p>
                        <div class="form-check form-switch two-factor">
                            <input
                                class="form-check-input two-factor"
                                type="checkbox"
                                role="switch"
                                id="switch two-factor"
                                state="${this.twoFactorStatus}"
                            />
                            <label class="form-check-label two-factor" for="switchTwo-factor">2FA</label>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}
