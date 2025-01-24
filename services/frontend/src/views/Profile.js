import { Component, params } from "../micro";

/** @type {import("../micro").Component} */
export default class Profile extends Component {
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
            ${comp}
        `;
    }
}
