import { Component } from "../micro";
import { tr } from "../i18n";
import { CREDITS } from "../constant";

export default class Credits extends Component {
    async init() {
        document.title = "Credits";
        this.credits = [];

        // New container from 7.
        this.onready = () => {
            for (let i = 0; i < 6; i++) {
                const text = tr(CREDITS[i]);
                const containerId = document.getElementById("intro" + (i + 7));
                const introWrapper = document.getElementById("intro-container-" + (i + 7));

                introWrapper.style.marginTop = "7%";

                this.decodeEffect(text, containerId);
            }
        };
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
        return /* HTML */ ` <HomeNavBar />
            <div class="glitch-wrapper">
                <div class="glitch text-layer-credits-one text-layer-1">Outer Wilds</div>
                <div class="glitch text-layer-credits-one text-layer-2">Outer Wilds</div>
                <div class="glitch text-layer-credits-one text-layer-3">Outer Wilds</div>
            </div>
            <div class="container-fluid intro-container appear" id="intro-container-7">
                <span class="decoded-intro" id="intro7"> </span>
            </div>
            <div class="glitch-wrapper">
                <div class="glitch text-layer-credits-one text-layer-1">Andrew Prahlow</div>
                <div class="glitch text-layer-credits-one text-layer-2">Andrew Prahlow</div>
                <div class="glitch text-layer-credits-one text-layer-3">Andrew Prahlow</div>
            </div>
            <div class="container-fluid intro-container appear" id="intro-container-8">
                <span class="decoded-intro" id="intro8"></span>
            </div>
            <div class="glitch-wrapper">
                <div class="glitch text-layer-credits-one text-layer-1">Christopher Kirk-Nielsen</div>
                <div class="glitch text-layer-credits-one text-layer-2">Christopher Kirk-Nielsen</div>
                <div class="glitch text-layer-credits-one text-layer-3">Christopher Kirk-Nielsen</div>
            </div>
            <div class="container-fluid intro-container appear" id="intro-container-9">
                <span class="decoded-intro" id="intro9"></span>
            </div>
            <div class="glitch-wrapper">
                <div class="glitch text-layer-credits-one text-layer-1">Volkan Pekdas</div>
                <div class="glitch text-layer-credits-one text-layer-2">Volkan Pekdas</div>
                <div class="glitch text-layer-credits-one text-layer-3">Volkan Pekdas</div>
            </div>
            <div class="container-fluid intro-container appear" id="intro-container-10">
                <span class="decoded-intro" id="intro10"></span>
            </div>
            <div class="glitch-wrapper">
                <div class="glitch text-layer-credits-one text-layer-1">Léonard Delbecq</div>
                <div class="glitch text-layer-credits-one text-layer-2">Léonard Delbecq</div>
                <div class="glitch text-layer-credits-one text-layer-3">Léonard Delbecq</div>
            </div>
            <div class="container-fluid intro-container appear" id="intro-container-11">
                <span class="decoded-intro" id="intro11"></span>
            </div>
            <div class="glitch-wrapper">
                <div class="glitch text-layer-credits-one text-layer-1">Ronen Shay</div>
                <div class="glitch text-layer-credits-one text-layer-2">Ronen Shay</div>
                <div class="glitch text-layer-credits-one text-layer-3">Ronen Shay</div>
            </div>
            <div class="container-fluid intro-container appear" id="intro-container-12">
                <span class="decoded-intro" id="intro12"></span>
            </div>`;
    }
}
