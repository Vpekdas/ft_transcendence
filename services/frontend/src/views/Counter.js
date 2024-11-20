import { Component } from "../micro";
import NavBar from "./NavBar";

export default class Counter extends Component {
    constructor() {
        super();
        this.navBar = new NavBar();
    }

    async render() {
        const [count, _] = this.usePersistentStore("count", 0);
        return `${await this.navBar.render()} <p>Count is ${count}</p><button id="add">Add !</button><button id="sub">Sub !</button>`;
    }

    events() {
        const [count, setCount] = this.usePersistentStore("count", 0);
        document.getElementById("add").addEventListener("click", () => {
            setCount(count + 1);
        });
        document.getElementById("sub").addEventListener("click", () => {
            setCount(count - 1);
        });
    }
}
