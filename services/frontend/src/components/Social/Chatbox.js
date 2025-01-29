import { Component } from "../../micro";
import { getOriginNoProtocol, post, fetchApi } from "/utils";

export default class Chatbox extends Component {
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

    // TODO: Add the timestamp.
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

    findSender(userlist, actualName) {
        for (let i = 0; i < userlist.length; i++) {
            if (userlist[i] !== actualName) {
                return userlist[i];
            }
        }
    }

    // Ensure that a request of channel creation is done only if there is no common channel between 2 person.
    doesHaveCommonChannel() {
        for (const [key, channelInfo] of this.wsChannelMap.entries()) {
            if (channelInfo.personName === this.chattingWith) {
                return true;
            }
        }
        return false;
    }

    // Event listener for each WS.
    listenToWebSocketChannels() {
        for (const [ws, channelInfo] of this.wsChannelMap.entries()) {
            ws.onmessage = (event) => {
                const data = JSON.parse(event.data);

                if (data.type === "channel_list") {
                    for (let i = 0; i < data.channelList.length; i++) {
                        const channelInfo = { channelUrl: data.channelList[i], personName: data.discussingWith[i] };

                        const newChannelUrl = `wss://${getOriginNoProtocol()}/ws/chat/${data.channelList[i]}`;
                        const newWs = new WebSocket(newChannelUrl);

                        // Set event handlers for the new WebSocket
                        newWs.onopen = () => {};

                        newWs.onmessage = (event) => {
                            const messageData = JSON.parse(event.data);
                            console.log("channel_list | New WebSocket message received: ", messageData);

                            if (messageData.type === "chat_message") {
                                const message = messageData.message;
                                const sender = messageData.sender;

                                if (this.info.nickname !== sender) {
                                    this.chattingWith = sender;
                                }

                                let discussion = document.getElementById("private-discussion-" + this.chattingWith);
                                this.addNewMessage(discussion, sender, message);
                            }
                        };

                        newWs.onerror = (event) => {
                            console.error(`channel_list | WebSocket error for channel: ${data.channel_name}`, event);
                        };

                        newWs.onclose = (event) => {
                            console.log(
                                `channel_list | WebSocket connection closed for channel: ${data.channel_name}`,
                                event
                            );
                        };

                        this.wsChannelMap.set(newWs, channelInfo);
                    }
                }

                if (data.type === "channel_created") {
                    for (let i = 0; i < data.userlist.length; i++) {
                        // Check if the user is in the list. If it's the case, then add to his channel map.
                        if (data.userlist[i] === this.info.nickname) {
                            const newChannelUrl = `wss://${getOriginNoProtocol()}/ws/chat/${data.channel_name}`;
                            const newWs = new WebSocket(newChannelUrl);

                            const sender = this.findSender(data.userlist, this.info.nickname);
                            this.chattingWith = sender;

                            const channelInfo = { channelUrl: data.channel_name, personName: sender };

                            // Set event handlers for the new WebSocket
                            newWs.onopen = () => {};

                            newWs.onmessage = (event) => {
                                const messageData = JSON.parse(event.data);
                                console.log("channel_created | New WebSocket message received: ", messageData);

                                if (messageData.type === "chat_message") {
                                    const message = messageData.message;
                                    const sender = messageData.sender;

                                    let discussion = document.getElementById("private-discussion-" + this.chattingWith);
                                    this.addNewMessage(discussion, sender, message);
                                }
                            };

                            newWs.onerror = (event) => {
                                console.error(`WebSocket error for channel: ${data.channel_name}`, event);
                            };

                            newWs.onclose = (event) => {
                                console.log(`WebSocket connection closed for channel: ${data.channel_name}`, event);
                            };

                            this.wsChannelMap.set(newWs, channelInfo);
                        }
                    }
                }
            };
        }
    }

    createDiscussionContainer(chattingWith) {
        const discussionContainer = document.createElement("div");
        discussionContainer.className = "container-fluid chat-message-container";
        discussionContainer.id = "private-discussion-" + chattingWith;

        this.chatContainer.insertBefore(discussionContainer, this.writeArea);

        discussionContainer.style.display = "none";
    }

    // Hide all discussions except the one that the user is actually on.
    showDiscussion() {
        const discussions = document.querySelectorAll(".container-fluid.chat-message-container");

        discussions.forEach((discussion) => {
            discussion.style.display = "none";
        });

        const discussionToShow = document.getElementById("private-discussion-" + this.chattingWith);

        discussionToShow.style.display = "flex";
    }

