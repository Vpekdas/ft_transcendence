import { sanitizeInput } from "../validateInput";
import { tr } from "../i18n";
import { api, showToast } from "../utils";
import { Component, navigateTo } from "../micro";

/** @type {import("../micro").Component} */
export default class Registration extends Component {
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
                const nickname = data.get("nickname");
                const password = data.get("password");
                const email = data.get("email");

                if (nickname.length > 20) {
                    showToast(
                        tr("The nickname is too long. Please choose another one."),
                        "bi bi-exclamation-triangle-fill"
                    );
                    return;
                }

                if (!sanitizeInput(username) || !sanitizeInput(nickname)) {
                    showToast(
                        tr("Invalid input detected. Please fill out all fields correctly."),
                        "bi bi-exclamation-triangle-fill"
                    );
                    return;
                }

                const response = await fetch(api("/api/signin"), {
                    method: "POST",
                    body: JSON.stringify({
                        username: username,
                        nickname: nickname,
                        password: password,
                        email: email,
                    }),
                })
                    .then((res) => res.json())
                    .catch((err) => {
                        showToast(tr("An error occurred. Please try again."), "bi bi-exclamation-triangle-fill");
                    });
                if (response.error) {
                    showToast(tr(response.error), "bi bi-exclamation-triangle-fill");
                } else {
                    if (window.location.search.length == 0) {
                        navigateTo("/");
                    } else {
                        const redirect = window.location.search.substring(1).replace("redirect=", "");
                        if (redirect === undefined) {
                            navigateTo("/");
                        }
                        navigateTo(redirect);
                    }
                }
            });

            document
                .querySelector(".login-redirect")
                .addEventListener("click", () => navigateTo("login" + window.location.search));
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
                        <label for="nickname" class="col-sm-2 col-form-label">${tr("Nickname")}</label>
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
                    </div>
                    <div class="row mb-3 login">
                        <label for="email" class="col-sm-2 col-form-label">${tr("Email")}</label>
                        <div class="col-sm-8 login">
                            <input
                                name="email"
                                autocomplete="off"
                                type="email"
                                class="form-control settings"
                                id="email"
                                required
                            />
                        </div>
                        <div class="col-sm-1 login">
                            <button type="submit" class="btn btn-primary">
                                <img src="/img/login/login-button.png" />
                            </button>
                        </div>
                    </div>
                    <a class="login-redirect" href="javascript:void(0)">${tr("Already have an account ?")}</a>
                </form>
            </div>
        `;
    }
}
