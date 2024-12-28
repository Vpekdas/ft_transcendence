import { Component, html } from "../micro";
import NavBar from "../components/NavBars/HomeNavBar";
import { tr } from "../i18n";

export default class Clicker extends Component {
    constructor() {
        super();
    }

    async render() {
        const [count, setCount] = this.usePersistentStore("count", 0);

        this.setTitle(tr("Duck"));

        this.query("#the-duck").on("click", (event) => {
            setCount(count + 1);

            event.target.animate(
                [
                    {
                        opacity: 0,
                        easing: "ease-out",
                    },
                    {
                        opacity: 1,
                        easing: "ease-in",
                    },
                ],
                2000
            );
        });

        return html(
            /* HTML */ `<div>
                <NavBar />
                <div class="duck-container">
                    <ul class="duck-list">
                        <li><img src="/favicon.svg" width="20%" id="the-duck" /></li>
                        <li><div class="duck-count">{count}</div></li>
                    </ul>
                </div>
            </div>`
        );
    }
}
