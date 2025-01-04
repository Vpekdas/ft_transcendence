import { tr } from "../../i18n";
import { api, fetchApi, post } from "../../utils";

/** @type {import("../../micro").Component} */
export default async function ChangeProfilePictureForm({ dom }) {
    let fileName = tr("No files selected");
    const playerInfo = await post("/api/player/c/profile").then((res) => res.json());

    dom.querySelector("#inputGroupFile04").on("change", async (el) => {
        const target = document.getElementById("inputGroupFile04");

        fileName = target.files[0].name;
        document.getElementById("file-name").textContent = fileName;
    });

    dom.querySelector("#profilePictureUpload").on("click", async () => {
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

    return /* HTML */ ` <div class="container-fluid settings">
        <div class="card settings">
            <h5 class="card-title settings">${tr("Profile Picture")}</h5>
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
                    <span id="file-name" class="file-name">${fileName}</span>
                    <button class="btn btn-primary settings" type="button" id="profilePictureUpload">
                        ${tr("Upload")}
                    </button>
                </div>
            </div>
        </div>
    </div>`;
}
