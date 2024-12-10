import { Component, globalComponents, html } from "../micro";
import { tr } from "../i18n";
import { fetchApi, post } from "../api";

export default class ChangeNicknameForm extends Component {
    constructor() {
        super();
    }

    async render() {
        const changeLanguage = tr("Change");

        const info = await post("/api/getPlayerProfile").then((res) => res.json());

        this.query(".btn.btn-primary.change-nickname-button").on("click", async () => {
            const oldNickname = document.getElementById("new-nickname").value;

            const response = await fetchApi("/api/updateNickname", {
                method: "POST",
                body: JSON.stringify({
                    nickname: oldNickname,
                }),
            })
                .then((res) => res.json())
                .catch((err) => {
                    error: "Bad input";
                });

            console.log("changeNickname response: ", response);
        });

        console.log(info.nickname);
        return html(
            /* HTML */ `<div class="container-fluid change-nickname-form">
                <input
                    type="text"
                    id="new-nickname"
                    class="form-control"
                    aria-describedby="passwordHelpBlock"
                    value="${info["nickname"]}"
                    autocomplete="off"
                    required
                />
                <button type="submit" class="btn btn-primary change-nickname-button">${changeLanguage}</button>
                <div>${info.nickname}</div>
            </div>`
        );
    }
}
globalComponents.set("ChangeNicknameForm", ChangeNicknameForm);
