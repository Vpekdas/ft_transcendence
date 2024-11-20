import { Component } from "../micro";

export default class extends Component {
    constructor() {
        super();
    }

    async render() {
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
            <li class="nav-item">
                <a class="nav-link" data-link href="/counter">Counter</a>
            </li>
        </ul>`;
    }
}
