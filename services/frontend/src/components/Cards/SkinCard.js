import { tr } from "../../i18n";
import { Component, navigateTo } from "../../micro";
import { post, showToast } from "../../utils";

export default class SkinCard extends Component {
    async chooseSkin(skin) {
        const response = await post("/api/player/c/skins/select-" + this.type + "/" + skin, {})
            .then((res) => res.json())
            .catch((err) => {
                showToast("An error occurred. Please try again.", "bi bi-exclamation-triangle-fill");
            });
        if (response.error) {
            showToast(response.error, "bi bi-exclamation-triangle-fill");
        } else {
            showToast(skin + " " + this.type + " chosen successfully.", "bi bi-check-circle-fill");
        }
    }

    async init() {
        this.title = this.attributes.get("title");
        this.type = this.attributes.get("type");

        this.onready = async () => {
            const defaultButton = document.getElementById("btnradio default-" + this.type);
            defaultButton.addEventListener("change", async () => {
                if (this.type === "terrain") {
                    await this.chooseSkin("colorful-terrain");
                } else if (this.type === "ball") {
                    await this.chooseSkin("colorful-ball");
                } else if (this.type === "bar") {
                    await this.chooseSkin("colorful-bar");
                }
            });

            const brittleButton = document.getElementById("btnradio brittle-hollow-" + this.type);
            brittleButton.addEventListener("change", async () => {
                if (this.type === "terrain") {
                    await this.chooseSkin("brittle-hollow");
                } else if (this.type === "ball") {
                    await this.chooseSkin("lava-ball");
                } else if (this.type === "bar") {
                    await this.chooseSkin("brittle-hollow");
                }
            });
        };
    }
    render() {
        return /*HTML */ `
        <div class="card settings skin">
            <h5 class="card-title settings" data-text="Terrain Skin">${this.title}</h5>
            <div class="btn-group player-count" role="group" aria-label="Basic radio toggle button group">
                <input
                    type="radio"
                    class="btn-check"
                    name="btnradio ${this.type}"
                    id="btnradio default-${this.type}"
                    autocomplete="off"
                />
                <label class="btn btn-outline-primary skin" for="btnradio default-${this.type}">Default</label>
                <input
                    type="radio"
                    class="btn-check"
                    name="btnradio ${this.type}"
                    id="btnradio brittle-hollow-${this.type}"
                    autocomplete="off"
                />
                <label class="btn btn-outline-primary skin" for="btnradio brittle-hollow-${this.type}"
                    >Brittle Hollow</label
                >
            </div>
        </div>`;
    }
}
