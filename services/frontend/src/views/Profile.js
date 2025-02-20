import { Component, params } from "../micro";
import { INTRO } from "../constant";

/** @type {import("../micro").Component} */
export default class Profile extends Component {
    async init() {
        // this.animatedIntroArray = [];

        this.onready = () => {
            const introContainer = document.getElementById("intro4");
            this.decodeEffect(INTRO[3], introContainer);

            const pacman = document.getElementsByClassName("pacman")[0];
            window.addEventListener("scroll", function (e) {
                var perc =
                    (e.target.scrollingElement.scrollTop /
                        (e.target.scrollingElement.scrollHeight - window.innerHeight + 64)) *
                    100;
                pacman.style.top = `calc(2px + ${perc}%)`;
            });
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
            <div class="scrollbar">
                <div class="pacman"></div>
            </div>
        `;
    }
}
