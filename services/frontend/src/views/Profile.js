import AbstractView from "./AbstractView";
import NavBar from "./NavBar";
import Validation from "./Validation";

export default class extends AbstractView {
    constructor() {
        super();
        this.validation = new Validation();
        this.setTitle("Profile");
    }

    async getHtml() {
        const navBar = await new NavBar().getHtml();
        const validation = await this.validation.getHtml();

        return "<h1> Hello you are at Profile !</h1>" + navBar + validation;
    }

    addEventListeners() {
        this.validation.addEventListeners();
    }
}
