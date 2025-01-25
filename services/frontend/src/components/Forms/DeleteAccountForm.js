import { tr } from "../../i18n";
import { Component } from "../../micro";
import { post } from "../../utils";

/** @type {import("../../micro").Component} */
export default class DeleteAccountForm extends Component {
    async init() {
        this.onready = () => {
            document.querySelectorAll(".btn.btn-primary.settings.delete").forEach((e) =>
                e.addEventListener("click", async () => {
                    document.querySelector(".delete-modal-overlay").style.display = "flex";
                })
            );

            document.querySelector("#confirm-button").addEventListener("click", async () => {
                const response = await post("/api/player/c/delete", {
                    body: JSON.stringify({ access_token: localStorage.getItem("accessToken") }),
                })
                    .then((res) => res.json())
                    .catch((err) => {
                        error: "Bad input"; // TODO: Toast ?
                    });

                if (response["error"] == undefined) {
                    localStorage.removeItem("accessToken");
                }

                document.querySelector(".delete-modal-overlay").style.display = "none";
            });

            document.querySelector("#cancel-button").addEventListener("click", async () => {
                document.querySelector(".delete-modal-overlay").style.display = "none";
            });
        };
    }

    render() {
        return /* HTML */ ` <div>
            <div class="container-fluid settings">
                <div class="card settings">
                    <h5 class="card-title settings">${tr("Delete your account")}</h5>
                    <div class="card-body settings">
                        <p class="card-text settings">${tr("Permanently delete your account here.")}</p>
                        <button type="submit" class="btn btn-primary settings delete">
                            ${tr("Delete your account")}
                        </button>
                    </div>
                </div>
            </div>
            <div class="delete-modal-overlay">
                <div class="delete-modal-container">
                    <div class="delete-modal-header">
                        <h2>${tr("Confirm Action")}</h2>
                    </div>
                    <div class="delete-modal-body">
                        <p>${tr("Are you sure you want to delete your account?")}</p>
                    </div>
                    <div class="delete-modal-footer">
                        <button id="confirm-button" class="modal-button">${tr("Confirm")}</button>
                        <button id="cancel-button" class="modal-button">${tr("Cancel")}</button>
                    </div>
                </div>
            </div>
        </div>`;
    }
}
