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

    createGlitchRectangle(particleNumber) {
        const container = document.querySelector(".particle-container");

        for (let i = 0; i < particleNumber; i++) {
            const particle = document.createElement("div");

            particle.classList.add("glitch-rectangle");

            particle.style.setProperty("--startY", `${Math.random() * 100}vh`);
            particle.style.setProperty("--startX", `${Math.random() * 100}vw`);
            particle.style.setProperty("--endY", `${Math.random() * 100}vh`);
            particle.style.setProperty("--endX", `${Math.random() * 100}vw`);

            container.appendChild(particle);
        }
    }

    async init() {
        this.onready = () => {
            this.createGlitchRectangle(42);

            document.querySelector(".login-form").addEventListener("submit", async (event) => {
                const form = event.target;
                const data = new FormData(form);

                const username = data.get("username");
                const password = data.get("password");

                if (!sanitizeInput(username)) {
                    showToast(
                        tr("Invalid input detected. Please fill out all fields correctly."),
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
                        showToast(tr("An error occurred. Please try again."), "bi bi-exclamation-triangle-fill");
                    });
                if (response.error) {
                    showToast(tr(response.error), "bi bi-exclamation-triangle-fill");
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
                .getElementById("create-account-redirect")
                .addEventListener("click", () => navigateTo("register" + window.location.search));
            document.getElementById("sign42").addEventListener("click", () => this.redirectAuth42());
        };
    }

    render() {
        return /* HTML */ `
            <div class="particle-container"></div>
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
                    <div class="container-fluid login-register-container">
                        <a class="create-account" id="create-account-redirect" href="javascript:void(0)">
                            <i class="bi bi-person-plus"></i>
                            <span>${tr("Create an account")}</span></a
                        >
                        <a class="sign-forty-two" id="sign42" href="javascript:void(0)">
                            <span>${tr("Sign in with")}</span>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 57 40" height="18" class="42-logo">
                                <path
                                    d="M31.627.205H21.084L0 21.097v8.457h21.084V40h10.543V21.097H10.542L31.627.205M35.349 10.233 45.58 0H35.35v10.233M56.744 10.542V0H46.512v10.542L36.279 21.085v10.543h10.233V21.085l10.232-10.543M56.744 21.395 46.512 31.628h10.232V21.395"
                                ></path>
                            </svg>
                        </a>
                    </div>
                </form>
            </div>
        `;
    }
}
