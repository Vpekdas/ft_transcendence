import { tr } from "../i18n";
import { Component, navigateTo } from "../micro";
import { INTRO } from "../constant";

export default class Home extends Component {
    async init() {
        document.title = tr("Home");
        this.animatedIntroArray = [];

        this.onready = () => {
            document.querySelector("#play-pong-1v1local").addEventListener("click", () => {
                navigateTo("/matchmake/pong?gamemode=1v1local");
            });

            document.querySelector("#play-pong-1v1").addEventListener("click", () => {
                navigateTo("/matchmake/pong?gamemode=1v1");
            });

            document.querySelector("#play-pong-tournament").addEventListener("click", () => {
                navigateTo("/create-tournament");
            });

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

            for (let i = 0; i < INTRO.length - 1; i++) {
                this.animatedIntroArray.push({
                    text: INTRO[i],
                    animated: false,
                    e: document.getElementById("intro" + (i + 1)),
                    id: "intro-container-" + (i + 1),
                });
            }

            // Ensure that text are displayed only if the user can see it.
            const observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        // Give the element to observe.
                        const intro = this.animatedIntroArray.find((intro) => intro.e === entry.target);
                        const introContainer = document.getElementById(intro.id);

                        if (introContainer) {
                            // If user can see it then add the appear class so the animation will be played.
                            if (entry.isIntersecting && !intro.animated) {
                                intro.animated = true;
                                introContainer.classList.add("appear");
                                this.decodeEffect(intro.text, intro.e);
                            } else if (!entry.isIntersecting && intro.animated) {
                                intro.animated = false;
                                introContainer.classList.remove("appear");
                            }
                        }
                    });
                },
                {
                    // Ensure that the text is displayed only if the user sees the top side + 50px of offset.
                    // The whole text is displayed. Otherwise, the text pops up before the user scrolls down to the end of the text.
                    rootMargin: "0px 0px -50px 0px",

                    // Since I'm displaying an appear animation, I want to detect the earliest point at which the element can be visible.
                    threshold: 0.1,
                }
            );

            this.animatedIntroArray.forEach((intro) => {
                observer.observe(intro.e);
            });
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
        const customScrollbar = document.querySelector(".custom-scrollbar");

        if (customScrollbar) {
            const maxHeight = customScrollbar.clientHeight;
            const rocketHeight = scrollPercent * maxHeight;

            rocket.style.height = `${rocketHeight}px`;
            supernova.style.height = `${rocketHeight - 25}px`;
        }
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
        return /* HTML */ `
            <HomeNavBar />
            <div class="container-fluid home-container">
                <div class="container-fluid game-container">
                    <div class="card pong-game">
                        <h5 class="card-title pong-game">Pong</h5>
                        <img src="/favicon.svg" class="card-img-top pong-game" alt="..." />
                        <div class="card-body pong-game">
                            <p class="card-text pong-game">${tr("Play 1v1 Local Pong.")}</p>
                            <button type="button" class="btn btn-success play" id="play-pong-1v1local">
                                ${tr("Play")}
                            </button>
                        </div>
                    </div>
                    <div class="card pong-game">
                        <h5 class="card-title pong-game">Pong</h5>
                        <img src="/favicon.svg" class="card-img-top pong-game" alt="..." />
                        <div class="card-body pong-game">
                            <p class="card-text pong-game">${tr("Play 1v1 Online Pong.")}</p>
                            <button type="button" class="btn btn-success play" id="play-pong-1v1">${tr("Play")}</button>
                        </div>
                    </div>
                    <div class="card pong-game">
                        <h5 class="card-title pong-game">Pong</h5>
                        <img src="/favicon.svg" class="card-img-top pong-game" alt="..." />
                        <div class="card-body pong-game">
                            <p class="card-text pong-game">${tr("Create a Pong Tournament.")}</p>
                            <button type="button" class="btn btn-success play" id="play-pong-tournament">
                                ${tr("Create")}
                            </button>
                        </div>
                    </div>
                </div>
                <div class="container-fluid intro-container" id="intro-container-1">
                    <span class="decoded-intro" id="intro1"></span>
                </div>
                <div class="container-fluid outer-wilds-container">
                    <OuterWilds />
                    <div class="container-fluid intro-container" id="intro-container-2">
                        <span class="decoded-intro" id="intro2"></span>
                    </div>
                    <Coordinates />
                    <div class="container-fluid intro-container" id="intro-container-3">
                        <span class="decoded-intro" id="intro3"></span>
                    </div>
                </div>
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
            <Chatbox />
        `;
    }
}
