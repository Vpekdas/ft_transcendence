import { Component, globalComponents, html } from "../micro";
import { isLoggedIn } from "../api";
import { tr, setLanguage } from "../i18n";
import { navigateTo } from "../router";

export default class LanguagePicker extends Component {
    constructor() {
        super();
    }

    async render() {
        this.query(".btn.btn-secondary.dropdown-toggle").on("click", async () => {
            const buttons = document.querySelectorAll(".btn.btn-outline-info.language-picker");
            buttons.forEach((button) => {
                button.addEventListener("click", async () => {
                    setLanguage(button.getAttribute("lang"));
                    navigateTo(window.location.pathname);
                });
            });
        });

        return html(
            /* HTML */ ` <div class="dropdown language-picker">
                <button
                    class="btn btn-secondary dropdown-toggle"
                    type="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                >
                    Languages
                </button>
                <ul class="dropdown-menu language-picker">
                    <li>
                        <button type="button" lang="fr" class="btn btn-outline-info language-picker">
                            <img src="/img/french.png" />
                            <span>French</span>
                        </button>
                    </li>
                    <li>
                        <button type="button" lang="en" class="btn btn-outline-info language-picker">
                            <img src="/img/english.png" />
                            <span>English</span>
                        </button>
                    </li>
                    <li>
                        <button type="button" lang="kr" class="btn btn-outline-info language-picker">
                            <img src="/img/korean.png" />
                            <span>Korean</span>
                        </button>
                    </li>
                </ul>
            </div>`
        );
    }
}
globalComponents.set("LanguagePicker", LanguagePicker);
