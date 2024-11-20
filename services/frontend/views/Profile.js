import AbstractView from "./AbstractView";

export default class extends AbstractView {
    constructor() {
        super();
        this.setTitle("Profile");
    }

    async getHtml() {
        return "<h1> Hello you are at Profile !</h1>";
    }
}
