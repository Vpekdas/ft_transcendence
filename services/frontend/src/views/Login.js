import { fetchApi } from "../api";
import { navigateTo } from "../router";
import { Component, globalComponents, html } from "../micro";

export default class Login extends Component {
    constructor() {
        super();
    }

    async render() {
        this.query(".login-form").on("submit", async (event) => {
            const form = event.target;
            const data = new FormData(form);

            const username = data.get("username");
            const password = data.get("password");

            const response = await fetchApi("/api/login", {
                method: "POST",
                body: JSON.stringify({
                    username: username,
                    password: password,
                }),
            })
                .then((res) => res.json())
                .catch((err) => {
                    error: "Bad input";
                });

            console.log("login response: ", response);

            if (response["error"] == undefined) {
                navigateTo("profile/match-history");
            }
        });

        this.query(".create-account-redirect").on("click", () => navigateTo("register"));

        return html(
            /* HTML */
            ` <div>
                <div class="container-fluid login-container" novalidate>
                    <form class="login-form was-validated" action="javascript:void(0)">
                        <img src="/img/Amadeus-Logo.webp" class="login-logo" />
                        <div class="row mb-3 login">
                            <label for="username" class="col-sm-2 col-form-label">Username</label>
                            <div class="col-sm-8 login">
                                <input
                                    name="username"
                                    autocomplete="off"
                                    type="text"
                                    class="form-control"
                                    id="username"
                                    required
                                />
                            </div>
                        </div>
                        <div class="row mb-3 login">
                            <label for="password" class="col-sm-2 col-form-label">Password</label>
                            <div class="col-sm-8 login">
                                <input
                                    name="password"
                                    autocomplete="off"
                                    type="password"
                                    class="form-control"
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
                        <a class="create-account-redirect" href="javascript:void(0)">Create an account</a>
                    </form>
                </div>
            </div>`
        );
    }
}
globalComponents.set("Login", Login);
