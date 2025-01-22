import { Component, params } from "../micro";

export default class Social extends Component {
    render() {
        const tab = params.get("tab");
        let comp = "";

        if (tab == "friends") {
            comp = `<Friends />`;
        } else if (tab == "blacklist") {
            comp = `<Blacklist />`;
        }

        return /* HTML */ `
            <HomeNavBar />
            ${comp}
        `;
    }
}
