import { navigateTo } from "../main";
import { Component, globalComponents, html } from "../micro";
import { router } from "../main";

export default class Registration extends Component {
    constructor() {
        super();
    }

    async render() {
        const [isLogged, setLogged] = this.useGlobalStore("isLogged", false);

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

            // setLogged(true);
            // navigateTo("/profile");
            router();
        });

        this.query(".login-redirect").on("click", () => navigateTo("login"));

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
                            <label for="username" class="col-sm-2 col-form-label">Nickname</label>
                            <div class="col-sm-10">
                                <input
                                    name="nickname"
                                    autocomplete="off"
                                    type="text"
                                    class="form-control"
                                    id="nickname"
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
                        <button type="submit" class="btn btn-primary">Register</button>
                        <a class="login-redirect" href="javascript:void(0)">Already have an account ?</a>
                    </form>
                </div>
            </div>`
        );
    }
}
globalComponents.set("Registration", Registration);
