import { Component, globalComponents, html } from "../micro";
import NavBar from "./NavBar";

export default class Home extends Component {
    constructor() {
        super();
    }

    async render() {
        this.setTitle("Home");
        return html(this.parent, /*html*/ `<div><NavBar /><h1> Hello you are at Home !</h1></div>`);
    }
}
globalComponents.set("Home", Home);
