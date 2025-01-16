import { tr } from "../i18n";
import { post } from "../utils";
import { Component } from "../micro";

/** @type {import("../micro").Component} */
export default async function Skins({ dom, stores }) {
    document.title = tr("Skins");

    let [terrainSkin, setTerrainSkin] = stores.usePersistent("terrainSkin", "default-terrain");
    let [ballSkin, setBallSkin] = stores.usePersistent("ballSkin", "default-ball");

    dom.querySelector("#skin-container").do((element) => {
        document.querySelector(".skin-item.terrain[skin-name='" + terrainSkin() + "']").classList.add("selected");
        document.querySelector(".skin-item.ball[skin-name='" + ballSkin() + "']").classList.add("selected");
    });

    dom.querySelectorAll(".skin-item.terrain").on("click", async (event) => {
        let previousSkin = terrainSkin();
        let previousSkinEl = document.querySelector("[skin-name=" + previousSkin + "]");

        previousSkinEl.classList.remove("selected");
        event.target.classList.add("selected");

        const name = event.target.getAttribute("skin-name");

        setTerrainSkin(name);
        await post("/api/player/c/skins/select-terrain/" + name);
    });

    dom.querySelectorAll(".skin-item.ball").on("click", async (event) => {
        let previousSkin = ballSkin();
        let previousSkinEl = document.querySelector("[skin-name=" + previousSkin + "]");

        previousSkinEl.classList.remove("selected");
        event.target.classList.add("selected");

        const name = event.target.getAttribute("skin-name");

        setBallSkin(name);
        await post("/api/player/c/skins/select-ball/" + name);
    });

    return /* HTML */ ` <div class="container-fluid dashboard-container" id="skin-container">
        <ProfileNavBar />
        <ul>
            <li class="skin-super-container">
                <h1>Terrain skin</h1>
                <div class="skin-container">
                    <div class="skin-item terrain" skin-name="default-terrain">Default</div>
                    <div class="skin-item terrain" skin-name="brittle-hollow">Brittle Hollow</div>
                </div>
            </li>
            <li class="skin-super-container">
                <h1>Ball skin</h1>
                <div class="skin-container">
                    <div class="skin-item ball" skin-name="default-ball">Default</div>
                </div>
            </li>
        </ul>
    </div>`;
}
