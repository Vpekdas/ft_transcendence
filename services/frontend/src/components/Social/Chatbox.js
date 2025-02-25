import { Component, navigateTo } from "../../micro";
import { getOriginNoProtocol, post, fetchApi, showToast, getNickname, getUserIdByNickname, api } from "/utils";

export default class Chatbox extends Component {
    async addNewPerson(personContainer, fullname, picture, colorStatus) {
        const li = document.createElement("li");
        li.classList.add("person");

        const idToNickname = await getNickname(fullname);

        // Can identify quickly the sender, I can maybe optimize some part of code with that.
        li.setAttribute("data-sender", fullname);

        const img = document.createElement("img");
        img.classList.add("chat-profile-picture");
        img.src = picture;

        const span = document.createElement("span");
        span.classList.add("chat-profile-name");
        span.textContent = idToNickname;

        const statusContainer = document.createElement("div");
        statusContainer.classList.add("status-container");

        const svg = document.createElement("svg");
        svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
        svg.setAttribute("viewBox", "0 0 40 40");
        svg.setAttribute("width", "40");
        svg.setAttribute("height", "40");

        svg.innerHTML = this.createStatus(colorStatus);

        statusContainer.appendChild(svg);
        li.appendChild(img);
        li.appendChild(span);
        li.appendChild(statusContainer);

        const notificationIndicator = document.createElement("div");
        notificationIndicator.classList.add("notification-indicator");

        li.appendChild(notificationIndicator);

        li.addEventListener("click", () => {
            li.classList.remove("new-message");
            this.userInteracted = true;
        });

        personContainer.appendChild(li);

        return li;
    }

    createStatus(colorStatus) {
        return /* HTML */ `
            <svg class="circle-status" xmlns="http://www.w3.org/2000/svg">
                <circle class="circle-color" r="10" cx="50%" cy="50%" fill="${colorStatus}" />
            </svg>
        `;
    }

    // TODO: Add the timestamp.
    addNewMessage(discussionContainer, sender, message) {
        const messageContainer = document.createElement("div");
        messageContainer.classList.add("container-fluid-message");
        messageContainer.classList.add("sender", sender != this.id ? "sender-other" : "sender-me");

        const messageContent = document.createElement("p");
        messageContent.textContent = message;

        messageContainer.appendChild(messageContent);

        discussionContainer.appendChild(messageContainer);
    }

    findSender(userlist, actualId) {
        for (let i = 0; i < userlist.length; i++) {
            if (userlist[i] != actualId) {
                return userlist[i];
            }
        }
    }

    // Ensure that a request of channel creation is done only if there is no common channel between 2 person.
    doesHaveCommonChannel() {
        for (const [key, channelInfo] of this.wsChannelMap.entries()) {
            if (channelInfo.personId == this.chattingWithId) {
                return true;
            }
        }
        return false;
    }

