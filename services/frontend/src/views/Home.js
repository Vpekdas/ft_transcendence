import { fetchApi } from "../api";
import { Component, globalComponents, html } from "../micro";
import { navigateTo } from "../router";

export default class Home extends Component {
    constructor() {
        super();
    }

    showToast(message, iconClass) {
        const toastContainer = document.getElementById("toast-container");
        const toast = document.createElement("div");
        toast.className = "toast";
        toast.innerHTML = `<i class="${iconClass} toast-icon"></i> ${message}`;
        toast.style.display = "flex";
        toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 5000);
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
                    this.showToast("An error occurred. Please try again.", "bi bi-exclamation-triangle-fill");
                });

            if (response["error"] != undefined) {
                console.log("game response: ", response);
            } else {
                const id = response["id"];
                navigateTo("/game");
            }
        });
        return html(
            /* HTML */
            `<div>
                <NavBar />
                <div class="container-fluid game-container">
                    <div id="toast-container"></div>
                    <div class="card pong-game">
                        <h5 class="card-title pong-game">Pong Game</h5>
                        <img src="/favicon.svg" class="card-img-top pong-game" alt="..." />
                        <div class="card-body pong-game">
                            <p class="card-text pong-game">Play 1v1 local.</p>
                            <button type="button" class="btn btn-success play">Play</button>
                        </div>
                    </div>
                    <div class="card pong-game">
                        <h5 class="card-title pong-game">Pong Game</h5>
                        <img src="/favicon.svg" class="card-img-top pong-game" alt="..." />
                        <div class="card-body pong-game">
                            <p class="card-text pong-game">Play 1v1 remote.</p>
                            <button type="button" class="btn btn-success play">Play</button>
                        </div>
                    </div>
                </div>
            </div>`
        );
    }
}
globalComponents.set("Home", Home);
