import { Component, html } from "../micro";
import NavBar from "../components/NavBars/HomeNavBar";
import { tr } from "../i18n";

export default class Counter extends Component {
    constructor() {
        super();
    }

    async render() {
        const [count, setCount] = this.usePersistentStore("count", 0);

        this.setTitle(tr("Counter"));

        this.query("#add").on("click", (event) => {
            setCount(count + 1);
        });

        this.query("#sub").on("click", (event) => {
            setCount(count - 1);
        });

        return html(
            /* HTML */ `<div>
                <NavBar />
                <p>Count is ${count}</p>
                <button id="add">Add !</button><button id="sub">Sub !</button>
            </div>`
        );
    }
}
