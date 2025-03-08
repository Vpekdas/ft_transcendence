import { tr } from "../../i18n";
import { fetchApi, showToast } from "../../utils";
import { Component } from "../../micro";

export default class ChangeNicknameForm extends Component {
    async init() {
        this.isExternal = this.attributes.get("is-external") == "true";
        this.nickname = this.attributes.get("nickname");

        this.onready = () => {
            document
                .querySelector(".btn.btn-primary.change-nickname-button")
                .addEventListener("click", async (event) => {
                    const newNickname = document.getElementById("new-nickname").value;

                    if (newNickname.length > 20) {
                        showToast(
                            tr("The nickname is too long. Please choose another one."),
                            "bi bi-exclamation-triangle-fill"
                        );
                        return;
                    }

                    const response = await fetchApi("/api/player/c/nickname/update", {
                        method: "POST",
                        body: JSON.stringify({
                            nickname: newNickname,
                        }),
                    })
                        .then((res) => res.json())
                        .catch((err) => {
                            showToast(tr("An error occurred. Please try again."), "bi bi-exclamation-triangle-fill");
                        });

                    if (response.error) {
                        showToast(tr(response.error), "bi bi-exclamation-triangle-fill");
                    } else {
                        showToast(tr("Nickname updated successfully."), "bi bi-check-circle-fill");
                    }
                });
        };
    }

    render() {
        return /* HTML */ `<div class="container-fluid settings">
            <div class="card settings">
                <h5 class="card-title settings" data-text="${tr("Nickname")}">${tr("Nickname")}</h5>
                <div class="card-body settings">
                    <p class="card-text settings">${tr("Update your nickname in the form below.")}</p>
                    <input
                        type="text"
                        id="new-nickname"
                        class="form-control settings"
                        aria-describedby="passwordHelpBlock"
                        value="${this.nickname}"
                        autocomplete="off"
                        required
                    />
                    <button
                        type="submit"
                        class="btn btn-primary settings change-nickname-button"
                        ${this.isExternal ? "disabled" : ""}
                    >
                        ${tr("Change")}
                    </button>
                </div>
            </div>
        </div>`;
    }
}
