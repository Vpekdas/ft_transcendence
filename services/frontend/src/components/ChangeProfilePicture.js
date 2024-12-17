import { Component, globalComponents, html } from "../micro";
import { tr } from "../i18n";
import { fetchApi, post } from "../api";

export default class ChangeProfilePicture extends Component {
    constructor() {
        super();
    }

    async render() {
        let fileName = "No files selected";

        this.query("#inputGroupFile04").on("change", async () => {
            const target = document.getElementById("inputGroupFile04");

            fileName = target.files[0].name;
            document.getElementById("file-name").textContent = fileName;
        });

        this.query("#profilePictureUpload").on("click", async () => {
            const target = document.getElementById("inputGroupFile04");
            const picture = target.files[0];

            const reader = new FileReader();

            reader.onload = async (e) => {
                const content = e.target.result;
                const response = await fetchApi("/api/player/c/picture/update", {
                    method: "POST",
                    body: JSON.stringify({ type: picture.type, image: content }),
                })
                    .then((res) => res.json())
                    .catch((err) => {
                        error: "Bad input";
                    });
            };
            reader.readAsDataURL(picture);
        });

        const profilePictureLanguage = tr("Profile Picture");
        const uploadLanguage = tr("Upload");
        const browseLanguage = tr("Browse");

        return html(
            /* HTML */ ` <div class="container-fluid settings">
                <div class="card settings">
                    <h5 class="card-title settings">${profilePictureLanguage}</h5>
                    <img src="${this.api(`/api/player/c/picture`)}" class="card-img-top profile" />
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
                            <label for="inputGroupFile04" class="btn btn-primary settings">${browseLanguage} </label>
                            <span id="file-name" class="file-name">${fileName}</span>
                            <button class="btn btn-primary settings" type="button" id="profilePictureUpload">
                                ${uploadLanguage}
                            </button>
                        </div>
                    </div>
                </div>
            </div>`
        );
    }
}
globalComponents.set("ChangeProfilePicture", ChangeProfilePicture);
