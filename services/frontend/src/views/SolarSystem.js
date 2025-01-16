import { Component } from "../micro";

export default class SolarSystem extends Component {
    render() {
        return /* HTML */ `<div>
            <NavBar />
            <OuterWilds />
            <Coordinates />
            <EyeOfTheUniverse />
        </div>`;
    }
}
