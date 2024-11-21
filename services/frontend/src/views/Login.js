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

            const response = await fetch(this.api("/api/login"), {
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
        });

        return html(
            this.parent,
            /* HTML */
            `<div class="container-fluid">
                <form class="login-form" action="javascript:void(0)">
                    <div class="row mb-3">
                        <label for="username" class="col-sm-2 col-form-label">Username</label>
                        <div class="col-sm-10">
                            <input name="username" autocomplete="off" type="text" class="form-control" id="username" />
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
            </div>`
        ); // FIXME: Error when
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
