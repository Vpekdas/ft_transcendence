import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

import { defineRouter } from "./micro";
import Home from "./views/Home";
import Registration from "./views/Registration";
import Login from "./views/Login";
import Logout from "./views/Logout";
import Pong from "./views/Pong";
import PongMatchmake from "./views/PongMatchmake";
import Tournament from "./views/Tournament";
import CreateTournament from "./views/CreateTournament";
import NotFound from "./views/NotFound";
import { isLoggedIn } from "./utils";
import { navigateTo } from "./micro";
import Profile from "./views/Profile";
import { registerAll } from "./micro.generated";
import Social from "./views/Social";
import Callback from "./views/Callback";
import * as bootstrap from "bootstrap";
import TwoFactor from "./views/TwoFactor";
window.bootstrap = bootstrap;

defineRouter({
    routes: [
        { path: "/", view: Home },
        { path: "/404", view: NotFound },
        { path: "/register", view: Registration },
        { path: "/login", view: Login },
        { path: "/2fa", view: TwoFactor },
        { path: "/logout", view: Logout },
        { path: "/profile/social/[tab=friends,blacklist]", view: Social },
        { path: "/profile/[tab=match-history,statistics,skins,settings]", view: Profile },
        { path: "/play/pong/[id=$[a-zA-Z0-9]+$]", view: Pong },
        { path: "/matchmake/pong", view: PongMatchmake },
        { path: "/tournament/[id=$[a-zA-Z0-9]+$]", view: Tournament },
        { path: "/create-tournament", view: CreateTournament },
        { path: "/callback", view: Callback },
    ],
    hook: async (route, url) => {
        if (
            !(await isLoggedIn()) &&
            route != "/login" &&
            route != "/register" &&
            route != "/redirected" &&
            route != "/2fa" &&
            route != "/callback"
        ) {
            if (route == undefined || route == "/") {
                navigateTo("/login");
            } else {
                navigateTo("/login?redirect=" + encodeURIComponent(url));
            }

            return false;
        } else {
            return true;
        }
    },
    notFound: NotFound,
});

registerAll();
