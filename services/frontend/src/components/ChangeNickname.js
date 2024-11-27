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

        this.query(".btn.btn-primary.ChangeNickname").on("click", async (event) => {
            const oldNickname = document.getElementById("newNickname").value;

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
        return html(
            /* HTML */ `<div class="container-fluid ChangeNicknameForm">
                <input
                    type="text"
                    id="newNickname"
                    class="form-control"
                    aria-describedby="passwordHelpBlock"
                    value="${info["nickname"]}"
                    autocomplete="off"
                />
                <button type="submit" class="btn btn-primary ChangeNickname">${changeLanguage}</button>
            </div>`
        );
    }
}
globalComponents.set("ChangeNicknameForm", ChangeNicknameForm);
