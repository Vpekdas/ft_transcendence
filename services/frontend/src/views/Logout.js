import { post } from "../api";
import { Component, globalComponents, html } from "../micro";
import { navigateTo } from "../router";

export default class Logout extends Component {
    constructor() {
        super();
    }

    async render() {
        await post("/api/logout", {});
        navigateTo("login");
        return html(this.parent, /* HTML */ `<div></div>`);
    }
}
globalComponents.set("Logout", Logout);
