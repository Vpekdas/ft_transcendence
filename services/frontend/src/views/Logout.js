import { post } from "../utils";
import { Component, navigateTo } from "../micro";

export default class Logout extends Component {
    async init() {
        await post("/api/logout", {});
        navigateTo("login");
    }

    render() {
        return /* HTML */ ``;
    }
}
