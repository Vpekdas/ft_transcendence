import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "bootstrap-icons/font/bootstrap-icons.css";

import { defineRouter } from "./micro";
import Home from "./views/Home";
import Registration from "./views/Registration";
import Login from "./views/Login";
import LoginExernal from "./views/LoginExternal";
import Logout from "./views/Logout";
import Counter from "./views/Counter";
import MatchHistory from "./views/MatchHistory";
import Statistics from "./views/Statistics";
import Settings from "./views/Settings";
import Clicker from "./views/Clicker";
import SolarSystem from "./views/SolarSystem";
import Pong from "./views/Pong";
import PongMatchmake from "./views/PongMatchmake";
import Tournament from "./views/Tournament";
import CreateTournament from "./views/CreateTournament";

defineRouter({
    routes: [
        { path: "/", view: Home },
        { path: "/register", view: Registration },
        { path: "/login", view: Login },
        { path: "/login-external", view: LoginExernal },
        { path: "/logout", view: Logout },
        { path: "/counter", view: Counter },
        { path: "/profile/match-history", view: MatchHistory },
        { path: "/profile/statistics", view: Statistics },
        { path: "/profile/settings", view: Settings },
        { path: "/duck", view: Clicker },
        { path: "/solar-system", view: SolarSystem },
        { path: "/play/pong/[id]", view: Pong },
        { path: "/matchmake/pong", view: PongMatchmake },
        { path: "/tournament/[id]", view: Tournament },
        { path: "/create-tournament", view: CreateTournament },
    ],
});
