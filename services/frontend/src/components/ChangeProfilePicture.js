import { Component, globalComponents, html } from "../micro";
import { tr } from "../i18n";
import { fetchApi, post } from "../api";

export default class ChangeProfilePicture extends Component {
    constructor() {
        super();
    }

    async render() {
        this.query("#profilePictureUpload").on("click", async () => {
            const target = document.getElementById("inputGroupFile04");
            const picture = target.files[0];

            const reader = new FileReader();

            reader.onload = async (e) => {
                const content = e.target.result;
                const response = await fetchApi("/api/updateProfilePicture", {
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
            /* HTML */ ` <div class="container-fluid change-profile-picture">
                <div class="card">
                    <h5 class="card-title">${profilePictureLanguage}</h5>
                    <img src="${this.api(`/api/getProfilePicture?nickname=test`)}" class="card-img-top profile" />
                    <div class="card-body">
                        <div class="input-group">
                            <input
                                type="file"
                                class="form-control"
                                id="inputGroupFile04"
                                aria-describedby="profilePictureUpload"
                                aria-label="Upload"
                            />
                            <button class="btn btn-outline-secondary" type="button" id="profilePictureUpload">
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
