import { tr } from "../../i18n";
import { Component } from "../../micro";
import { api, fetchApi, post } from "../../utils";

/** @type {import("../../micro").Component} */
export default class ChangeProfilePictureForm extends Component {
    async init() {
        // TODO: fileName could be a local store

        this.fileName = tr("No files selected");
        this.playerInfo = await post("/api/player/c/profile").then((res) => res.json());

        this.onready = () => {
            document.querySelector("#inputGroupFile04").addEventListener("change", async () => {
                const target = document.getElementById("inputGroupFile04");

                document.getElementById("file-name").textContent = target.files[0].name;
            });

            document.querySelector("#profilePictureUpload").addEventListener("click", async () => {
                const target = document.getElementById("inputGroupFile04");
                const picture = target.files[0];

                const reader = new FileReader();

                reader.onload = async (e) => {
                    const content = e.target.result;

                    const response = await post("/api/player/c/picture/update", {
                        body: JSON.stringify({ type: picture.type, image: content }),
                    })
                        .then((res) => res.json())
                        .catch((err) => {
                            error: "Bad input";
                        });
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
                        />
                        <label for="inputGroupFile04" class="btn btn-primary settings">${tr("Browse")} </label>
                        <span id="file-name" class="file-name">${tr("No files selected")}</span>
                        <button class="btn btn-primary settings" type="button" id="profilePictureUpload">
                            ${tr("Upload")}
                        </button>
                    </div>
                </div>
            </div>
        </div>`;
    }
}
