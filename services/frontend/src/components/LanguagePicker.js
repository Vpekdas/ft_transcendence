import { tr, setLanguage, getLanguage } from "../i18n";
import { Component, dirty, navigateTo } from "../micro";

export default class LanguagePicker extends Component {
    async init() {
        this.onready = () => {
            const buttons = document.querySelectorAll(".btn.btn-outline-info.language-picker");

            buttons.forEach((button) => {
                button.addEventListener("click", async () => {
                    setLanguage(button.getAttribute("lang"));
                    navigateTo(window.location.pathname, true);
                });
            });
        };
    }
    render() {
        const actualLanguage = getLanguage();

        return /* HTML */ `
            <div class="dropdown language-picker">
                <button
                    class="btn btn-secondary dropdown-toggle settings"
                    type="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                >
                    <img src="/img/lang/${actualLanguage}.png" />
                    <span>${actualLanguage}</span>
                </button>
                <ul class="dropdown-menu language-picker">
                    <li>
                        <button type="button" lang="fr" class="btn btn-outline-info language-picker">
                            <img src="/img/lang/fr.png" />
                            <span>FRANÇAIS</span>
                        </button>
                    </li>
                    <li>
                        <button type="button" lang="en" class="btn btn-outline-info language-picker">
                            <img src="/img/lang/en.png" />
                            <span>ENGLISH</span>
                        </button>
                    </li>
                    <li>
                        <button type="button" lang="tr" class="btn btn-outline-info language-picker">
                            <img src="/img/lang/tr.png" />
                            <span>TÜRKÇE</span>
                        </button>
                    </li>
                </ul>
            </div>
        `;
    }
}
