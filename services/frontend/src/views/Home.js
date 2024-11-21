import { Component, globalComponents, html } from "../micro";
import Chart from "./Chart";

export default class Home extends Component {
    constructor() {
        super();
    }

    async render() {
        this.setTitle("Home");
        return html(this.parent, /*html*/ `<div><NavBar /><h1> Hello you are at Home !</h1><Chart /></div>`);
    }
}
globalComponents.set("Home", Home);
