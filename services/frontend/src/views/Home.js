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

            for (let i = 0; i < 5; i++) {
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
                                this.decodeEffect(tr(intro.text), intro.e);
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

            this.createPloufParticle(21);

            const intro = document.getElementById("intro-container-4");
            const popupParticleContainer = document.getElementById("popup-intro");
            const closeBtn = document.getElementById("close-intro");

            const seenIntro = localStorage.getItem("seenIntro");

            if (seenIntro !== "true") {
                localStorage.setItem("seenIntro", "true");

                closeBtn.addEventListener("click", async () => {
                    if (intro) {
                        intro.style.display = "none";
                        this.audio = document.getElementById("background-music");
                        this.audio.load();
                        this.audio.play();
                    }

                    if (popupParticleContainer) {
                        popupParticleContainer.innerHTML = "";
                        popupParticleContainer.style.display = "none";
                    }
                });
            } else {
                if (intro) {
                    intro.style.display = "none";
                }

                if (popupParticleContainer) {
                    popupParticleContainer.innerHTML = "";
                    popupParticleContainer.style.display = "none";
                }
            }
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

        // Every 10ms randomize a character in text.
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

    createPloufParticle(particleNumber) {
        const container = document.getElementById("popup-intro");

        for (let i = 0; i < particleNumber; i++) {
            const particle = document.createElement("div");

            particle.textContent = "🤿";

            particle.classList.add("plouf-particle");

            particle.style.setProperty("--startY", `${Math.random() * 100}vh`);
            particle.style.setProperty("--startX", `${Math.random() * 100}vw`);
            particle.style.setProperty("--endY", `${Math.random() * 100}vh`);
            particle.style.setProperty("--endX", `${Math.random() * 100}vw`);

            container.appendChild(particle);
        }
    }

    async clean() {
        if (this.music && this.music.audio && this.music.audio.duration > 0 && !this.music.audio.paused) {
            this.music.audio.pause();
            this.music.audio.currentTime = 0;
        }
    }

    render() {
        return /* HTML */ `
            <HomeNavBar />
            <div class="container-fluid home-container">
                <div class="container-fluid game-container">
                    <GameCard
                        title="Play Pong Locally"
                        img="/img/pong-icon.svg"
                        id="play-pong-1v1local"
                        alt=""
                        description="Play 1v1 Local Pong."
                        btnName="Play"
                    />
                    <GameCard
                        title="Challenge a Player Online"
                        img="/img/online-icon.svg"
                        id="play-pong-1v1"
                        alt=""
                        description="Play 1v1 Online Pong."
                        btnName="Play"
                    />
                    <GameCard
                        title="Host a Pong Tournament"
                        img="/img/trophy-icon.svg"
                        id="play-pong-tournament"
                        alt=""
                        description="Create a Pong Tournament."
                        btnName="Create"
                    />
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
                    <div class="container-fluid intro-container" id="intro-container-5">
                        <span class="decoded-intro" id="intro5"></span>
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
            <div class="container-fluid intro-container" id="intro-container-4">
                <span class="decoded-intro" id="intro4"></span>
                <button id="close-intro" type="submit" class="btn btn-primary settings">${tr("Dive in !")}</button>
            </div>
            <div class="particle-container" id="popup-intro"></div>
            <BlackHoleComponent />
        `;
    }
}
