import { Component, globalComponents, html } from "../micro";
import NavBar from "../components/NavBar";

export default class NotFound extends Component {
    constructor() {
        super();
    }

    async render() {
        this.setTitle("Not Found");
        return html(
            this.parent,
            /* HTML */
            `<div>
                <NavBar />
                <h1>404</h1>
                <p>Oh no! It seems like you got lost in time during your previous time travel.</p>
                <p>The page you are looking for does not exist.</p>
            </div>`
        );
    }
}
globalComponents.set("NotFound", NotFound);
