import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { navigateTo, router } from "./router";

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

// document.addEventListener("vite:load", (event) => {
//     console.log("HOT RELOADING !!!!");
// });

if (import.meta.hot) {
    import.meta.hot.accept((newModule) => {
        router();
    });
}
