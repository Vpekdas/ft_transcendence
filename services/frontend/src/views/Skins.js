import { tr } from "../i18n";
import { post } from "../utils";
import { Component } from "../micro";

export default class Skins extends Component {
    async init() {
        document.title = tr("Skins");
    }

    render() {
        return /* HTML */ ` <div class="container-fluid dashboard-container" id="skin-container">
            <ProfileNavBar />
            <div class="container-fluid skin-container">
                <SkinCard title="Terrain Skin" type="terrain" />
                <SkinCard title="Ball Skin" type="ball" />
                <SkinCard title="Bar Skin" type="bar" />
            </div>
        </div>`;
    }
}