    // Event listener for each WS.
    async listenToWebSocketChannels() {
        for (const [ws, channelInfo] of this.wsChannelMap.entries()) {
            ws.onmessage = async (event) => {
                const data = JSON.parse(event.data);
                const messageData = JSON.parse(event.data);

                console.log(data);

                if (data.type === "channel_list") {
                    for (let i = 0; i < data.channelList.length; i++) {
                        const channelInfo = { channelUrl: data.channelList[i], personId: data.discussingWith[i] };

                        const newChannelUrl = `wss://${getOriginNoProtocol()}/ws/chat/${data.channelList[i]}`;
                        const newWs = new WebSocket(newChannelUrl);

                        this.history = fetchApi("/api/chat/" + data.channelList[i], {})
                            .then((res) => res.json())
                            .then((res) => {
                                res.messages.forEach((message) => {
                                    let sender = this.id == message.sender ? message.receiver : message.sender;

                                    const discussion = document.getElementById("private-discussion-" + sender);

                                    this.addNewMessage(discussion, message.sender, message.content);
                                });
                            })
                            .catch((err) => {
                                console.error("Error fetching history:", err);
                            });

                        // Set event handlers for the new WebSocket
                        newWs.onopen = () => {};

                        newWs.onmessage = async (event) => {
                            const messageData = JSON.parse(event.data);

                            if (messageData.type === "chat_message") {
                                const message = messageData.message;
                                const sender = messageData.sender;
                                const idToNickname = await getNickname(sender);

                                if (this.id != sender) {
                                    this.chattingWithId = sender;
                                    showToast("You received a message from " + idToNickname, "bi bi-bell");
                                    const senderLi = document.querySelector(`.person[data-sender="${sender}"]`);
                                    if (senderLi) {
                                        senderLi.classList.add("new-message");
                                    }
                                    if (this.userInteracted) {
                                        this.notification.play();
                                    }
                                }

                                let discussion = document.getElementById("private-discussion-" + this.chattingWithId);
                                if (discussion) {
                                    this.addNewMessage(discussion, sender, message);
                                }
                            }
                        };

                        newWs.onerror = (event) => {};

                        newWs.onclose = (event) => {};

                        this.wsChannelMap.set(newWs, channelInfo);
                    }
                }

                if (data.type === "channel_created") {
                    for (let i = 0; i < data.userlist.length; i++) {
                        // Check if the user is in the list. If it's the case, then add to his channel map.
                        if (data.userlist[i] == this.id) {
                            const newChannelUrl = `wss://${getOriginNoProtocol()}/ws/chat/${data.channel_name}`;
                            const newWs = new WebSocket(newChannelUrl);

                            const sender = this.findSender(data.userlist, this.id);
                            this.chattingWithId = sender;

                            const channelInfo = { channelUrl: data.channel_name, personId: sender };

                            // Set event handlers for the new WebSocket
                            newWs.onopen = () => {};

                            newWs.onmessage = async (event) => {
                                const messageData = JSON.parse(event.data);

                                if (messageData.type === "chat_message") {
                                    const message = messageData.message;
                                    const sender = messageData.sender;
                                    const idToNickname = await getNickname(sender);

                                    if (this.id != sender) {
                                        this.chattingWithId = sender;
                                        showToast("You received a message from " + idToNickname, "bi bi-bell");
                                        const senderLi = document.querySelector(`.person[data-sender="${sender}"]`);
                                        if (senderLi) {
                                            senderLi.classList.add("new-message");
                                        }
                                        if (this.userInteracted) {
                                            this.notification.play();
                                        }
                                    }

                                    let discussion = document.getElementById(
                                        "private-discussion-" + this.chattingWithId
                                    );
                                    this.addNewMessage(discussion, sender, message);
                                }
                            };

                            newWs.onerror = (event) => {};

                            newWs.onclose = (event) => {};

                            this.wsChannelMap.set(newWs, channelInfo);
                        }
                    }
                }

                if (data.type === "online_users") {
                    const persons = document.querySelectorAll(".person");
                    for (let i = 0; i < data.online_users.length; i++) {
                        persons.forEach((person) => {
                            const id = person.getAttribute("data-sender");
                            if (data.online_users[i] == id && id != this.id) {
                                const status = person.querySelector(".circle-color").setAttribute("fill", "green");
                            }
                        });
                    }
                }

                if (data.type === "user_status") {
                    const persons = document.querySelectorAll(".person");

                    let find = false;
                    persons.forEach((person) => {
                        const status = person.querySelector(".circle-color");
                        const id = person.getAttribute("data-sender");

                        if (data.user != this.id && data.user == id) {
                            find = true;
                            if (data.status === "online") {
                                status.setAttribute("fill", "green");
                            } else {
                                status.setAttribute("fill", "red");
                            }
                        }
                    });

                    // Ensure that If a new person register, I also add him in list since the userlist is not updated yet.
                    if (!find && data.user != this.id) {
                        const personContainer = document.getElementById("person-container");

                        const newPersonElement = await this.addNewPerson(
                            personContainer,
                            data.user,
                            api("/api/player/" + data.user + "/picture"),
                            "green"
                        );

                        // Ensure that you can directly speak with new registered user.
                        newPersonElement.addEventListener("click", async () => {
                            this.userInteracted = true;
                            this.chatContainer.style.display = "flex";
                            personContainer.style.display = "none";
                            this.chattingWithId = newPersonElement.getAttribute("data-sender");
                            this.createDiscussionContainer(this.chattingWithId);

                            await this.updateChatHeader(
                                this.chattingWithId,
                                api("/api/player/" + this.chattingWithId + "/picture")
                            );

                            this.showDiscussion();

                            if (!this.doesHaveCommonChannel()) {
                                this.generalWs.send(
                                    JSON.stringify({
                                        type: "create_channel",
                                        userlist: [this.id, this.chattingWithId],
                                    })
                                );
                            }
                        });

                        this.personMap.set(data.user, newPersonElement);

                        const status = newPersonElement.querySelector(".circle-color");

                        status.setAttribute("fill", "green");
                    }
                }

                if (messageData.type === "chat_message") {
                    const message = messageData.message;
                    const sender = messageData.sender;

                    if (this.id != sender) {
                        this.chattingWithId = sender;
                        const idToNickname = await getNickname(sender);
                        showToast("You received a message from " + idToNickname, "bi bi-bell");
                        const senderLi = document.querySelector(`.person[data-sender="${sender}"]`);
                        if (senderLi) {
                            senderLi.classList.add("new-message");
                        }
                        if (this.userInteracted) {
                            this.notification.play();
                        }
                    }

                    let discussion = document.getElementById("private-discussion-" + this.chattingWithId);
                    this.addNewMessage(discussion, sender, message);
                }

                if (messageData.type === "error") {
                    const message = messageData.message;
                    showToast(message, "bi bi-bell");
                }

                if (messageData.type === "create_game") {
                    const gameId = messageData.game_id;
                    navigateTo("/play/pong/" + gameId);
                }
            };
        }
    }

