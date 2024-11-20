import AbstractView from "./AbstractView";
import NavBar from "./NavBar";
import Login from "./Login";

export default class extends AbstractView {
    constructor() {
        super();
        this.login = new Login();
        this.setTitle("Profile");
    }

    async getHtml() {
        const navBar = await new NavBar().getHtml();
        const login = await new Login().getHtml();

        return navBar + login;
    }

    addEventListeners() {
        this.login.addEventListeners();
    }
}
