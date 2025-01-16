import { Component } from "../micro";

/** @type {import("../micro").Component} */
export default class Profile extends Component {
    async init() {
        this.comp = "";
        const tab = this.attributes.get("tab");
        if (tab == "match-history") {
            this.comp = `<MatchHistory />`;
        } else if (tab == "statistics") {
            this.comp = `<Statistics />`;
        } else if (tab == "settings") {
            this.comp = `<Settings />`;
        } else if (tab == "skins") {
            this.comp = `<Skins />`;
        }
    }

    render() {
        return /* HTML */ `
            <HomeNavBar />
            ${this.comp}
        `;
    }
}
