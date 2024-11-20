import AbstractView from "./AbstractView";

export default class extends AbstractView {
    constructor() {
        super();
        this.setTitle("Settings");
    }

    async getHtml() {
        return this.readPage("/settings.html");
    }
}
