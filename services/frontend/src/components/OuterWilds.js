import { Component } from "../micro";
import { PLANETS } from "../constant";

// Since Ash Twin and Ember Twin are under the "twins" ID, we need to add event listeners to both elements individually.
// Additionally, they are not part of the "ow-orbit" elements.
const handlePlanetClick = (planetElement, supernova, music) => {
    const planetContainer = document.querySelector(".container-fluid.planet-card-container");
    const displayedPlanet = document.querySelector(".planet-img");
    const displayedPlanetName = document.querySelector(".planet-name");
    const displayedPlanetDescription = document.querySelector(".planet-description");

    // Display the card with a subtle animation and update the border color to match the planet's color.
    planetContainer.style.display = "flex";
    planetContainer.style.setProperty("--card-color", planetElement.getAttribute("card-color"));

    // Update the card with the selected planet's name.
    displayedPlanetName.textContent = planetElement.querySelector("ow-name").textContent;

    // Update the card with the selected planet's image.
    displayedPlanet.setAttribute("src", planetElement.getAttribute("image"));

    // Update the card with the selected planet's description.
    displayedPlanetDescription.textContent = PLANETS[displayedPlanetName.textContent].Description;

    // If there is multiple music, choose one randomly :).
    if (PLANETS[displayedPlanetName.textContent].Music.length > 1 && !supernova) {
        music.index = Math.floor(Math.random() * PLANETS[displayedPlanetName.textContent].Music.length);
    } else {
        music.index = 0;
    }

    // Ensure that only one music track is played at a time by pausing the current track before playing a new one.
    if (music.audio && music.audio.duration > 0 && !music.audio.paused && !supernova) {
        music.audio.pause();
    }

    if (!supernova) {
        const audioSource = document.getElementById("audio-source");
        audioSource.src = "/music/" + PLANETS[displayedPlanetName.textContent].Music[music.index] + ".mp3";
        music.audio.load();
        music.audio.play();
        music.name = PLANETS[displayedPlanetName.textContent].Music[music.index];
    }
};

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
    async init() {
        if (!customElements.get("ow-wanderer")) {
            customElements.define("ow-wanderer", Wanderer);
        }

        this.userInteracted = false;

        this.onready = () => {
            this.music = { audio: document.getElementById("background-music"), index: 0 };

            document.addEventListener("click", () => {
                this.userInteracted = true;
            });

            this.chronometer = { timerId: 0, seconds: 0 };
            let supernova = false;
            const audioSource = document.getElementById("audio-source");

            this.chronometer.timerId = setInterval(() => {
                this.chronometer.seconds++;
                if (this.chronometer.seconds === 37 && !supernova) {
                    supernova = true;

                    if (
                        this.music.audio.duration > 0 &&
                        !this.music.audio.paused &&
                        !audioSource.src.includes("Final")
                    ) {
                        this.music.audio.pause();
                        this.music.audio.currentTime = 0;
                    }

                    if (!audioSource.src.includes("Final")) {
                        audioSource.src = "/music/End Times.mp3";
                        this.music.audio.load();
                        if (this.userInteracted) {
                            this.music.audio.play();
                        }
                    }
                }

                if (this.chronometer.seconds >= 120) {
                    supernova = false;
                    clearInterval(this.chronometer.timerId);
                }
            }, 1000);

            // Make the quantum moon jump around randomly.
            const quantumMoon = document.querySelector("#quantum-moon");

            const quantumOrbits = Array.from(document.querySelectorAll("[quantum]"));

            if (quantumMoon) {
                quantumMoon.addEventListener("animationiteration", (e) => {
                    if (e.animationName !== "--quantum") {
                        return;
                    }
                    const currOrbit = quantumMoon.closest("[quantum]");
                    const availableOrbits = quantumOrbits.filter((o) => o !== currOrbit);
                    const newOrbit = availableOrbits[Math.floor(Math.random() * availableOrbits.length)];
                    if (newOrbit) {
                        const newWanderer = newOrbit.querySelector(":scope > ow-wanderer");
                        if (newWanderer) {
                            newWanderer.appendChild(quantumMoon);
                        }
                    }
                });
            }

            const orbits = document.querySelectorAll("ow-orbit");
            const ashTwin = document.querySelector("#ash-twin");
            const emberTwin = document.querySelector("#ember-twin");

            if (ashTwin && emberTwin) {
                ashTwin.addEventListener("click", () => handlePlanetClick(ashTwin, supernova, this.music));
                emberTwin.addEventListener("click", () => handlePlanetClick(emberTwin, supernova, this.music));
            }

            orbits.forEach((orbit) => {
                if (orbit.id === "twins" || orbit.id === "hourglass-twins") {
                    return;
                }
                // Ensure that names does not move too.
                orbit.addEventListener("mouseover", () => {
                    const orbitName = orbit.querySelector("ow-name");
                    orbitName.style.animationPlayState = "paused";
                });
                orbit.addEventListener("mouseleave", () => {
                    const orbitName = orbit.querySelector("ow-name");
                    orbitName.style.animationPlayState = "running";
                });

                orbit.addEventListener("click", (event) => {
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
                    displayedPlanetDescription.textContent = PLANETS[displayedPlanetName.textContent].Description;

                    // Prevent rotation for specific planets.
                    if (
                        displayedPlanetName.textContent === "White Hole Station" ||
                        displayedPlanetName.textContent === "The Interloper"
                    ) {
                        displayedPlanet.style.animationPlayState = "paused";
                    } else {
                        displayedPlanet.style.animationPlayState = "running";
                    }

                    // If there is multiple music, choose one randomly :).
                    if (PLANETS[displayedPlanetName.textContent].Music.length > 1 && !supernova) {
                        this.music.index = Math.floor(
                            Math.random() * PLANETS[displayedPlanetName.textContent].Music.length
                        );
                    } else {
                        this.music.index = 0;
                    }

                    // Ensure that only one music track is played at a time by pausing the current track before playing a new one.
                    if (this.music.audio && this.music.audio.duration > 0 && !this.music.audio.paused && !supernova) {
                        this.music.audio.pause();
                    }

                    if (!supernova) {
                        const audioSource = document.getElementById("audio-source");
                        audioSource.src =
                            "/music/" + PLANETS[displayedPlanetName.textContent].Music[this.music.index] + ".mp3";
                        this.music.audio.load();
                        this.music.audio.play();
                    }
                });
            });
        };
    }

    // Ensure that music is stopped when navigating outside homepage.
    async clean() {
        if (this.music && this.music.audio && this.music.audio.duration > 0 && !this.music.audio.paused) {
            this.music.audio.pause();
            this.music.audio.currentTime = 0;
        }

        if (this.chronometer && this.chronometer.seconds > 0 && this.chronometer.timerId) {
            clearInterval(this.chronometer.timerId);
        }
    }

    render() {
        return /* HTML */ `
            <div class="container-fluid planet-card-container">
                <span class="planet-name"></span>
                <img class="planet-img" src="" />
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
                                <ow-wanderer
                                    id="ember-twin"
                                    image="/img/Outer-Wilds/Ember-Twin.png"
                                    card-color="orangered"
                                >
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
                                <ow-wanderer
                                    image="/img/Outer-Wilds/Attlerock.png"
                                    card-color="slategray"
                                ></ow-wanderer>
                            </ow-orbit>
                        </ow-wanderer>
                    </ow-orbit>
                    <ow-orbit id="brittle-hollow" quantum>
                        <ow-name>Brittle Hollow</ow-name>
                        <ow-wanderer image="/img/Outer-Wilds/Brittle-Hollow.png" card-color="darkturquoise">
                            <ow-orbit id="hollows-lantern">
                                <ow-name>Hollows Lantern</ow-name>
                                <ow-wanderer
                                    image="/img/Outer-Wilds/Hollows-Lantern.png"
                                    card-color="darkorange"
                                ></ow-wanderer>
                            </ow-orbit>
                        </ow-wanderer>
                    </ow-orbit>
                    <ow-orbit id="giants-deep" quantum>
                        <ow-name>Giant's Deep</ow-name>
                        <ow-wanderer image="/img/Outer-Wilds/Giants-Deep.png" card-color="darkseagreen">
                            <ow-orbit id="orbital-probe-cannon">
                                <ow-name>Orbital Probe Cannon</ow-name>
                                <ow-wanderer
                                    image="/img/Outer-Wilds/Orbital-Probe-Cannon.png"
                                    card-color="gold"
                                ></ow-wanderer>
                            </ow-orbit>
                            <ow-orbit id="quantum-moon">
                                <ow-name>Quantum Moon</ow-name>
                                <ow-wanderer
                                    image="/img/Outer-Wilds/Quantum-Moon.png"
                                    card-color="slategray"
                                ></ow-wanderer>
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
            <audio id="background-music" controls>
                <source id="audio-source" src="/music/Space.mp3" type="audio/mpeg" />
                Your browser does not support the audio element.
            </audio>
        `;
    }
}
