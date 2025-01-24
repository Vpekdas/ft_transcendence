import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "bootstrap-icons/font/bootstrap-icons.css";

import { defineRouter } from "./micro";
import Home from "./views/Home";
import Registration from "./views/Registration";
import Login from "./views/Login";
import SigninExternal from "./views/SigninExternal";
import Logout from "./views/Logout";
import Clicker from "./views/Clicker";
import SolarSystem from "./views/SolarSystem";
import Pong from "./views/Pong";
import PongMatchmake from "./views/PongMatchmake";
import Tournament from "./views/Tournament";
import CreateTournament from "./views/CreateTournament";
import NotFound from "./views/NotFound";
import { isLoggedIn } from "./utils";
import { navigateTo } from "./micro";
import Profile from "./views/Profile";
import Test from "./views/Test";
import Redirected from "./views/Redirected";

import { registerAll } from "./micro.generated";

defineRouter({
    routes: [
        { path: "/", view: Home },
        { path: "/register", view: Registration },
        { path: "/login", view: Login },
        { path: "/signin-external", view: SigninExternal },
        { path: "/logout", view: Logout },
        { path: "/profile/[tab=match-history,statistics,skins,settings]", view: Profile },
        { path: "/duck", view: Clicker },
        { path: "/solar-system", view: SolarSystem },
        { path: "/play/pong/[id=$[a-zA-Z0-9]+$]", view: Pong },
        { path: "/matchmake/pong", view: PongMatchmake },
        { path: "/tournament/[id=$[a-zA-Z0-9]+$]", view: Tournament },
        { path: "/create-tournament", view: CreateTournament },
        { path: "/test", view: Test },
        { path: "/redirected", view: Redirected },
    ],
    hook: async (route, url) => {
        if (
            !(await isLoggedIn()) &&
            route != "/login" &&
            route != "/signin-external" &&
            route != "/register" &&
            route != "/redirected"
        ) {
            if (route == "/") {
                navigateTo("/login");
            } else {
                navigateTo("/login?redirect=" + encodeURIComponent(url));
            }
        }
    },
    notFound: NotFound,
});

registerAll();
