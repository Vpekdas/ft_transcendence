import { tr } from "../i18n";

/** @type {import("../micro").Component}  */
export default async function Duck({ dom, stores }) {
    const [count, setCount] = stores.usePersistent("count", 0);

    dom.querySelector("#the-duck").on("click", (event) => {
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

        setCount(count() + 1);
    });

    return /* HTML */ ` <div class="duck-container">
        <ul class="duck-list">
            <li><img src="/favicon.svg" width="20%" id="the-duck" /></li>
            <li><div class="duck-count">${count()} ${count() < 2 ? "duck" : "ducks"}</div></li>
        </ul>
    </div>`;
}
