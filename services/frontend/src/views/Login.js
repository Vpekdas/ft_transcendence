import { fetchApi, getOrigin, showToast } from "../utils";
import { sanitizeInput } from "../validateInput";
import { tr } from "../i18n";
import { navigateTo } from "../micro";

/** @type {import("../micro").Component} */
export default async function Login({ dom }) {
    dom.querySelector(".login-form").on("submit", async (event) => {
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
        } else {
            if (window.location.search.length == 0) {
                navigateTo("/");
            } else {
                const redirect = window.location.search.substring(1).replace("redirect=", "");
                navigateTo(redirect);
            }
        }
    });

    function redirectAuth42() {
        const clientId = "u-s4t2ud-113d89636c434e478745914966fff13deb2d93ec00210a1f8033f12f8e0d06b2";
        const redirectUrl = encodeURIComponent("https://example.com");
        const url = `https://api.intra.42.fr/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUrl}&response_type=code`;

        let proxy = window.open(url, "Auth with 42", "height=700,width=600");

        let timeout = setTimeout(() => {
            if (proxy) {
                clearTimeout(timeout);
            }

            console.log("HEllo world!", proxy.location.href);

            if (proxy.location.host == "example.com") {
                proxy.close();
                window.location.href = getOrigin() + ":8080/login-external" + proxy.location.search;
                proxy = null;
            }
        }, 500);
    }

    dom.querySelector(".create-account-redirect").on("click", () => navigateTo("register" + window.location.search));
    dom.querySelector(".create-with-42").on("click", () => redirectAuth42());

    return /* HTML */ ` <div>
        <div class="container-fluid login-container">
            <div id="toast-container"></div>
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
