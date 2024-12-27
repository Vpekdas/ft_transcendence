import { Component, globalComponents, html } from "../micro";
import { isLoggedIn } from "../api";
import { tr, setLanguage, getLanguage } from "../i18n";
import { navigateTo } from "../router";

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
        let imageUrl;

        if (!customElements.get("ow-wanderer")) {
            customElements.define("ow-wanderer", Wanderer);
        }

        this.query("#sun").do(() => {
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

            const wanderers = document.querySelectorAll("ow-wanderer");

            wanderers.forEach((wanderer) => {
                wanderer.addEventListener("click", async () => {
                    imageUrl = wanderer.getAttribute("image");
                });
            });
        });

        return html(/* HTML */ ` <div>
                <div class="container-fluid planet-card-container">
                    <span class="planet-name"></span>
                    <img class="planet-img" src="/img/Outer-Wilds/Sun.png"> </img>
                    <span class="planet-description"></span>
                </div>
                <div id="space">
                    <ow-system timelapse="true" labels="true" orbits="true">
                        <ow-orbit id="sun">
                            <ow-wanderer image="/img/Outer-Wilds/Sun.png"></ow-wanderer>
                        </ow-orbit>
                        <ow-orbit id="sun-station" path="false">
                            <ow-name>Sun Station</ow-name>
                            <ow-wanderer image="/img/Outer-Wilds/Sun-Station.png"></ow-wanderer>
                        </ow-orbit>
                        <ow-orbit id="interloper">
                            <ow-name>The Interloper</ow-name>
                            <ow-wanderer image="/img/Outer-Wilds/The-Interloper.png"></ow-wanderer>
                        </ow-orbit>
                        <ow-orbit id="hourglass-twins" quantum>
                            <ow-name>The Hourglass Twins</ow-name>
                            <ow-wanderer image="/img/Outer-Wilds/The-Hourglass-Twins.png">
                                <ow-orbit id="twins">
                                    <ow-wanderer id="ash-twin" image="/img/Outer-Wilds/Ash-Twin.png"></ow-wanderer>
                                    <ow-wanderer id="ember-twin" image="/img/Outer-Wilds/Ember-Twin.png"></ow-wanderer>
                                </ow-orbit>
                            </ow-wanderer>
                        </ow-orbit>
                        <ow-orbit id="timber-hearth" quantum>
                            <ow-name>Timber Hearth</ow-name>
                            <ow-wanderer image="/img/Outer-Wilds/Timber-Hearth.png">
                                <ow-orbit id="attlerock">
                                    <ow-wanderer image="/img/Outer-Wilds/Attlerock.png"></ow-wanderer>
                                </ow-orbit>
                            </ow-wanderer>
                        </ow-orbit>
                        <ow-orbit id="brittle-hollow" quantum>
                            <ow-name>Brittle Hollow</ow-name>
                            <ow-wanderer image="/img/Outer-Wilds/Brittle-Hollow.png">
                                <ow-orbit id="hollows-lantern">
                                    <ow-wanderer image="/img/Outer-Wilds/Hollows-Lantern.png"></ow-wanderer>
                                </ow-orbit>
                            </ow-wanderer>
                        </ow-orbit>
                        <ow-orbit id="giants-deep" quantum>
                            <ow-name>Giant's Deep</ow-name>
                            <ow-wanderer image="/img/Outer-Wilds/Giants-Deep.png">
                                <ow-orbit id="orbital-probe-cannon">
                                    <ow-wanderer image="/img/Outer-Wilds/Orbital-Probe-Cannon.png"></ow-wanderer>
                                </ow-orbit>
                                <ow-orbit id="quantum-moon">
                                    <ow-wanderer image="/img/Outer-Wilds/Quantum-Moon.png"></ow-wanderer>
                                </ow-orbit>
                            </ow-wanderer>
                        </ow-orbit>
                        <ow-orbit id="dark-bramble" quantum>
                            <ow-name>Dark Bramble</ow-name>
                            <ow-wanderer image="/img/Outer-Wilds/Dark-Bramble.png"></ow-wanderer>
                        </ow-orbit>
                        <ow-orbit id="white-hole-station" path="false">
                            <ow-name>White Hole Station</ow-name>
                            <ow-wanderer image="/img/Outer-Wilds/White-Hole-Station.png"></ow-wanderer>
                        </ow-orbit>
                    </ow-system>
                </div>
            </div>`);
    }
}
globalComponents.set("OuterWilds", OuterWilds);
