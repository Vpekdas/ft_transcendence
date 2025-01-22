import { Component } from "../../micro";
import { api, getNickname } from "../../utils";

export default class FriendCard extends Component {
    async init() {
        this.id = parseInt(this.attributes.get("id"));
        this.nickname = await getNickname(this.id);
    }

    render() {
        return /* HTML */ `<div>
            <ul>
                <img src="${api("/api/player/" + this.id + "/picture")}" />
                <span>${this.nickname}</span>
            </ul>
        </div>`;
    }
}
