import { tr } from "../../i18n";
import { Component } from "../../micro";
import { api, post, showToast } from "../../utils";

/** @type {import("../../micro").Component} */
export default class ChangeProfilePictureForm extends Component {
    async init() {
        this.isExternal = this.attributes.get("is-external") == "true";

        this.onready = async () => {
            document.querySelector("#inputGroupFile04").addEventListener("change", async () => {
                const target = document.getElementById("inputGroupFile04");

                document.getElementById("file-name").textContent = target.files[0].name;
            });

            document.getElementById("profilePictureUpload").addEventListener("click", async () => {
                const target = document.getElementById("inputGroupFile04");
                const picture = target.files[0];

                const reader = new FileReader();

                reader.onload = async (e) => {
                    const content = e.target.result;

                    const response = await post("/api/player/c/picture/update", {
                        body: JSON.stringify({ type: picture.type, image: content }),
                    })
                        .then((res) => res.json())
                        .catch((err) => {});
                    if (response.error) {
                        showToast(tr(response.error), "bi bi-exclamation-triangle-fill");
                    } else {
                        showToast(tr("Profile picture updated successfully."), "bi bi-check-circle-fill");
                    }
                };

                reader.readAsDataURL(picture);
            });
        };
    }

    render() {
        return /* HTML */ ` <div class="container-fluid settings">
            <div class="card settings">
                <h5 class="card-title settings" data-text="${tr("Profile Picture")}">${tr("Profile Picture")}</h5>
                <img src="${api("/api/player/c/picture")}" class="card-img-top profile" id="profile-picture" />
                <div class="card-body settings">
                    <div class="input-group settings">
                        <input
                            type="file"
                            class="form-control settings"
                            id="inputGroupFile04"
                            aria-describedby="profilePictureUpload"
                            aria-label="Upload"
                            style="display: none;"
                            ${this.isExternal ? "disabled" : ""}
                        />
                        <label for="inputGroupFile04" class="btn btn-primary settings">${tr("Browse")} </label>
                        <span id="file-name" class="file-name">${tr("No files selected")}</span>
                        <button
                            class="btn btn-primary settings"
                            type="button"
                            id="profilePictureUpload"
                            ${this.isExternal ? "disabled" : ""}
                        >
                            ${tr("Upload")}
                        </button>
                    </div>
                </div>
            </div>
        </div>`;
    }
}