    createDiscussionContainer(chattingWithId) {
        const discussionContainer = document.createElement("div");
        discussionContainer.className = "container-fluid chat-message-container";
        discussionContainer.id = "private-discussion-" + chattingWithId;

        this.chatContainer.insertBefore(discussionContainer, this.writeArea);

        discussionContainer.style.display = "none";
    }

    // Hide all discussions except the one that the user is actually on.
    showDiscussion() {
        const discussions = document.querySelectorAll(".container-fluid.chat-message-container");

        discussions.forEach((discussion) => {
            discussion.style.display = "none";
        });

        const discussionToShow = document.getElementById("private-discussion-" + this.chattingWithId);

        discussionToShow.style.display = "flex";
    }

    async showSearchBarResult() {
        this.searchingArray.length = 0;
        let idToNickname = "";
        let fillColor = "";

        for (const [key, element] of this.personMap.entries()) {
            idToNickname = await getNickname(key);
            fillColor = element.querySelector(".status-container .circle-status .circle-color").getAttribute("fill");

            if (this.searching == idToNickname.substring(0, this.searching.length)) {
                const matching = { key: key, colorStatus: fillColor };
                this.searchingArray.push(matching);
            }
        }

        const personContainer = document.getElementById("person-container");
        const persons = document.querySelectorAll(".person");

        persons.forEach((person) => {
            person.remove();
        });

        for (const [key, element] of this.personMap.entries()) {
            for (let i = 0; i < this.searchingArray.length; i++) {
                if (this.searchingArray[i].key == key) {
                    await this.addNewPerson(
                        personContainer,
                        this.searchingArray[i].key,
                        api("/api/player/" + key + "/picture"),
                        this.searchingArray[i].colorStatus
                    );
                }
            }
        }

        const newPersons = document.querySelectorAll(".person");

        newPersons.forEach((person) => {
            person.addEventListener("click", async () => {
                this.userInteracted = true;
                this.chatContainer.style.display = "flex";
                personContainer.style.display = "none";
                this.chattingWithId = person.getAttribute("data-sender");

                await this.updateChatHeader(
                    this.chattingWithId,
                    api("/api/player/" + this.chattingWithId + "/picture")
                );

                this.showDiscussion();

                if (!this.doesHaveCommonChannel()) {
                    this.generalWs.send(
                        JSON.stringify({
                            type: "create_channel",
                            userlist: [this.id, this.chattingWithId],
                        })
                    );
                }
            });
        });
    }

