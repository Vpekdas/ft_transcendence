import { Component, globalComponents, html } from "../micro";
import NavBar from "../components/NavBar";
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
                /* HTML */ ` <div>
                    <NavBar />
                    <p>Hello dear connected stranger !</p>
                </div>`
            );
        } else {
            if (false) {
                return html(
                    this.parent,
                    /* HTML */ ` <div>
                        <NavBar />
                        <Registration />
                    </div>`
                );
            } else {
                return html(
                    this.parent,
                    /* HTML */ ` <div>
                        <NavBar />
                        <Login />
                    </div>`
                );
            }
        }
    }
}
globalComponents.set("Profile", Profile);
