import { tr } from "../i18n";

export default async function Clicker({}) {
    let count = 0;

    document.title = tr("Duck");

    this.query("#the-duck").on("click", (event) => {
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

    return /* HTML */ `<div>
        <NavBar />
        <div class="duck-container">
            <ul class="duck-list">
                <li><img src="/favicon.svg" width="20%" id="the-duck" /></li>
                <li><div class="duck-count">${count}</div></li>
            </ul>
        </div>
    </div>`;
}