    async init() {
        // Each user will add different channels to their map if they are included in the userlist.
        this.wsChannelMap = new Map();
        this.chattingWith = "";

        this.onready = async () => {
            this.info = await post("/api/player/c/nickname").then((res) => res.json());

            // Load userlist.
            this.usersList = await fetchApi("/api/usersList", {})
                .then((res) => res.json())
                .catch((err) => {});

            // ! Testing purpose for now. 
            this.history = await fetchApi("/api/chat/ec8c5869-e1d4-4595-9263-bba2e6e62901", {})
                .then((res) => {
                    console.log("Fetched history data:", res.json());
                    return res;
                })
                .catch((err) => {
                    console.error("Error fetching history:", err);
                });

            this.chatContainer = document.getElementById("chat-container");
            this.writeArea = document.getElementById("writeTextArea");
            const personContainer = document.getElementById("person-container");

            // Load all registered user on phone.
            // TODO: Load discussion history.
            for (let i = 0; i < this.usersList.length; i++) {
                if (this.usersList[i].nickname !== this.info.nickname) {
                    this.addNewPerson(personContainer, this.usersList[i].nickname, "/img/Outer-Wilds/Giants-Deep.png");
                    this.createDiscussionContainer(this.usersList[i].nickname);
                }
            }

            const persons = document.querySelectorAll(".person");
            persons.forEach((person) => {
                person.addEventListener("click", () => {
                    this.chatContainer.style.display = "flex";
                    personContainer.style.display = "none";
                    this.chattingWith = person.querySelector(".chat-profile-name").innerHTML;

                    this.showDiscussion();

                    if (!this.doesHaveCommonChannel()) {
                        this.generalWs.send(
                            JSON.stringify({
                                type: "create_channel",
                                userlist: [this.info.nickname, this.chattingWith],
                            })
                        );
                    }
                });
            });

            // Allow me to align left if you are sender, or right if you are not the sender.
            const messages = document.querySelectorAll(".container-fluid-message");
            messages.forEach((message) => {
                const sender = message.getAttribute("sender");

                if (sender === "other") {
                    message.classList.add("sender-other");
                } else {
                    message.classList.add("sender-me");
                }
            });

            // Connect to a global WS, everybody is in there. For now there should be only channel creation type event.
            // So all channel requests are sent in general, each user listens to the general channel and checks if he is in the userlist.
            // If it's the case, then he will add the dedicated WS with the URL and listen to it too.
            const channelInfo = { channelUrl: "general", personName: "general" };
            this.generalWs = new WebSocket(`wss://${getOriginNoProtocol()}/ws/chat/general`);
            this.wsChannelMap.set(this.generalWs, channelInfo);

            // TODO (1): Since everybody checks the list, I must code a security in the backend to ensure that
            // TODO (1): If the person is not in the list, he should not be connected to the WS channel.
            // TODO (1): The function will probably take an user ID and channel name in the backend.
            // This is a sort of main loop, creation of channels comes here. Of course, messages are sent in the generated channel.
            this.generalWs.onopen = (event) => {
                this.listenToWebSocketChannels();
            };

            this.generalWs.onmessage = (event) => {
                const data = JSON.parse(event.data);

                console.log("generalWs: ", data);
            };

            const sendBtn = document.getElementById("send-btn");

            sendBtn.addEventListener("click", () => {
                const msg = this.writeArea.value;

                let ws = null;
                let channelName = null;

                // FInd the ws and channel_name for specified person.
                for (const [key, channelInfo] of this.wsChannelMap.entries()) {
                    if (channelInfo.personName === this.chattingWith && channelInfo.personName) {
                        ws = key;
                        channelName = channelInfo.channelUrl;
                        break;
                    }
                }

                if (ws && channelName) {
                    ws.send(
                        JSON.stringify({
                            type: "send_message",
                            content: msg,
                            sender: this.info.nickname,
                            receiver: this.chattingWith,
                            channel_name: channelName,
                            timestamp: "",
                        })
                    );
                } else {
                    console.warn("cannot send message, ws and channel name not found.");
                }

                // Clear the input area.
                this.writeArea.value = "";
            });

            const backBtn = document.getElementById("back-btn");

            backBtn.addEventListener("click", () => {
                this.chatContainer.style.display = "none";
                personContainer.style.display = "flex";
            });
        };
    }

