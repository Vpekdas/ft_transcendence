import AbstractView from "./AbstractView";

export default class extends AbstractView {
    constructor() {
        super();
    }

    async getHtml() {
        return `
        <ul class="nav nav-underline">
            <li class="nav-item">
                <a class="nav-link" data-link href="/">Home</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" data-link href="/profile">Profile</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" data-link href="/settings">Settings</a>
            </li>
        </ul>`;
    }
}
