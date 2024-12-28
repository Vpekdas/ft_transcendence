import { fetchApi } from "../api";
import { navigateTo } from "../router";
import { Component, html } from "../micro";
import { tr } from "../i18n";
import OuterWilds from "../components/OuterWilds";
import NavBar from "../components/NavBars/HomeNavBar";

export default class SolarSystem extends Component {
    constructor() {
        super();
    }

    async render() {
        return html(
            /* HTML */
            ` <div>
                <NavBar />

                <OuterWilds />
            </div>`
        );
    }
}
