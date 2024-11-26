import { Component, globalComponents, html } from "../micro";
import NavBar from "../components/NavBar";
import ProfileDashboard from "./ProfileDashboard";
import Chart from "../components/Chart";
import { fetchApi } from "../api";
import ChangePasswordForm from "../components/ChangePassword";
import ChangeNicknameForm from "../components/changeNickname";

export default class Settings extends Component {
    constructor() {
        super();
    }

    async render() {
        this.setTitle("Settings");

        this.query("#profilePictureUpload").on("click", async (event) => {
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
                console.log("Update profile picture response:", response);
            };
            reader.readAsDataURL(picture);
        });

        return html(
            /* HTML */
            ` <div>
                <NavBar />
                <div class="container-fluid dashboard-container">
                    <ul class="nav flex-column nav-underline dashboard-tab">
                        <li class="nav-item">
                            <a class="nav-link" data-link href="/profile/match-history">Match History</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" data-link href="/profile/statistics">Statistics</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" data-link href="/profile/skins">Skins</a>
                        </li>

                        <li class="nav-item">
                            <a class="nav-link" data-link href="/profile/settings">Settings</a>
                        </li>
                    </ul>
                    <ul class="list-group settings">
                        <div class="card">
                            <img
                                src="${this.api(`/api/getProfilePicture?nickname=test`)}"
                                class="card-img-top profile"
                            />
                            <div class="card-body">
                                <h5 class="card-title">Profile Picture</h5>
                                <div class="input-group">
                                    <input
                                        type="file"
                                        class="form-control"
                                        id="inputGroupFile04"
                                        aria-describedby="profilePictureUpload"
                                        aria-label="Upload"
                                    />
                                    <button class="btn btn-outline-secondary" type="button" id="profilePictureUpload">
                                        Upload
                                    </button>
                                </div>
                            </div>
                        </div>
                        <ChangePasswordForm />
                        <ChangeNicknameForm />
                    </ul>
                </div>
            </div>`
        );
    }
}
globalComponents.set("Settings", Settings);
