import { Component, globalComponents, html } from "../micro";

export default class Home extends Component {
    constructor() {
        super();
    }

    async render() {
        this.setTitle("Home");
        return html(
            this.parent,
            /* HTML */
            `<div>
                <NavBar />
                <h1>Hello you are at Home !</h1>
            </div>`
        );
    }
}
globalComponents.set("Home", Home);
