import { tr } from "../../i18n";
import { Component, navigateTo } from "../../micro";
import { post, showToast } from "../../utils";

export default class SkinCard extends Component {
    async chooseSkin(type, skin) {
        const response = await post("/api/player/c/skins/select-" + type + "/" + skin, {})
            .then((res) => res.json())
            .catch((err) => {
                showToast("An error occurred. Please try again.", "bi bi-exclamation-triangle-fill");
            });
        if (response.error) {
            showToast(response.error, "bi bi-exclamation-triangle-fill");
        } else {
            showToast(skin + " " + type + " chosen successfully.", "bi bi-check-circle-fill");
        }
    }

    async init() {
        this.title = this.attributes.get("title");
        this.type = this.attributes.get("type");

        if (this.type === "terrain") {
            var [terrainSkin, setTerrainSkin] = this.usePersistent("terrainSkin", "colorful-terrain");
        } else if (this.type === "ball") {
            var [ballSkin, setBallSkin] = this.usePersistent("ballSkin", "colorful-ball");
        } else if (this.type === "border") {
            var [barSkin, setBarSkin] = this.usePersistent("barSkin", "colorful-bar");
        }

        this.onready = async () => {
            const defaultButton = document.getElementById("btnradio default-" + this.type);
            defaultButton.addEventListener("change", async () => {
                if (this.type === "terrain") {
                    await this.chooseSkin("terrain", "colorful-terrain");
                    setTerrainSkin("colorful-terrain");
                } else if (this.type === "ball") {
                    await this.chooseSkin("ball", "colorful-ball");
                    setBallSkin("colorful-ball");
                } else if (this.type === "bar") {
                    await this.chooseSkin("bar", "colorful-bar");
                    setBarSkin("colorful-bar");
                }
            });

            const brittleButton = document.getElementById("btnradio brittle-hollow-" + this.type);
            brittleButton.addEventListener("change", async () => {
                if (this.type === "terrain") {
                    await this.chooseSkin("terrain", "brittle-hollow");
                    setTerrainSkin("brittle-hollow");
                } else if (this.type === "ball") {
                    await this.chooseSkin("ball", "lava-ball");
                    setBallSkin("lava-ball");
                } else if (this.type === "bar") {
                    await this.chooseSkin("bar", "brittle-hollow");
                    setBarSkin("brittle-hollow");
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
