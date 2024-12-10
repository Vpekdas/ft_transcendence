import { Component, globalComponents, html } from "../micro";
import { isLoggedIn } from "../api";
import { tr } from "../i18n";

export default class LanguagePicker extends Component {
    constructor() {
        super();
    }

    async render() {
        this.query(".btn.btn-outline-info").on("click", async (buttons) => {
            console.log(buttons);
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
                        <button type="button language-picker" class="btn btn-outline-info">
                            <img src="/img/french.png" />
                            <span>French</span>
                        </button>
                    </li>
                    <li>
                        <button type="button language-picker" class="btn btn-outline-info">
                            <img src="/img/english.png" />
                            <span>English</span>
                        </button>
                    </li>
                    <li>
                        <button type="button language-picker" class="btn btn-outline-info">
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
