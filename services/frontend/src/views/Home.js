import AbstractView from "./AbstractView";
import NavBar from "./NavBar";

export default class extends AbstractView {
    constructor() {
        super();
        this.setTitle("Home");
    }

    async getHtml() {
        const navBar = await new NavBar().getHtml();

        return "<h1> Hello you are at Home !</h1>" + navBar;
    }
}
