import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import Home from "./views/Home";
import NotFound from "./views/NotFound";
import Counter from "./views/Counter";
import Registration from "./views/Registration";
import { Component, html } from "./micro";
import ProfileDashboard from "./views/ProfileDashboard";
import MatchHistory from "./views/MatchHistory";
import Statistics from "./views/Statistics";
import Login from "./views/Login";

export const router = async () => {
    // Define routes and their associated views.
    // This allows us to dynamically render HTML content based on the current view.
    const routes = [
        { path: "/404", view: html(null, /* HTML */ `<NotFound />`) },
        { path: "/", view: html(null, /* HTML */ `<Home />`) },
        { path: "/profile", view: html(null, /* HTML */ `<ProfileDashboard />`) },
        { path: "/register", view: html(null, /* HTML */ `<Registration />`) },
        { path: "/login", view: html(null, /* HTML */ `<Login />`) },
        { path: "/counter", view: html(null, /* HTML */ `<Counter />`) },
        { path: "/profile/match-history", view: html(null, /* HTML */ `<MatchHistory />`) },
        { path: "/profile/statistics", view: html(null, /* HTML */ `<Statistics />`) },
    ];

    // Create an array of potential matches by mapping routes to their match status.
    // This helps us determine if the current path exists in our routes array.
    const potentialMatches = routes.map((route) => {
        return {
            route: route,
            isMatch: location.pathname === route.path,
        };
    });

    // TODO: Implement a 404 page for unmatched routes.
    let match = potentialMatches.find((potentialMatch) => potentialMatch.isMatch);
    if (!match) {
        match = {
            route: routes[0],
            isMatch: true,
        };
    }

    // Instantiate the view associated with the matched route.
    const view = match.route.view;
    const app = document.getElementById("app");

    if (app.children.length > 0) app.removeChild(app.children[0]);
    app.appendChild(view);

    // // Handle browser navigation events (back/forward buttons).
    window.onpopstate = () => {
        router();
    };
};

// Update the browser's history with the new URL and render the corresponding view.
export const    navigateTo = (url) => {
    history.pushState(null, null, url);
    router();
};

// If the clicked element contains a data-link attribute, prevent the default page reload,
// update the browser's history, and render the new HTML content.
document.addEventListener("DOMContentLoaded", () => {
    document.body.addEventListener("click", (event) => {
        if (event.target.matches("[data-link]")) {
            event.preventDefault();
            navigateTo(event.target.href);
        }
    });
    router();
});
