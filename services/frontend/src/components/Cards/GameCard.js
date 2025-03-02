import { tr } from "../../i18n";
import { Component } from "../../micro";
import { post } from "../../utils";

/** @type {import("../../micro").Component} */

export default class GameCard extends Component {
    async init() {
        this.title = tr(this.attributes.get("title"));
        this.img = this.attributes.get("img");
        this.id = this.attributes.get("id");
        this.alt = this.attributes.get("alt");
        this.description = tr(this.attributes.get("description"));
        this.btnName = tr(this.attributes.get("btnName"));
    }

    render() {
        return /* HTML */ `
            <div class="container-fluid settings game">
                <div class="card settings game">
                    <h5 class="card-title settings" data-text="${this.title}">${this.title}</h5>
                    <div class="card-body settings game">
                        <img src="${this.img}" class="card-img-top pong-game" alt="${this.alt}" />
                        <p class="card-text settings">${this.description}</p>
                        <button type="submit" class="btn btn-primary settings change-nickname-button" id="${this.id}">
                            ${this.btnName}
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
}
