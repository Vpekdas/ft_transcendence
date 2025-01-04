import { tr } from "../../i18n";

/** @type {import("../../micro").Component} */
export default async function TournamentPrivacyCard({ dom }) {
    dom.querySelector("#btn-open").on("click", async () => {
        const password = document.querySelector(".container-fluid.settings.tournament-password");
        password.style.display = "none";
    });

    dom.querySelector("#btn-password").on("click", async () => {
        const password = document.querySelector(".container-fluid.settings.tournament-password");
        password.style.display = "flex";
    });

    dom.querySelector("#btn-invite-only").on("click", async () => {
        const password = document.querySelector(".container-fluid.settings.tournament-password");
        password.style.display = "none";
    });

    return /* HTML */ ` <div>
        <div class="card settings">
            <h5 class="card-title settings">${tr("Tournament Privacy Settings")}</h5>
            <div class="btn-group tournament-privacy" role="group" aria-label="Basic radio toggle button group">
                <input type="radio" class="btn-check" name="privacy" id="btn-open" autocomplete="off" checked />
                <label class="btn btn-outline-primary" for="btn-open">${tr("Open")}</label>

                <input type="radio" class="btn-check" name="privacy" id="btn-password" autocomplete="off" />
                <label class="btn btn-outline-primary" for="btn-password">${tr("Password")}</label>

                <input type="radio" class="btn-check" name="privacy" id="btn-invite-only" autocomplete="off" />
                <label class="btn btn-outline-primary" for="btn-invite-only">${tr("Invite-Only Access")}</label>
            </div>
            <div class="container-fluid settings tournament-password">
                <div class="card settings">
                    <h5 class="card-title settings">${tr("Password")}</h5>
                    <div class="card-body settings">
                        <p class="card-text settings">${tr("Choose your tournament password here.")}</p>
                        <input
                            type="password"
                            id="tournament-password"
                            class="form-control settings"
                            aria-describedby="passwordHelpBlock"
                            placeholder="${tr("Tournament Password")}"
                            autocomplete="off"
                        />
                    </div>
                </div>
            </div>
        </div>
    </div>`;
}
