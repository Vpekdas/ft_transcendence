import { Component, globalComponents, html } from "../micro";

export default class NavBar extends Component {
    constructor() {
        super();
    }

    async render() {
        return html(
            /* HTML */ ` <ul class="nav nav-underline">
                <li class="nav-item icon-link">
                    <a class="icon-link" data-link href="/">
                        <img src="/favicon.svg" class="img-fluid" width="21" height="21" />
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" data-link href="/profile">Profile</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" data-link href="/counter">Counter</a>
                </li>
            </ul>`
        );
    }
}
globalComponents.set("NavBar", NavBar);
