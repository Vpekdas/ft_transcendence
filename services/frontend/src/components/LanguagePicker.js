import { Component, globalComponents, html } from "../micro";
import { isLoggedIn } from "../api";
import { tr, setLanguage, getLanguage } from "../i18n";
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

        const actualLanguage = getLanguage();

        return html(
            /* HTML */ ` <div class="dropdown language-picker">
                <button
                    class="btn btn-secondary dropdown-toggle"
                    type="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                >
                    <img src="/img/${actualLanguage}.png" />
                    <span>${actualLanguage}</span>
                </button>
                <ul class="dropdown-menu language-picker">
                    <li>
                        <button type="button" lang="fr" class="btn btn-outline-info language-picker">
                            <img src="/img/fr.png" />
                            <span>FRANÇAIS</span>
                        </button>
                    </li>
                    <li>
                        <button type="button" lang="en" class="btn btn-outline-info language-picker">
                            <img src="/img/en.png" />
                            <span>ENGLISH</span>
                        </button>
                    </li>
                    <li>
                        <button type="button" lang="kr" class="btn btn-outline-info language-picker">
                            <img src="/img/kr.png" />
                            <span>한국어</span>
                        </button>
                    </li>
                    <li>
                        <button type="button" lang="jp" class="btn btn-outline-info language-picker">
                            <img src="/img/jp.png" />
                            <span>日本語</span>
                        </button>
                    </li>
                    <li>
                        <button type="button" lang="tr" class="btn btn-outline-info language-picker">
                            <img src="/img/tr.png" />
                            <span>TÜRKÇE</span>
                        </button>
                    </li>
                </ul>
            </div>`
        );
    }
}
globalComponents.set("LanguagePicker", LanguagePicker);
