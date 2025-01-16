import { Component } from "../micro";

export default class SolarSystem extends Component {
    render() {
        return /* HTML */ `<div>
            <HomeNavBar />
            <OuterWilds />
            <Coordinates />
            <EyeOfTheUniverse />
        </div>`;
    }
}
