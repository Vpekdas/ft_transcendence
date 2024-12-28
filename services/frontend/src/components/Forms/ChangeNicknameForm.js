import { Component, html } from "../../micro";
import { tr } from "../../i18n";
import { fetchApi, post } from "../../api";

export default class ChangeNicknameForm extends Component {
    constructor() {
        super();
    }

    async render() {
        const changeLanguage = tr("Change");

        const info = await post("/api/player/c/nickname").then((res) => res.json());

        this.query(".btn.btn-primary.change-nickname-button").on("click", async () => {
            const newNickname = document.getElementById("new-nickname").value;

            const response = await fetchApi("/api/player/c/nickname/update", {
                method: "POST",
                body: JSON.stringify({
                    nickname: newNickname,
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
                    <h5 class="card-title settings">${tr("Nickname")}</h5>
                    <div class="card-body settings">
                        <p class="card-text settings">${tr("Update your nickname in the form below.")}</p>
                        <input
                            type="text"
                            id="new-nickname"
                            class="form-control settings"
                            aria-describedby="passwordHelpBlock"
                            value="${info["nickname"]}"
                            autocomplete="off"
                            required
                        />
                        <button type="submit" class="btn btn-primary settings">${changeLanguage}</button>
                    </div>
                </div>
            </div>`
        );
    }
}
