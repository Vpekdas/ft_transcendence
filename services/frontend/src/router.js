import Home from "./views/Home";
import NotFound from "./views/NotFound";
import Counter from "./views/Counter";
import Registration from "./views/Registration";
import { Component, html } from "./micro";
import ProfileDashboard from "./views/ProfileDashboard";
import MatchHistory from "./views/MatchHistory";
import Statistics from "./views/Statistics";
import Login from "./views/Login";
import Logout from "./views/Logout";
import Settings from "./views/Settings";

export const router = async () => {
    // Define routes and their associated views.
    // This allows us to dynamically render HTML content based on the current view.
    const routes = [
        { path: "/404", view: NotFound },
        { path: "/", view: Home },
        { path: "/profile", view: ProfileDashboard },
        { path: "/register", view: Registration },
        { path: "/login", view: Login },
        { path: "/logout", view: Logout },
        { path: "/counter", view: Counter },
        { path: "/profile/match-history", view: MatchHistory },
        { path: "/profile/statistics", view: Statistics },
        { path: "/profile/settings", view: Settings },
    ];

    // Create an array of potential matches by mapping routes to their match status.
    // This helps us determine if the current path exists in our routes array.
    const potentialMatches = routes.map((route) => {
        return {
            route: route,
            isMatch: location.pathname === route.path,
        };
    });

    let match = potentialMatches.find((potentialMatch) => potentialMatch.isMatch);
    if (!match) {
        match = {
            route: routes[0],
            isMatch: true,
        };
    }

    const app = document.getElementById("app");
    const viewName = match.route.view.name;

    // console.log(new Error().stack);

    try {
        const view = html(`<${viewName} />`);

        if (app.children.length > 0) app.removeChild(app.children[0]);
        app.appendChild(view);
    } catch (err) {
        const errorView = errorPage(err);

        if (app.children.length > 0) app.removeChild(app.children[0]);
        app.appendChild(errorView);
    }

    // Handle browser navigation events (back/forward buttons).
    window.onpopstate = () => {
        router();
    };
};

// Update the browser's history with the new URL and render the corresponding view.
export const navigateTo = (url) => {
    // console.log(new Error().stack);
    history.pushState(null, null, url);
    router();
};

export const escapeHTML = (msg) => {
    return msg.replace("<", "&lt;").replace(">", "&gt;");
};

/**
 * @param {Error} err
 */
export const errorPage = (err) => {
    let s = "";

    console.log(err);

    let lines = err.stack.split("\n").map((line) => {
        const parts = line.split("@");

        if (parts.length == 2) {
            const functionName = parts[0];
            const file = parts[1].substring(parts[1].indexOf("/", 8) + 1, parts[1].indexOf("?"));
            const location = parts[1].substring(parts[1].indexOf(":", parts[1].indexOf(":", 8) + 1) + 1);

            return `<li>${functionName == "" ? "???" : functionName} at ${file}:${location}</li>`;
        } else {
            return `<li>???</li>`;
        }
    });

    return html(
        null,
        /* HTML */ `<div>
            <h1>${escapeHTML(err.message)}</h1>
            <ul>
                ${lines.join("")}
            </ul>
        </div>`
    );
};
