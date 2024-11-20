import AbstractView from "./AbstractView";

export default class extends AbstractView {
    constructor() {
        super();
        this.setTitle("Home");
    }

    async getHtml() {
        return "<h1> Hello you are at Home !</h1>";
    }
}
