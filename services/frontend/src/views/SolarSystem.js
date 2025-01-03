import { fetchApi } from "../utils";
import { navigateTo } from "../router";
import { Component, html } from "../micro";
import { tr } from "../i18n";

export default class SolarSystem extends Component {
    constructor() {
        super();
    }

    async render() {
        return html(
            /* HTML */ `<div>
                <NavBar />
                <OuterWilds />
                <Coordinates />
            </div>`
        );
    }
}
