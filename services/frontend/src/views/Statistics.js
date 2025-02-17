import { tr } from "../i18n";
import { Component } from "../micro";

export default class Statistics extends Component {
    async init() {
        document.title = tr("Statistics");
    }

    render() {
        return /* HTML */ ` <div class="container-fluid dashboard-container">
            <ProfileNavBar />
        </div>`;
    }
}

// TODO Points per Game Chart: Bar Chart.
