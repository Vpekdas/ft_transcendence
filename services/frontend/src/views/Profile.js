import { Component, globalComponents, html } from "../micro";
import NavBar from "./NavBar";
import Login from "./Login";
import Registration from "./Registration";

export default class Profile extends Component {
    constructor() {
        super();
        this.registration = new Registration();
    }

    async render() {
        const [isLogged, setLogged] = this.useGlobalStore("isLogged", false);

        this.setTitle("Profile");

        if (isLogged) {
            return html(
                this.parent,
                /*html*/ `
            <div>
                <NavBar />
                <p>Hello dear connected stranger !</p>
            </div>`
            );
        } else {
            return html(
                this.parent,
                /*html*/ `
            <div>
                <NavBar />
                <Registration />
            </div>`
            );
        }
    }

    events() {
        super.events();
        this.registration.events();
        this.registration.addEventListeners();
    }

    addEventListeners() {
        this.registration.addEventListeners();
    }
}
globalComponents.set("Profile", Profile);