    async updateChatHeader(fullname, picture) {
        this.chatHeader.innerHTML = "";
        const idToNickname = await getNickname(fullname);

        const img = document.createElement("img");
        img.classList.add("chat-profile-picture");
        img.src = picture;

        const [otherProfileNickname, setOtherProfileNickname] = this.usePersistent("otherProfileNickname", "");

        img.addEventListener("click", async () => {
            setOtherProfileNickname(idToNickname);
            this.userInteracted = true;
        });

        const i = document.createElement("i");
        i.classList.add("bi", "bi-heart-fill");

        i.addEventListener("click", async () => {
            const response = await post("/api/add-friend/" + fullname, {})
                .then((res) => res.json())
                .catch((err) => {
                    showToast("An error occurred. Please try again.", "bi bi-exclamation-triangle-fill");
                });
            if (response.error) {
                showToast(response.error, "bi bi-exclamation-triangle-fill");
            } else {
                showToast("Friend added successfully.", "bi bi-check-circle-fill");
            }
        });

        const span = document.createElement("span");
        span.classList.add("chat-profile-name");
        span.textContent = idToNickname;

        const blockBtn = document.createElement("button");
        blockBtn.classList.add("btn", "btn-danger", "block");
        blockBtn.innerHTML = "BLOCK";

        blockBtn.addEventListener("click", async () => {
            this.userInteracted = true;
            if (blockBtn.innerHTML === "BLOCK") {
                blockBtn.innerHTML = "UNBLOCK";
                const response = await post("/api/block-user/" + fullname, {})
                    .then((res) => res.json())
                    .catch((err) => {
                        showToast("An error occurred. Please try again.", "bi bi-exclamation-triangle-fill");
                    });
                if (response.error) {
                    showToast(response.error, "bi bi-exclamation-triangle-fill");
                } else {
                    showToast("User blocked successfully.", "bi bi-check-circle-fill");
                }
            } else if (blockBtn.innerHTML === "UNBLOCK") {
                blockBtn.innerHTML = "BLOCK";
                const response = await post("/api/unblock-user/" + fullname, {})
                    .then((res) => res.json())
                    .catch((err) => {
                        showToast("An error occurred. Please try again.", "bi bi-exclamation-triangle-fill");
                    });
                if (response.error) {
                    showToast(response.error, "bi bi-exclamation-triangle-fill");
                } else {
                    showToast("User unblocked successfully.", "bi bi-check-circle-fill");
                }
            }
        });

        const inviteBtn = document.createElement("button");
        inviteBtn.classList.add("btn", "btn-success", "invite");
        inviteBtn.innerHTML = "INVITE";

        inviteBtn.addEventListener("click", () => {
            let channelName = "";

            // FInd the channel_name for specified person.
            for (const [key, channelInfo] of this.wsChannelMap.entries()) {
                if (channelInfo.personId == this.chattingWithId && channelInfo.personId) {
                    channelName = channelInfo.channelUrl;
                    break;
                }
            }

            if (channelName) {
                console.log([this.id, this.chattingWithId]);
                this.generalWs.send(
                    JSON.stringify({
                        type: "create_game",
                        user_list: [this.id, this.chattingWithId],
                        channel_name: channelName,
                    })
                );
            }
        });

        this.chatHeader.appendChild(img);
        this.chatHeader.appendChild(i);
        this.chatHeader.appendChild(span);
        this.chatHeader.appendChild(blockBtn);
        this.chatHeader.appendChild(inviteBtn);

        await this.listenToWebSocketChannels();
    }

