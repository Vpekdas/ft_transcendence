import { tr } from "../../i18n";
import { post } from "../../utils";

/** @type {import("../../micro").Component} */
export default async function DeleteAccountForm({ dom }) {
    const changeLanguage = tr("Delete your account");

    dom.querySelectorAll(".btn.btn-primary.settings.delete").on("click", async () => {
        document.querySelector(".delete-modal-overlay").style.display = "flex";
    });

    dom.querySelector("#confirm-button").on("click", async () => {
        const response = await post("/api/player/c/delete", {
            body: JSON.stringify({}),
        })
            .then((res) => res.json())
            .catch((err) => {
                error: "Bad input";
            });

        document.querySelector(".delete-modal-overlay").style.display = "none";
    });

    dom.querySelector("#cancel-button").on("click", async () => {
        document.querySelector(".delete-modal-overlay").style.display = "none";
    });

    return /* HTML */ ` <div>
        <div class="container-fluid settings">
            <div class="card settings">
                <h5 class="card-title settings">${tr("Delete your account")}</h5>
                <div class="card-body settings">
                    <p class="card-text settings">${tr("Permanently delete your account here.")}</p>
                    <button type="submit" class="btn btn-primary settings delete">${changeLanguage}</button>
                </div>
            </div>
        </div>
        <div class="delete-modal-overlay">
            <div class="delete-modal-container">
                <div class="delete-modal-header">
                    <h2>Confirm Action</h2>
                </div>
                <div class="delete-modal-body">
                    <p>Are you sure you want to delete your account?</p>
                </div>
                <div class="delete-modal-footer">
                    <button id="confirm-button" class="modal-button">Confirm</button>
                    <button id="cancel-button" class="modal-button">Cancel</button>
                </div>
            </div>
        </div>
    </div>`;
}
