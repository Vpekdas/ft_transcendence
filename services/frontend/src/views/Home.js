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

            for (let i = 0; i < 2; i++) {
                this.animatedIntroArray.push({
                    text: INTRO[i],
                    animated: false,
                    e: document.getElementById("intro" + (i + 1)),
                    id: "intro-container-" + (i + 1),
                });
            }

            // TODO: FInd an animation when the intro spawn.
            // TODO: Maybe set style to none when intro cannot be seen.
            window.addEventListener("scroll", () => {
                this.animatedIntroArray.forEach((intro) => {
                    const introContainer = document.getElementById(intro.id);

                    if (this.isElementVisible(intro.e) && !intro.animated) {
                        intro.animated = true;
                        introContainer.style.display = "flex";
                        this.decodeEffect(intro.text, intro.e);
                    }
                    if (!this.isElementVisible(intro.e) && intro.animated) {
                        intro.animated = false;
                    }
                });
            });
        };
    }

    isElementVisible(element) {
        const rect = element.getBoundingClientRect();

        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    decodeEffect(rightText, decodedContainerId) {
        const randArray = "§1234567890-=qwertyuiop[]asdfghjkl;zxcvbnm,./±!@#$%^&*()_+{}|<>?";
        let textArray = rightText.split("");
        const wordArray = rightText.split(" ");

        const decode = setInterval(() => {
            const randChar = randArray[Math.floor(Math.random() * randArray.length)];
            const randIndex = Math.floor(Math.random() * textArray.length);

            textArray[randIndex] = randChar;
            decodedContainerId.innerHTML = textArray.join("");
        }, 10);

        // Correct each word one by one
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
                3000 + index * rightText.length
            );
        });
    }

    render() {
        return /* HTML */ `
            <HomeNavBar />
            <div class="container-fluid home-container">
                <div class="container-fluid game-container">
                    <div id="toast-container"></div>
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
                </div>
            </div>
            <Chatbox />
        `;
    }
}
