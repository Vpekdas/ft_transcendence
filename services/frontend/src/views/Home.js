import AbstractView from "./AbstractView";

export default class extends AbstractView {
    constructor() {
        super();
        this.setTitle("Home");
    }

    async getHtml() {
        var data = await fetch(this.getOrigin() + ":8000/api/testing").then((res) => res.json());
        console.log(this.getOrigin());
        console.log(data);
        return "<h1> Hello you are at Home !</h1>";
    }
}
