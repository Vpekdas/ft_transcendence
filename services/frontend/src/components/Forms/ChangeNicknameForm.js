import { tr } from "../../i18n";
import { fetchApi, post } from "../../utils";

/** @type {import("../../micro").Component} */
export default async function ChangeNicknameForm({ dom }) {
    const changeLanguage = tr("Change");

    const info = await post("/api/player/c/nickname").then((res) => res.json());

    dom.querySelector(".btn.btn-primary.change-nickname-button").on("click", async (el) => {
        const newNickname = el.querySelector("#new-nickname").value;

        const response = await fetchApi("/api/player/c/nickname/update", {
            method: "POST",
            body: JSON.stringify({
                nickname: newNickname,
            }),
        })
            .then((res) => res.json())
            .catch((err) => {
                // this.showToast(tr("An error occurred. Please try again."), "bi bi-exclamation-triangle-fill");
                // TODO: TOASTS
            });

        if (response.error) {
            // this.showToast(response.error, "bi bi-exclamation-triangle-fill");
        }
    });

    return /* HTML */ `<div class="container-fluid settings">
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
    </div>`;
}
