import { Component, globalComponents, html } from "../micro";
import { tr } from "../i18n";
import { fetchApi, post } from "../api";

export default class DeleteAccountButton extends Component {
    constructor() {
        super();
    }

    async render() {
        const changeLanguage = tr("Delete your account");

        this.query(".btn.btn-primary.delete-account-button").on("click", async () => {
            document.querySelector(".delete-modal-overlay").style.display = "flex";
        });

        this.query("#confirm-button").on("click", async () => {
            const response = await post("/api/deleteProfile", {
                body: JSON.stringify({}),
            })
                .then((res) => res.json())
                .catch((err) => {
                    error: "Bad input";
                });

            document.querySelector(".delete-modal-overlay").style.display = "none";
        });

        return html(
            /* HTML */ ` <div>
                <button type="submit" class="btn btn-primary delete-account-button">${changeLanguage}</button>
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
            </div>`
        );
    }
}
globalComponents.set("DeleteAccountButton", DeleteAccountButton);
