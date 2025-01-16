import { tr } from "../i18n";
import { Component } from "../micro";

export default class Clicker extends Component {
    async init() {
        document.title = tr("Duck");
    }

    render() {
        return /* HTML */ ` <NavBar /><Duck />`;
    }
}
