import { Component, globalComponents, html } from "../micro";
import { tr } from "../i18n";
import { fetchApi, post } from "../api";

export default class ChangeNicknameForm extends Component {
    constructor() {
        super();
    }

    async render() {
        const changeLanguage = tr("Change");

        const info = await post("/api/getPlayerProfile").then((res) => res.json());

        this.query(".btn.btn-primary.change-nickname-button").on("click", async () => {
            const newNickname = document.getElementById("new-nickname").value;

            const response = await fetchApi("/api/updateNickname", {
                method: "POST",
                body: JSON.stringify({
                    nickname: newNickname,
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
            /* HTML */ `<div class="container-fluid change-nickname-form">
                <div id="toast-container"></div>
                <div class="card">
                    <h5 class="card-title">Nickname</h5>
                    <div class="card-body change-password">
                        <p class="card-text">You can update your nickname here.</p>
                        <input
                            type="text"
                            id="new-nickname"
                            class="form-control"
                            aria-describedby="passwordHelpBlock"
                            value="${info["nickname"]}"
                            autocomplete="off"
                            required
                        />
                        <button type="submit" class="btn btn-primary change-password-button">${changeLanguage}</button>
                    </div>
                </div>
            </div>`
        );
    }
}
globalComponents.set("ChangeNicknameForm", ChangeNicknameForm);
