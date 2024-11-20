import AbstractView from "./AbstractView";

export default class Validation extends AbstractView {
    constructor() {
        super();
    }

    async getHtml() {
        return `
<div class="center-form">
    <form class="login-form row g-3" action="javascript:void(0)">
        <div class="col-md-4">
            <label for="validationServer01" class="form-label">Username</label>
            <input name="username" type="text" class="form-control is-valid" id="validationServer01" value="Mark" required />
            <div class="valid-feedback">Looks good!</div>
        </div>
        <div class="col-12">
            <div class="col-md-4">
                <label for="inputPassword5" class="form-label">Password</label>
                <input name="password" type="password" id="inputPassword5" class="form-control" aria-describedby="passwordHelpBlock" />
                <div id="passwordHelpBlock" class="form-text">
                    Your password must be 8-20 characters long, contain letters and numbers, and must not contain spaces,
                    special characters, or emoji.
                </div>
            </div>
        </div>
        <div class="col-12">
            <input type="submit" class="btn btn-primary" value="Submit form" />
        </div>
    </form>
</div>
        `;
    }

    addEventListeners() {
        this.submitForm();
    }

    submitForm() {
        /** @type HTMLFormElement */
        const form = document.querySelector(".login-form");
        form.addEventListener("submit", async (event) => {
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

            console.log(response);
        });
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
