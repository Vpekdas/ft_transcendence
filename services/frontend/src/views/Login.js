import { fetchApi, getOrigin, showToast } from "../utils";
import { sanitizeInput } from "../validateInput";
import { tr } from "../i18n";
import { Component, navigateTo } from "../micro";

export default class Login extends Component {
    redirectAuth42() {
        const accessToken = localStorage.getItem("accessToken");

        if (accessToken == undefined) {
            const clientId = "u-s4t2ud-fd6496bf5631feb3051ccd4d5be873a3e47614223c9ebb635abaefda7d894f92";
            const redirectUrl = getOrigin() + "/callback";
            const url = `https://api.intra.42.fr/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUrl}&response_type=code`;
            window.location.href = url;
        } else {
            navigateTo("/callback");
        }
    }

    async init() {
        this.onready = () => {
            document.querySelector(".login-form").addEventListener("submit", async (event) => {
                const form = event.target;
                const data = new FormData(form);

                const username = data.get("username");
                const password = data.get("password");

                if (!sanitizeInput(username) || !sanitizeInput(password)) {
                    showToast(
                        "Invalid input detected. Please fill out all fields correctly.",
                        "bi bi-exclamation-triangle-fill"
                    );
                    return;
                }

                const response = await fetchApi("/api/login", {
                    method: "POST",
                    body: JSON.stringify({
                        username: username,
                        password: password,
                    }),
                })
                    .then((res) => res.json())
                    .catch((err) => {
                        showToast("An error occurred. Please try again.", "bi bi-exclamation-triangle-fill");
                    });
                if (response.error) {
                    showToast(response.error, "bi bi-exclamation-triangle-fill");
                } else if (response.need_2fa) {
                    localStorage.setItem("username", username);
                    navigateTo("2fa" + window.location.search);
                } else {
                    if (window.location.search.length == 0) {
                        navigateTo("/");
                    } else {
                        const redirect = decodeURIComponent(
                            window.location.search.substring(1).replace("redirect=", "")
                        );
                        navigateTo(redirect);
                    }
                }
            });

            document
                .querySelector(".create-account-redirect")
                .addEventListener("click", () => navigateTo("register" + window.location.search));
            document.querySelector(".create-with-42").addEventListener("click", () => this.redirectAuth42());
        };
    }

    render() {
        return /* HTML */ ` <div>
            <div class="container-fluid login-container">
                <form class="login-form was-validated" action="javascript:void(0)">
                    <img src="/img/login/Amadeus-Logo.webp" class="login-logo" />
                    <div class="row mb-3 login">
                        <label for="username" class="col-sm-2 col-form-label">${tr("Username")}</label>
                        <div class="col-sm-8 login">
                            <input
                                name="username"
                                autocomplete="off"
                                type="text"
                                class="form-control settings"
                                id="username"
                                required
                            />
                        </div>
                    </div>
                    <div class="row mb-3 login">
                        <label for="password" class="col-sm-2 col-form-label">${tr("Password")}</label>
                        <div class="col-sm-8 login">
                            <input
                                name="password"
                                autocomplete="off"
                                type="password"
                                class="form-control settings"
                                id="password"
                                required
                            />
                        </div>
                        <div class="col-sm-1 login">
                            <button type="submit" class="btn btn-primary">
                                <img src="/img/login/login-button.png" />
                            </button>
                        </div>
                    </div>
                    <a class="create-account-redirect" href="javascript:void(0)">${tr("Create an account")}</a>
                    <a class="create-with-42" href="javascript:void(0)">${tr("Login with 42")}</a>
                </form>
            </div>
        </div>`;
    }
}
