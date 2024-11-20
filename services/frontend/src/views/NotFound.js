import { Component } from "../micro";
import NavBar from "./NavBar";

export default class extends Component {
    constructor() {
        super();
        // this.setTitle("Not Found");
    }

    async render() {
        const navBar = await new NavBar().render();

        return navBar;
    }
}