    clean() {
        for (const [key, channelInfo] of this.wsChannelMap.entries()) {
            key.close();
        }
    }

    async init() {
        // Each user will add different channels to their map if they are included in the userlist.
        this.wsChannelMap = new Map();
        this.personMap = new Map();
        this.searchingArray = [];
        this.searching = "";
        this.chattingWithId = "";
        this.userInteracted = false;

        this.onready = async () => {
            this.info = await post("/api/player/c/nickname")
                .then((res) => res.json())
                .catch((err) => {});

            // Load userlist.
            this.usersList = await fetchApi("/api/usersList", {})
                .then((res) => res.json())
                .catch((err) => {});

            this.chatContainer = document.getElementById("chat-container");
            this.writeArea = document.getElementById("messageArea");
            this.chatHeader = document.getElementById("actual-chat-header");
            this.phone = document.getElementById("SG-001");
            this.notification = document.getElementById("notification-sound");

            this.id = await getUserIdByNickname(this.info.nickname);

            const personContainer = document.getElementById("person-container");

            // Load all registered user on phone.
            for (let i = 0; i < this.usersList.length; i++) {
                if (this.usersList[i].user_id !== this.id) {
                    this.personMap.set(
                        this.usersList[i].user_id,
                        await this.addNewPerson(
                            personContainer,
                            this.usersList[i].user_id,
                            api("/api/player/" + this.usersList[i].user_id + "/picture"),
                            "red"
                        )
                    );
                    this.createDiscussionContainer(this.usersList[i].user_id);
                }
            }

            const persons = document.querySelectorAll(".person");
            persons.forEach((person) => {
                person.addEventListener("click", async () => {
                    this.userInteracted = true;
                    this.chatContainer.style.display = "flex";
                    personContainer.style.display = "none";
                    this.chattingWithId = person.getAttribute("data-sender");

                    await this.updateChatHeader(
                        this.chattingWithId,
                        api("/api/player/" + this.chattingWithId + "/picture")
                    );

                    this.showDiscussion();

                    if (!this.doesHaveCommonChannel()) {
                        this.generalWs.send(
                            JSON.stringify({
                                type: "create_channel",
                                userlist: [this.id, this.chattingWithId],
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
            const channelInfo = { channelUrl: "general", personId: "general" };
            this.generalWs = new WebSocket(`wss://${getOriginNoProtocol()}/ws/chat/general`);
            this.wsChannelMap.set(this.generalWs, channelInfo);

            // This is a sort of main loop, creation of channels comes here. Of course, messages are sent in the generated channel.
            this.generalWs.onopen = async (event) => {
                await this.listenToWebSocketChannels();
            };

            this.generalWs.onmessage = (event) => {};

            const sendBtn = document.getElementById("send-btn");

            sendBtn.addEventListener("click", async () => {
                this.userInteracted = true;
                const msg = this.writeArea.value;

                let ws = null;
                let channelName = null;

                // FInd the ws and channel_name for specified person.
                for (const [key, channelInfo] of this.wsChannelMap.entries()) {
                    if (channelInfo.personId == this.chattingWithId && channelInfo.personId) {
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
                            sender: this.id,
                            receiver: this.chattingWithId,
                            channel_name: channelName,
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
                this.userInteracted = true;
                this.chatContainer.style.display = "none";
                personContainer.style.display = "flex";
            });

            const searchingInput = document.getElementById("search-bar");

            searchingInput.addEventListener("input", async () => {
                this.searching = searchingInput.value;

                await this.showSearchBarResult();
            });

            const closeBtn = document.getElementById("end-call");

            closeBtn.addEventListener("click", () => {
                this.phone.classList.add("hide");
                this.userInteracted = true;
            });

            const dMailButton = document.getElementById("d-mail-button");

            dMailButton.addEventListener("click", () => {
                this.userInteracted = true;
                this.phone.classList.remove("hide");
                this.phone.style.display = "flex";
            });
        };
    }

    render() {
        const [otherProfileNickname, setOtherProfileNickname] = this.usePersistent("otherProfileNickname", "");

        return /* HTML */ `
            <div id="SG-001">
                <div id="screen">
                    <div class="container-fluid status-bar" id="status-bar">
                        <img id="bar-signal-icon" src="/img/SG-001/bar-signal.png" />
                        <img id="email-icon-status" src="/img/SG-001/email-icon-status.png" />
                        <img id="battery-icon" src="/img/SG-001/battery-icon.png" />
                    </div>
                    <ul class="container-fluid person-container" id="person-container">
                        <textarea
                            class="form-control"
                            id="search-bar"
                            rows="3"
                            placeholder="Search a person..."
                        ></textarea>
                    </ul>
                    <div class="container-fluid chat-container" id="chat-container">
                        <div class="container-fluid chat-header" id="actual-chat-header"></div>
                        <textarea
                            class="form-control"
                            id="messageArea"
                            rows="3"
                            placeholder="Write your message..."
                        ></textarea>
                    </div>
                </div>
                <div id="support">
                    <div class="decorative-line"></div>
                    <div class="decorative-line"></div>
                    <div class="decorative-dot"></div>
                    <div class="decorative-line"></div>
                    <div class="decorative-line"></div>
                </div>
                <div id="decorative-strip">
                    <div class="decorative-block-element">
                        <div class="decorative-shadow-top"></div>
                        <div class="decorative-shadow-bot"></div>
                    </div>
                    <div class="decorative-element">
                        <div class="decorative-shadow-top"></div>
                        <img src="/img/SG-001/email-icon.png" />
                        <div class="decorative-shadow-bot"></div>
                    </div>
                    <div class="decorative-separate-element">
                        <div class="decorative-shadow-top"></div>
                        <div class="decorative-shadow-bot"></div>
                    </div>
                    <div class="decorative-element">
                        <div class="decorative-shadow-top"></div>
                        <img src="/img/SG-001/information-icon.png" />
                        <div class="decorative-shadow-bot"></div>
                    </div>
                    <div class="decorative-separate-element">
                        <div class="decorative-shadow-top"></div>
                        <div class="decorative-shadow-bot"></div>
                    </div>
                    <div class="decorative-element">
                        <div class="decorative-shadow-top"></div>
                        <img src="/img/SG-001/book-icon.png" />
                        <div class="decorative-shadow-bot"></div>
                    </div>
                    <div class="decorative-separate-element">
                        <div class="decorative-shadow-top"></div>
                        <div class="decorative-shadow-bot"></div>
                    </div>
                    <div class="decorative-element">
                        <div class="decorative-shadow-top"></div>
                        <img src="/img/SG-001/camera-icon.png" />
                        <div class="decorative-shadow-bot"></div>
                    </div>
                    <div class="decorative-block-element">
                        <div class="decorative-shadow-top"></div>
                        <div class="decorative-shadow-bot"></div>
                    </div>
                </div>
                <div id="bottom-button">
                    <div class="numpad-line">
                        <svg
                            id="up"
                            viewBox="0 0 200 100"
                            width="100%"
                            height="100%"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <polygon points="-20,0 220,0 200,80 0,80" style="fill:black;stroke:black;stroke-width:25" />
                            <polygon
                                points="-20,0 220,0 200,80 0,80"
                                style="fill:silver; transform: scale(1.05); transform-origin: center;"
                            />
                            <polygon
                                points="-20,0 220,0 200,80 0,80"
                                style="fill:#1e1e1e;stroke-width:1 transform: scale(0.1); transform-origin: center;"
                            />
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
                            <polygon
                                points="0,-50 150,0 150,100 0,150"
                                style="fill:black;stroke:black;stroke-width:25"
                            />
                            <polygon
                                points="0,-50 150,0 150,100 0,150"
                                style="fill:silver; transform: scale(1.05); transform-origin: center;"
                            />
                            <polygon
                                points="0,-50 150,0 150,100 0,150"
                                style="fill:#1e1e1e;stroke-width:1 transform: scale(0.1); transform-origin: center;"
                            />
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
                            <polygon points="0,0 100,0 100,60 0,60" style="fill:black;stroke:black;stroke-width:25" />
                            <polygon
                                points="0,0 100,0 100,60 0,60"
                                style="fill:silver; transform: scale(1.05); transform-origin: center;"
                            />
                            <polygon
                                points="0,0 100,0 100,60 0,60"
                                style="fill:#1e1e1e;stroke-width:1 transform: scale(0.1); transform-origin: center;"
                            />
                        </svg>
                        <svg
                            id="right"
                            viewBox="0 0 200 100"
                            width="100%"
                            height="100%"
                            xmlns="http://www.w3.org/2000/svg"
                            preserveAspectRatio="none"
                        >
                            <polygon
                                points="0,0 150,-50 150,150 0,100"
                                style="fill:black;stroke:black;stroke-width:25"
                            />
                            <polygon
                                points="0,0 150,-50 150,150 0,100"
                                style="fill:silver; transform: scale(1.05); transform-origin: center;"
                            />
                            <polygon
                                points="0,0 150,-50 150,150 0,100"
                                style="fill:#1e1e1e;stroke-width:1 transform: scale(0.1); transform-origin: center;"
                            />
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
                        <svg
                            id="call"
                            viewBox="0 0 200 100"
                            width="100%"
                            height="100%"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <polygon
                                points="0,50 200,0 200,100 0,100"
                                style="fill:black;stroke:black;stroke-width:25"
                            />
                            <polygon
                                points="0,50 200,0 200,100 0,100"
                                style="fill:silver; transform: scale(1.05); transform-origin: center;"
                            />
                            <polygon
                                points="0,50 200,0 200,100 0,100"
                                style="fill:#1e1e1e;stroke-width:1 transform: scale(0.1); transform-origin: center;"
                            />
                            <image
                                href="/img/SG-001/call-icon.png"
                                x="70"
                                y="20"
                                width="80"
                                height="80"
                                preserveAspectRatio="xMidYMid slice"
                            />
                        </svg>
                        <svg
                            id="down"
                            viewBox="0 0 200 100"
                            width="100%"
                            height="100%"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <polygon
                                points="0,20 200,20 220,100 -20,100"
                                style="fill:black;stroke:black;stroke-width:25"
                            />
                            <polygon
                                points="0,20 200,20 220,100 -20,100"
                                style="fill:silver; transform: scale(1.05); transform-origin: center;"
                            />
                            <polygon
                                points="0,20 200,20 220,100 -20,100"
                                style="fill:#1e1e1e;stroke-width:1 transform: scale(0.1); transform-origin: center;"
                            />
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
                            <polygon
                                points="0,0 200,50 200,100 0,100"
                                style="fill:black;stroke:black;stroke-width:25"
                            />
                            <polygon
                                points="0,0 200,50 200,100 0,100"
                                style="fill:silver; transform: scale(1.05); transform-origin: center;"
                            />
                            <polygon
                                points="0,0 200,50 200,100 0,100"
                                style="fill:#1e1e1e;stroke-width:1 transform: scale(0.1); transform-origin: center;"
                            />
                            <image
                                href="/img/SG-001/end-call-icon.png"
                                x="50"
                                y="10"
                                width="80"
                                height="80"
                                preserveAspectRatio="xMidYMid slice"
                            />
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
            </div>
            <div id="d-mail-button">
                <img src="/img/SG-001/phonewave.png" alt="D-Mail Icon" />
                <span>Send a d-mail here !</span>
            </div>
            <audio id="notification-sound" src="/music/Tuturu.mp3"></audio>
            ${otherProfileNickname().length > 0 ? `<OtherProfile nickname="${otherProfileNickname()}" />` : ""}
        `;
    }
}