    // TODO: Update dynamically the header.
    render() {
        return /* HTML */ ` <div id="SG-001">
            <div id="screen">
                <ul class="container-fluid person-container" id="person-container">
                    <textarea class="form-control" id="search-bar" rows="3" placeholder="Search a person..."></textarea>
                </ul>
                <div class="container-fluid chat-container" id="chat-container">
                    <div class="container-fluid chat-header" id="actual-chat-header"></div>
                    <textarea
                        class="form-control"
                        id="writeTextArea"
                        rows="3"
                        placeholder="Write your message..."
                    ></textarea>
                </div>
            </div>
            <div id="support"></div>
            <div id="middle-button"></div>
            <div id="bottom-button">
                <div class="numpad-line">
                    <svg id="up" viewBox="0 0 200 100" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                        <polygon points="-20,0 220,0 200,80 0,80" style="fill:black;stroke-width:1" />
                        <line
                            x1="40%"
                            y1="60%"
                            x2="60%"
                            y2="60%"
                            style="stroke:white;stroke-width:2; stroke-opacity:1"
                        />
                    </svg>
                </div>
                <div class="numpad-line arrow">
                    <svg
                        id="back-btn"
                        viewBox="0 0 200 100"
                        width="100%"
                        height="100%"
                        xmlns="http://www.w3.org/2000/svg"
                        preserveAspectRatio="none"
                    >
                        <polygon points="0,-50 150,0 150,100 0,150" style="fill:black;stroke-width:1" />
                        <line
                            x1="50%"
                            y1="50%"
                            x2="70%"
                            y2="50%"
                            style="stroke:white;stroke-width:2; stroke-opacity:1"
                        />
                    </svg>
                    <svg
                        id="send-btn"
                        viewBox="0 -10 150 80"
                        width="100%"
                        height="100%"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <polygon points="0,0 100,0 100,60 0,60" style="fill:black;stroke-width:1" />
                    </svg>
                    <svg
                        id="right"
                        viewBox="0 0 200 100"
                        width="100%"
                        height="100%"
                        xmlns="http://www.w3.org/2000/svg"
                        preserveAspectRatio="none"
                    >
                        <polygon points="0,0 150,-50 150,150 0,100" style="fill:black;stroke-width:1" />
                        <line
                            x1="5%"
                            y1="50%"
                            x2="25%"
                            y2="50%"
                            style="stroke:white;stroke-width:2; stroke-opacity:1"
                        />
                    </svg>
                </div>
                <div class="numpad-line">
                    <svg id="call" viewBox="0 0 200 100" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                        <polygon points="0,50 200,0 200,100 0,100" style="fill:black;stroke-width:1" />
                    </svg>
                    <svg id="down" viewBox="0 0 200 100" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                        <polygon points="0,20 200,20 220,100 -20,100" style="fill:black;stroke-width:1" />
                        <line
                            x1="40%"
                            y1="30%"
                            x2="60%"
                            y2="30%"
                            style="stroke:white;stroke-width:2; stroke-opacity:1"
                        />
                    </svg>
                    <svg
                        id="end-call"
                        viewBox="0 0 200 100"
                        width="100%"
                        height="100%"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <polygon points="0,0 200,50 200,100 0,100" style="fill:black;stroke-width:1" />
                    </svg>
                </div>
                <div class="numpad-line">
                    <div class="numpad-buttons">
                        <div class="kana">あ</div>
                        <div class="number">1</div>
                        <div class="letter">A<br />B<br />C</div>
                    </div>
                    <div class="numpad-buttons">
                        <div class="kana">か</div>
                        <div class="number">2</div>
                        <div class="letter">D<br />E<br />F</div>
                    </div>
                    <div class="numpad-buttons">
                        <div class="kana">さ</div>
                        <div class="number">3</div>
                        <div class="letter">G<br />H<br />I</div>
                    </div>
                </div>
                <div class="numpad-line">
                    <div class="numpad-buttons">
                        <div class="kana">た</div>
                        <div class="number">4</div>
                        <div class="letter">J<br />K<br />L</div>
                    </div>
                    <div class="numpad-buttons">
                        <div class="kana">な</div>
                        <div class="number">5</div>
                        <div class="letter">M<br />N<br />O</div>
                    </div>
                    <div class="numpad-buttons">
                        <div class="kana">は</div>
                        <div class="number">6</div>
                        <div class="letter">P<br />Q<br />R<br /></div>
                    </div>
                </div>
                <div class="numpad-line">
                    <div class="numpad-buttons">
                        <div class="kana">ま</div>
                        <div class="number">7</div>
                        <div class="letter">S<br />T<br />U</div>
                    </div>
                    <div class="numpad-buttons">
                        <div class="kana">や</div>
                        <div class="number">8</div>
                        <div class="letter">V<br />W<br />X</div>
                    </div>
                    <div class="numpad-buttons">
                        <div class="kana">こ</div>
                        <div class="number">9</div>
                        <div class="letter">Y<br />Z</div>
                    </div>
                </div>
                <div class="numpad-line">
                    <div class="numpad-buttons">
                        <div class="kana">゛</div>
                        <div class="number">*</div>
                        <div class="letter">記<br />号</div>
                    </div>
                    <div class="numpad-buttons">
                        <div class="kana">わ</div>
                        <div class="number">0</div>
                        <div class="letter">\\<br />°<br />-</div>
                    </div>
                    <div class="numpad-buttons">
                        <div class="kana">←</div>
                        <div class="number">#</div>
                        <div class="letter">マ<br />ナ<br />|</div>
                    </div>
                </div>
            </div>
        </div>`;
    }
}
