import { navigateTo } from "../router";
import { Component, globalComponents, html } from "../micro";
import { sanitizeInput } from "../validateInput";
import { tr } from "../i18n";
export default class Registration extends Component {
    constructor() {
        super();
    }

    async render() {
        this.query(".login-form").on("submit", async (event) => {
            const form = event.target;
            const data = new FormData(form);

            const username = data.get("username");
            const nickname = data.get("nickname");
            const password = data.get("password");

            if (!sanitizeInput(username) || !sanitizeInput(nickname) || !sanitizeInput(password)) {
                this.showToast(
                    "Invalid input detected. Please fill out all fields correctly.",
                    "bi bi-exclamation-triangle-fill"
                );
                return;
            }

            const response = await fetch(this.api("/api/signin"), {
                method: "POST",
                body: JSON.stringify({
                    username: username,
                    nickname: nickname,
                    password: password,
                }),
            })
                .then((res) => res.json())
                .catch((err) => {
                    this.showToast("An error occurred. Please try again.", "bi bi-exclamation-triangle-fill");
                });
            if (response.error) {
                this.showToast(response.error, "bi bi-exclamation-triangle-fill");
            } else {
                navigateTo("/");
            }
        });

        this.query(".login-redirect").on("click", () => navigateTo("login"));

        const usernameLanguage = tr("Username");
        const nicknameLanguage = tr("Nickname");
        const passwordLanguage = tr("Password");
        const alreadyAccountLanguage = tr("Already have an account ?");

        return html(
            /* HTML */
            ` <div>
                <div class="container-fluid login-container">
                    <div id="toast-container"></div>
                    <form class="login-form was-validated" action="javascript:void(0)">
                        <img src="/img/Amadeus-Logo.webp" class="login-logo" />
                        <div class="row mb-3 login">
                            <label for="username" class="col-sm-2 col-form-label">${usernameLanguage}</label>
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
                            <label for="nickname" class="col-sm-2 col-form-label">${nicknameLanguage}</label>
                            <div class="col-sm-8 login">
                                <input
                                    name="nickname"
                                    autocomplete="off"
                                    type="text"
                                    class="form-control settings"
                                    id="nickname"
                                    required
                                />
                            </div>
                        </div>
                        <div class="row mb-3 login">
                            <label for="password" class="col-sm-2 col-form-label">${passwordLanguage}</label>
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
                                    <img src="/img/login-button.png" />
                                </button>
                            </div>
                        </div>
                        <a class="login-redirect" href="javascript:void(0)">${alreadyAccountLanguage}</a>
                    </form>
                </div>
            </div>`
        );
    }
}
globalComponents.set("Registration", Registration);
