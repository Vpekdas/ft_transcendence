import { Component, html } from "../micro";
import { isLoggedIn } from "../api";
import { tr, setLanguage, getLanguage } from "../i18n";
import { navigateTo } from "../router";
import { PLANET_DESCRIPTION } from "../constant";

class Wanderer extends HTMLElement {
    constructor() {
        super();
    }

    static observedAttributes = ["image"];

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === "image") {
            // Pre-load the image before replacing the solid color with the image
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

        this.query("#sun").do(() => {
            // Make the quantum moon jump around randomly.
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

            // TODO: Handle Twins differently since they have one orbit ID for 2 wanderers.
            // TODO: When "click" events happen, only the first wanderer in the HTML structure is displayed (here it's Ash Twin).
            const orbits = document.querySelectorAll("ow-orbit");

            orbits.forEach((orbit) => {
                // Ensure that names does not move too.
                orbit.addEventListener("mouseover", async () => {
                    const orbitName = orbit.querySelector("ow-name");
                    orbitName.style.animationPlayState = "paused";
                });
                orbit.addEventListener("mouseleave", async () => {
                    const orbitName = orbit.querySelector("ow-name");
                    orbitName.style.animationPlayState = "running";
                });

                orbit.addEventListener("click", async () => {
                    // Ensure that clicking on a child element does not switch to the main element.
                    // For example, clicking on Attlerock should display Attlerock's details, not Timber Hearth's.
                    event.stopPropagation();

                    const planetContainer = document.querySelector(".container-fluid.planet-card-container");
                    const displayedPlanet = document.querySelector(".planet-img");
                    const displayedPlanetName = document.querySelector(".planet-name");
                    const displayedPlanetDescription = document.querySelector(".planet-description");

                    // Display the card with a subtle animation and update the border color to match the planet's color.
                    planetContainer.style.display = "flex";
                    planetContainer.style.setProperty(
                        "--card-color",
                        orbit.querySelector("ow-wanderer").getAttribute("card-color")
                    );

                    // Update the card with the selected planet's name.
                    displayedPlanetName.textContent = orbit.querySelector("ow-name").textContent;

                    // Update the card with the selected planet's image.
                    displayedPlanet.setAttribute("src", orbit.querySelector("ow-wanderer").getAttribute("image"));

                    // Update the card with the selected planet's description.
                    displayedPlanetDescription.textContent = PLANET_DESCRIPTION[displayedPlanetName.textContent];

                    // Prevent rotation for specific planets.
                    if (
                        displayedPlanetName.textContent === "White Hole Station" ||
                        displayedPlanetName.textContent === "The Interloper"
                    ) {
                        displayedPlanet.style.animationPlayState = "paused";
                    } else {
                        displayedPlanet.style.animationPlayState = "running";
                    }
                });
            });
        });

        // TODO: Probably will append each line.
        // TODO: Remove the border of previous line so the "cursor" will not be visible.

        return html(/* HTML */ ` <div>
            <div class="typewriter-wrapper">
                <div>
                    <h1 class="typewriter-text line-1">Lorem Ipsum Dolor</h1>
                </div>
            </div>   
                <div class="container-fluid planet-card-container" >
                    <span class="planet-name"></span>
                    <img class="planet-img" src=""> </img>
                    <span class="planet-description"></span>
                </div>
                <div id="space">
                    <ow-system timelapse="true" labels="true" orbits="true">
                        <ow-orbit id="sun">
                            <ow-name>Sun</ow-name>
                            <ow-wanderer image="/img/Outer-Wilds/Sun.png" card-color="#ffa500"></ow-wanderer>
                        </ow-orbit>
                        <ow-orbit id="sun-station" path="false">
                            <ow-name>Sun Station</ow-name>
                            <ow-wanderer image="/img/Outer-Wilds/Sun-Station.png" card-color="#f6ab48"></ow-wanderer>
                        </ow-orbit>
                        <ow-orbit id="interloper">
                            <ow-name>The Interloper</ow-name>
                            <ow-wanderer image="/img/Outer-Wilds/The-Interloper.png" card-color="cyan"></ow-wanderer>
                        </ow-orbit>
                        <ow-orbit id="hourglass-twins" quantum>
                            <ow-name>The Hourglass Twins</ow-name>
                            <ow-wanderer image="/img/Outer-Wilds/The-Hourglass-Twins.png" card-color="orangered">
                                <ow-orbit id="twins">
                                    <ow-wanderer id="ash-twin" image="/img/Outer-Wilds/Ash-Twin.png" card-color="orangered">
                                        <ow-name>Ash Twin</ow-name>
                                    </ow-wanderer>
                                    <ow-wanderer id="ember-twin" image="/img/Outer-Wilds/Ember-Twin.png" card-color="orangered">
                                        <ow-name>Ember Twin</ow-name>
                                    </ow-wanderer>
                                </ow-orbit>
                            </ow-wanderer>
                        </ow-orbit>
                        <ow-orbit id="timber-hearth" quantum>
                            <ow-name>Timber Hearth</ow-name>
                            <ow-wanderer image="/img/Outer-Wilds/Timber-Hearth.png" card-color="greenyellow">
                                <ow-orbit id="attlerock">
                                    <ow-name>Attlerock</ow-name>
                                    <ow-wanderer image="/img/Outer-Wilds/Attlerock.png" card-color="slategray"></ow-wanderer>
                                </ow-orbit>
                            </ow-wanderer>
                        </ow-orbit>
                        <ow-orbit id="brittle-hollow" quantum>
                            <ow-name>Brittle Hollow</ow-name>
                            <ow-wanderer image="/img/Outer-Wilds/Brittle-Hollow.png" card-color="darkturquoise">
                                <ow-orbit id="hollows-lantern">
                                    <ow-name>Hollows Lantern</ow-name>
                                    <ow-wanderer image="/img/Outer-Wilds/Hollows-Lantern.png" card-color="darkorange"> </ow-wanderer>
                                </ow-orbit>
                            </ow-wanderer>
                        </ow-orbit>
                        <ow-orbit id="giants-deep" quantum>
                            <ow-name>Giant's Deep</ow-name>
                            <ow-wanderer image="/img/Outer-Wilds/Giants-Deep.png" card-color="darkseagreen">
                                <ow-orbit id="orbital-probe-cannon">
                                    <ow-name>Orbital Probe Cannon</ow-name>
                                    <ow-wanderer image="/img/Outer-Wilds/Orbital-Probe-Cannon.png" card-color="gold"></ow-wanderer>
                                </ow-orbit>
                                <ow-orbit id="quantum-moon">
                                    <ow-name>Quantum Moon</ow-name>
                                    <ow-wanderer image="/img/Outer-Wilds/Quantum-Moon.png" card-color="slategray"></ow-wanderer>
                                </ow-orbit>
                            </ow-wanderer>
                        </ow-orbit>
                        <ow-orbit id="dark-bramble" quantum>
                            <ow-name>Dark Bramble</ow-name>
                            <ow-wanderer image="/img/Outer-Wilds/Dark-Bramble.png" card-color="darkslateblue"></ow-wanderer>
                        </ow-orbit>
                        <ow-orbit id="white-hole-station" path="false">
                            <ow-name>White Hole Station</ow-name>
                            <ow-wanderer image="/img/Outer-Wilds/White-Hole-Station.png" card-color="gold"></ow-wanderer>
                        </ow-orbit>
                    </ow-system>
                </div>
            </div>`);
    }
}
