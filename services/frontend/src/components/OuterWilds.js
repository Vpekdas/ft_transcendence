import { Component, globalComponents, html } from "../micro";
import { isLoggedIn } from "../api";
import { tr, setLanguage, getLanguage } from "../i18n";
import { navigateTo } from "../router";

// TODO Add the following feat: Hide some easter eggs on some planets, for example to redirect to our group projects.
class Wanderer extends HTMLElement {
    constructor() {
        super();
    }

    static observedAttributes = ["image"];

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === "image") {
            // Pre-load the image before replacing the solid colour with the image
            const img = new Image();
            img.onload = () => {
                this.style.setProperty("--w-image", `url(${newValue})`);
            };
            img.src = newValue;
        }
    }
}

export default class OuterWilds extends Component {
    constructor() {
        super();
    }

    async render() {
        if (!customElements.get("ow-wanderer")) {
            customElements.define("ow-wanderer", Wanderer);
        }

        document.addEventListener("DOMContentLoaded", function () {
            // Make the quantum moon jump around randomly
            const quantumMoon = document.getElementById("quantum-moon");
            const quantumOrbits = Array.from(document.querySelectorAll("[quantum]"));
            quantumMoon.addEventListener("animationiteration", (e) => {
                if (e.animationName !== "--quantum") {
                    return;
                }
                const currOrbit = quantumMoon.closest("[quantum]");
                const availableOrbits = quantumOrbits.filter((o) => o !== currOrbit);
                const newOrbit = availableOrbits[Math.floor(Math.random() * availableOrbits.length)];
                const newWanderer = newOrbit.querySelector(":scope > ow-wanderer");
                newWanderer.appendChild(quantumMoon);
            });

            const solarSystem = document.querySelector("ow-system");

            solarSystem.addEventListener("animationiteration", (e) => {
                if (e.animationName !== "--supernova") {
                    return;
                }

                // Restarts all animations from the correct position (yes it's a nasty way to do it, I know...)
                requestAnimationFrame(() => {
                    solarSystem.hidden = true;
                    requestAnimationFrame(() => {
                        solarSystem.hidden = false;
                    });
                });
            });
        });

        return html(
            /* HTML */ ` <div>
                <ow-system timelapse="true" labels="true" orbits="true">
                    <ow-orbit id="sun">
                        <ow-wanderer image="https://i.imgur.com/CHfm7Rb.png"></ow-wanderer>
                    </ow-orbit>

                    <ow-orbit id="sun-station" path="false">
                        <ow-wanderer image="https://i.imgur.com/KcqPZnw.png"></ow-wanderer>
                    </ow-orbit>

                    <ow-orbit id="interloper">
                        <ow-name>The Interloper</ow-name>
                        <ow-wanderer image="https://i.imgur.com/3EF5IMK.png"></ow-wanderer>
                    </ow-orbit>

                    <ow-orbit id="hourglass-twins" quantum>
                        <ow-name>The Hourglass Twins</ow-name>
                        <ow-wanderer image="https://i.imgur.com/YTAcqBw.png">
                            <ow-orbit id="twins">
                                <ow-wanderer id="ash-twin" image="https://i.imgur.com/SUYEIpK.png"></ow-wanderer>
                                <ow-wanderer id="ember-twin" image="https://i.imgur.com/iPE6eao.png"></ow-wanderer>
                            </ow-orbit>
                        </ow-wanderer>
                    </ow-orbit>

                    <ow-orbit id="timber-hearth" quantum>
                        <ow-name>Timber Hearth</ow-name>
                        <ow-wanderer image="https://i.imgur.com/s93MtRV.png">
                            <ow-orbit id="attlerock">
                                <ow-wanderer image="https://i.imgur.com/rxdFlJ8.png"></ow-wanderer>
                            </ow-orbit>
                        </ow-wanderer>
                    </ow-orbit>

                    <ow-orbit id="brittle-hollow" quantum>
                        <ow-name>Brittle Hollow</ow-name>
                        <ow-wanderer image="https://i.imgur.com/e6oWjiF.png">
                            <ow-orbit id="hollows-lantern">
                                <ow-wanderer image="https://i.imgur.com/sb8xB97.png"></ow-wanderer>
                            </ow-orbit>
                        </ow-wanderer>
                    </ow-orbit>

                    <ow-orbit id="giants-deep" quantum>
                        <ow-name>Giant's Deep</ow-name>
                        <ow-wanderer image="https://i.imgur.com/OMosCVo.png">
                            <ow-orbit id="orbital-probe-cannon">
                                <ow-wanderer image="https://i.imgur.com/v5oGWQN.png"></ow-wanderer>
                            </ow-orbit>

                            <ow-orbit id="quantum-moon">
                                <ow-wanderer image="https://i.imgur.com/NvXkTjY.png"></ow-wanderer>
                            </ow-orbit>
                        </ow-wanderer>
                    </ow-orbit>

                    <ow-orbit id="dark-bramble" quantum>
                        <ow-name>Dark Bramble</ow-name>
                        <ow-wanderer image="https://i.imgur.com/C0CtSuY.png"></ow-wanderer>
                    </ow-orbit>

                    <ow-orbit id="white-hole-station" path="false">
                        <ow-wanderer image="https://i.imgur.com/9CC2K51.png"></ow-wanderer>
                    </ow-orbit>
                </ow-system>
            </div>`
        );
    }
}
globalComponents.set("OuterWilds", OuterWilds);
