import { navigateTo } from "../router";
import { Component, globalComponents, html } from "../micro";

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
                    error: "Bad input";
                });

            console.log("registration response: ", response);
        });

        this.query(".login-redirect").on("click", () => navigateTo("login"));

        return html(
            /* HTML */
            ` <div>
                <div class="container-fluid login-container">
                    <form class="login-form" action="javascript:void(0)">
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
                                />
                            </div>
                        </div>
                        <div class="row mb-3 login">
                            <label for="nickname" class="col-sm-2 col-form-label">Nickname</label>
                            <div class="col-sm-8 login">
                                <input
                                    name="nickname"
                                    autocomplete="off"
                                    type="text"
                                    class="form-control"
                                    id="nickname"
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
                                />
                            </div>
                            <div class="col-sm-1 login">
                                <button type="submit" class="btn btn-primary">
                                    <img src="/img/login-button.png" />
                                </button>
                            </div>
                        </div>
                        <a class="login-redirect" href="javascript:void(0)">Already have an account ?</a>
                    </form>
                </div>
            </div>`
        );
    }
}
globalComponents.set("Registration", Registration);
