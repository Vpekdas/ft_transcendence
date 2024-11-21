import { Component, globalComponents, html } from "../micro";
import NavBar from "./NavBar";

export default class NotFound extends Component {
    constructor() {
        super();
    }

    async render() {
        this.setTitle("Not Found");
        return html(this.parent, /*html*/ `<NavBar />`);
    }
}
globalComponents.set("NotFound", NotFound);
