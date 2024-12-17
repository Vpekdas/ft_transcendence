import { Component, globalComponents, html } from "../micro";
import { tr } from "../i18n";
import { fetchApi, post } from "../api";

export default class TournamentPrivacyCard extends Component {
    constructor() {
        super();
    }

    async render() {
        this.query("#btn-open").on("click", async () => {
            const password = document.querySelector(".container-fluid.settings.tournament-password");
            password.style.display = "none";
        });

        this.query("#btn-password").on("click", async () => {
            const password = document.querySelector(".container-fluid.settings.tournament-password");
            password.style.display = "flex";
        });

        this.query("#btn-invite-only").on("click", async () => {
            const password = document.querySelector(".container-fluid.settings.tournament-password");
            password.style.display = "none";
        });

        return html(
            /* HTML */ ` <div>
                <div class="card settings">
                    <h5 class="card-title settings">Tournament Privacy</h5>
                    <div class="btn-group tournament-privacy" role="group" aria-label="Basic radio toggle button group">
                        <input type="radio" class="btn-check" name="privacy" id="btn-open" autocomplete="off" checked />
                        <label class="btn btn-outline-primary" for="btn-open">open</label>

                        <input type="radio" class="btn-check" name="privacy" id="btn-password" autocomplete="off" />
                        <label class="btn btn-outline-primary" for="btn-password">password</label>

                        <input type="radio" class="btn-check" name="privacy" id="btn-invite-only" autocomplete="off" />
                        <label class="btn btn-outline-primary" for="btn-invite-only">invite only</label>
                    </div>
                    <div class="container-fluid settings tournament-password">
                        <div class="card settings">
                            <h5 class="card-title settings">Password</h5>
                            <div class="card-body settings">
                                <p class="card-text settings">You can update your password here.</p>
                                <input
                                    type="password"
                                    id="new-password-confirm"
                                    class="form-control settings"
                                    aria-describedby="passwordHelpBlock"
                                    placeholder="Tournament password"
                                    autocomplete="off"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>`
        );
    }
}
globalComponents.set("TournamentPrivacyCard", TournamentPrivacyCard);
