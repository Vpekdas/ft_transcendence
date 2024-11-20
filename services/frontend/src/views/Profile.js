import { Component } from "../micro";
import NavBar from "./NavBar";
import Login from "./Login";

export default class extends Component {
    constructor() {
        super();
        this.login = new Login();
        // this.setTitle("Profile");
    }

    async render() {
        const navBar = await new NavBar().render();
        const login = await new Login().render();

        return navBar + login;
    }

    addEventListeners() {
        this.login.addEventListeners();
    }
}
