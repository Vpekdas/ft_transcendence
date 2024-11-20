import { Component } from "../micro";
import NavBar from "./NavBar";

export default class extends Component {
    constructor() {
        super();
        this.navBar = new NavBar();
    }

    async render() {
        this.setTitle("Home");

        return "<h1> Hello you are at Home !</h1>" + (await this.navBar.render());
    }
}
