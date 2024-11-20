import { Component } from "../micro";
import NavBar from "./NavBar";

export default class extends Component {
    constructor() {
        super();
    }

    async render() {
        this.setTitle("Settings");
        const navBar = await new NavBar().render();

        return navBar;
    }
}
