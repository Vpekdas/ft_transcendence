import AbstractView from "./AbstractView";
import NavBar from "./NavBar";

export default class extends AbstractView {
    constructor() {
        super();
        this.setTitle("Not Found");
    }

    async getHtml() {
        const navBar = await new NavBar().getHtml();

        return "<h1> Hello, It seems like you're lost !</h1>" + navBar;
    }
}
