import { Component, params } from "../micro";
import { INTRO } from "../constant";

/** @type {import("../micro").Component} */
export default class Profile extends Component {
    async init() {
        this.onready = () => {
            const introContainer = document.getElementById("intro4");
            this.decodeEffect(INTRO[3], introContainer);

            const rocket = document.querySelector(".space-rocket");
            const supernova = document.querySelector(".supernova");
            const particleContainer = document.querySelector(".particle-container");

            this.updateRocketHeight(rocket, supernova);

            window.addEventListener("scroll", () => {
                this.updateRocketHeight(rocket, supernova);
            });

            setInterval(() => {
                this.createParticles(particleContainer, rocket);
            }, 100);
        };
    }

    createParticles(container, rocket) {
        const particle = document.createElement("div");
        particle.classList.add("particle");

        const rocketRect = rocket.getBoundingClientRect();
        particle.style.left = `${Math.random() * 16}px`;
        particle.style.top = `${rocketRect.top + rocketRect.height - 32}px`;

        const angle = Math.random() * 2 * Math.PI;
        const distance = Math.random() * 50;
        particle.style.setProperty("--x", `${Math.random() * 16}px`);
        particle.style.setProperty("--y", `${Math.sin(angle) * distance}px`);

        container.appendChild(particle);

        particle.addEventListener("animationend", () => {
            particle.remove();
        });
    }

    updateRocketHeight(rocket, supernova) {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = scrollTop / docHeight;
        const maxHeight = document.querySelector(".custom-scrollbar").clientHeight;
        const rocketHeight = scrollPercent * maxHeight;

        rocket.style.height = `${rocketHeight}px`;
        supernova.style.height = `${rocketHeight - 25}px`;
    }

    decodeEffect(rightText, decodedContainerId) {
        const randArray = "§1234567890-=qwertyuiop[]asdfghjkl;zxcvbnm,./±!@#$%^&*()_+{}|<>?";
        let textArray = rightText.split("");
        const wordArray = rightText.split(" ");

        // Every 10s randomize a character in text.
        const decode = setInterval(() => {
            const randChar = randArray[Math.floor(Math.random() * randArray.length)];
            const randIndex = Math.floor(Math.random() * textArray.length);

            textArray[randIndex] = randChar;
            decodedContainerId.innerHTML = textArray.join("");
        }, 10);

        // Correct each word one by one by adding a delay.
        let previousWordLength = 0;
        wordArray.forEach((word, index) => {
            setTimeout(
                () => {
                    clearInterval(decode);
                    for (let j = 0; j < word.length; j++) {
                        textArray[previousWordLength + j] = word[j];
                    }
                    decodedContainerId.innerHTML = textArray.join("");
                    previousWordLength += word.length + 1;
                    textArray[previousWordLength - 1] = " ";
                },
                3000 + (index * rightText.length) / 4
            );
        });
    }

    render() {
        const tab = params.get("tab");
        let comp = "";

        if (tab == "match-history") {
            comp = `<MatchHistory />`;
        } else if (tab == "statistics") {
            comp = `<Statistics />`;
        } else if (tab == "settings") {
            comp = `<Settings />`;
        } else if (tab == "skins") {
            comp = `<Skins />`;
        }

        return /* HTML */ `
            <HomeNavBar />
            <div class="container-fluid profile-container">
                <div class="container-fluid intro-container appear" id="intro-container-4">
                    <span class="decoded-intro" id="intro4"></span>
                </div>
                ${comp}
            </div>
            <div class="custom-scrollbar">
                <img src="/img/Outer-Wilds/Sun.png" />
                <img src="/img/Outer-Wilds/Sun-Station.png" />
                <img src="/img/Outer-Wilds/The-Interloper.png" />
                <img src="/img/Outer-Wilds/Ash-Twin.png" />
                <img src="/img/Outer-Wilds/Ember-Twin.png" />
                <img src="/img/Outer-Wilds/Timber-Hearth.png" />
                <img src="/img/Outer-Wilds/Attlerock.png" />
                <img src="/img/Outer-Wilds/Brittle-Hollow.png" />
                <img src="/img/Outer-Wilds/Hollows-Lantern.png" />
                <img src="/img/Outer-Wilds/Giants-Deep.png" />
                <img src="/img/Outer-Wilds/Orbital-Probe-Cannon.png" />
                <img src="/img/Outer-Wilds/Quantum-Moon.png" />
                <img src="/img/Outer-Wilds/Dark-Bramble.png" />
            </div>
            <div class="space-rocket">
                <img src="/img/spaceScrollbar.svg" />
                <div class="supernova"></div>
                <div class="particle-container"></div>
            </div>
        `;
    }
}
