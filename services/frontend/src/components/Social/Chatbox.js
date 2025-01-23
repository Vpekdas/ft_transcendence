import { Component } from "../../micro";

export default class Chatbox extends Component {
    createPerson(picture, fullname) {
        return `<li class="person">
            <img class="chat-profile-picture" src="${picture}" />
            <span class="chat-profile-name">${fullname}</span>
            <div class="status-container">
                <svg class="status" height="100" width="100" xmlns="http://www.w3.org/2000/svg">
                    ${this.createStatus(true)}
                </svg>
            </div>
        </li>`;
    }

    // ! Try to make the circle responsive by adapting cx and cy.
    createStatus(isOnline) {
        const color = isOnline ? "green" : "red";
        return /* HTML */ ` <circle r="5" cx="22" cy="18" fill="${color}" /> `;
    }

    generateRandomSender() {
        if (Math.random() < 0.5) {
            return `<div class="container-fluid-message" sender="me"></div>`;
        } else {
            return `<div class="container-fluid-message" sender="other"></div>`;
        }
    }

    generateRandomText() {
        const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        let randomText = "";
        const length = Math.floor(Math.random() * 100 + 1);

        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * charset.length);
            randomText += charset[randomIndex];
        }

        return randomText;
    }

    async init() {
        this.person = "";

        for (let i = 0; i < 42; i++) {
            this.person += this.createPerson("/img/Outer-Wilds/Timber-Hearth.png", this.generateRandomText());
        }

        this.discussion = "";

        for (let i = 0; i < 42; i++) {
            this.discussion += this.generateRandomSender();
        }

        this.onready = () => {
            const messages = document.querySelectorAll(".container-fluid-message");

            messages.forEach((message) => {
                message.innerHTML = this.generateRandomText();
                const sender = message.getAttribute("sender");

                if (sender === "other") {
                    message.classList.add("sender-other");
                } else if (sender === "me") {
                    message.classList.add("sender-me");
                }
            });

            const closeBtn = document.getElementById("close-chat-btn");

            closeBtn.addEventListener("click", () => {
                const chatbox = document.getElementById("chatbox");
                chatbox.style.display = "none";
            });
        };
    }

    render() {
        return /* HTML */ ` <div class="container-fluid chatbox-container" id="chatbox">
            <ul class="container-fluid person-container">
                ${this.person}
            </ul>
            <div class="container-fluid chat-container">
                <div class="container-fluid chat-header">
                    ${this.createPerson("/img/Outer-Wilds/Timber-Hearth.png", "Fullname")}
                    <button type="button" class="btn btn-danger close-button" id="close-chat-btn">Close</button>
                </div>
                <div class="container-fluid chat-message-container">${this.discussion}</div>
                <div class="container-fluid chat-input-container">
                    <div class="container-fluid chat-write-message">
                        <textarea
                            class="form-control"
                            id="writeTextArea"
                            rows="3"
                            placeholder="Write your message..."
                        ></textarea>
                    </div>
                    <div class="container-fluid chat-button-message">
                        <button type="button" class="btn btn-primary invite-button">Invite</button>
                        <button type="button" class="btn btn-primary send-button">Send</button>
                    </div>
                </div>
            </div>
        </div>`;
    }
}
