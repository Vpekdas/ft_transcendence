import { Component } from "../micro";
import NavBar from "./NavBar";

export default class extends Component {
    constructor() {
        super();
        this.navBar = new NavBar();
    }

    async render() {
        const [count, _] = this.useStore("count", 0);
        return `${await this.navBar.render()} <p>Count is ${count}</p><button id="add">Add !</button>`;
    }

    events() {
        const [count, setCount] = this.useStore("count", 0);
        document.getElementById("add").addEventListener("click", () => {
            setCount(count + 1);
        });
    }
}
