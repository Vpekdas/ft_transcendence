import { fetchApi } from "../api";
import { navigateTo } from "../main";
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

            if (response["error"] != undefined) {
                console.log("login response: ", response);
            } else {
                navigateTo("profile");
            }
        });

        this.query(".create-account-redirect").on("click", () => navigateTo("register"));

        return html(
            this.parent,
            /* HTML */
            ` <div>
                <NavBar />
                <div class="container-fluid">
                    <form class="login-form" action="javascript:void(0)">
                        <div class="row mb-3">
                            <label for="username" class="col-sm-2 col-form-label">Username</label>
                            <div class="col-sm-10">
                                <input
                                    name="username"
                                    autocomplete="off"
                                    type="text"
                                    class="form-control"
                                    id="username"
                                />
                            </div>
                        </div>
                        <div class="row mb-3">
                            <label for="password" class="col-sm-2 col-form-label">Password</label>
                            <div class="col-sm-10">
                                <input
                                    name="password"
                                    autocomplete="off"
                                    type="password"
                                    class="form-control"
                                    id="password"
                                />
                            </div>
                        </div>
                        <button type="submit" class="btn btn-primary">Login</button>
                        <a class="create-account-redirect" href="javascript:void(0)">Create an account</a>
                    </form>
                </div>
            </div>`
        );
    }

    // /api/signin
    //
    // username, nickname, password

    // /api/login
    //
    // username, password

    // /api/profile/info
    // /api/profile/stats
}
globalComponents.set("Login", Login);
