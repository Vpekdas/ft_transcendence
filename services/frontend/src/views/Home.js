import { fetchApi } from "../api";
import { Component, globalComponents, html } from "../micro";
import { navigateTo } from "../router";

export default class Home extends Component {
    constructor() {
        super();
    }

    async render() {
        this.setTitle("Home");

        this.query(".btn.btn-success").on("click", async (event) => {
            const response = await fetchApi("/api/enterMatchmaking", {
                method: "POST",
                body: JSON.stringify({
                    game: "pong",
                    mode: "1v1local",
                }),
            })
                .then((res) => res.json())
                .catch((err) => {
                    error: "Bad input";
                });

            if (response["error"] != undefined) {
                console.log("game response: ", response);
            } else {
                const id = response["id"];
                navigateTo(`game/${id}`);
            }
        });
        return html(
            /* HTML */
            `<div>
                <NavBar />
                <h1>Hello you are at Home !</h1>
                <button type="button" class="btn btn-success">Success</button>
            </div>`
        );
    }
}
globalComponents.set("Home", Home);
