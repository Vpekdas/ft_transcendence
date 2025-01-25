import { Component } from "../../micro";
import { getOriginNoProtocol, post } from "/utils";

export default class Chatbox extends Component {
    // ! For now, the sender doesn't know who they are talking to x) since they are both entering the test channel.
    // ! I should create a custom channel, and I will collect the 2 people and properly create the person in the person container.
    addNewPerson(personContainer, fullname, picture) {
        const li = document.createElement("li");
        li.classList.add("person");

        const img = document.createElement("img");
        img.classList.add("chat-profile-picture");
        img.src = picture;

        const span = document.createElement("span");
        span.classList.add("chat-profile-name");
        span.textContent = fullname;

        const statusContainer = document.createElement("div");
        statusContainer.classList.add("status-container");

        const svg = document.createElement("svg");
        svg.classList.add("status");
        svg.setAttribute("height", "100");
        svg.setAttribute("width", "100");
        svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
        svg.innerHTML = this.createStatus(true);

        statusContainer.appendChild(svg);
        li.appendChild(img);
        li.appendChild(span);
        li.appendChild(statusContainer);
        personContainer.appendChild(li);
    }

    isPersonAlreadyInList(chatPersonList, name) {
        const countMap = new Map();

        chatPersonList.forEach((person) => {
            const key = person.textContent;
            // If the key is already there (meaning the person was already counted), increment the value.
            // The value represents the number of occurrences of the name.
            countMap.set(key, (countMap.get(key) || 0) + 1);
        });

        return countMap.get(name) !== 0;
    }

    // TODO Add the timestamp :)
    addNewMessage(discussionContainer, sender, message) {
        const messageContainer = document.createElement("div");
        messageContainer.classList.add("container-fluid-message");
        messageContainer.classList.add("sender", sender !== this.info.nickname ? "sender-other" : "sender-me");

        const messageContent = document.createElement("p");
        messageContent.textContent = message;

        messageContainer.appendChild(messageContent);

        discussionContainer.appendChild(messageContainer);
    }

    // ! Try to make the circle responsive by adapting cx and cy.
    createStatus(isOnline) {
        const color = isOnline ? "green" : "red";
        return /* HTML */ ` <circle r="5" cx="22" cy="18" fill="${color}" /> `;
    }

    async init() {
        this.info = await post("/api/player/c/nickname").then((res) => res.json());

        this.onready = () => {
            const messages = document.querySelectorAll(".container-fluid-message");
            const discussionContainer = document.getElementById("discussion-container");
            const personContainer = document.getElementById("person-container");

            messages.forEach((message) => {
                message.innerHTML = this.generateRandomText();
                const sender = message.getAttribute("sender");

                if (sender === "other") {
                    message.classList.add("sender-other");
                } else {
                    message.classList.add("sender-me");
                }
            });

            const closeBtn = document.getElementById("close-chat-btn");

            closeBtn.addEventListener("click", () => {
                const chatbox = document.getElementById("chatbox");
                chatbox.style.display = "none";
            });

            const sendBtn = document.getElementById("send-btn");

            sendBtn.addEventListener("click", () => {
                const msg = document.getElementById("writeTextArea").value;

                this.ws.send(
                    JSON.stringify({
                        type: "message",
                        content: msg,
                        sender: this.info.nickname,
                        timestamp: "",
                    })
                );
            });

            // TODO: Create a unique channel.
            this.ws = new WebSocket(`wss://${getOriginNoProtocol()}/ws/chat/test`);

            this.ws.onopen = async () => {};

            this.ws.onmessage = async (event) => {
                const data = JSON.parse(event.data);
                const message = data.message;
                const sender = data.sender;

                const chatPersonList = document.querySelectorAll(".person");

                if (chatPersonList.length === 0 || !this.isPersonAlreadyInList(chatPersonList, sender)) {
                    this.addNewPerson(personContainer, sender, "/img/Outer-Wilds/Giants-Deep.png");
                }

                this.addNewMessage(discussionContainer, sender, message);
            };
        };
    }

    // TODO: Update dynamically the header.
    render() {
        return /* HTML */ ` <div class="container-fluid chatbox-container" id="chatbox">
            <ul class="container-fluid person-container" id="person-container"></ul>
            <div class="container-fluid chat-container">
                <div class="container-fluid chat-header" id="actual-chat-header">
                    <button type="button" class="btn btn-danger close-button" id="close-chat-btn">Close</button>
                </div>
                <div class="container-fluid chat-message-container" id="discussion-container"></div>
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
                        <button type="button" class="btn btn-primary send-button" id="send-btn">Send</button>
                    </div>
                </div>
            </div>
        </div>`;
    }
}
