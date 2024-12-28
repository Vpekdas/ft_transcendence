import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "bootstrap-icons/font/bootstrap-icons.css";
import { navigateTo, router } from "./router";

// If the clicked element contains a data-link attribute, prevent the default page reload,
// update the browser's history, and render the new HTML content.
document.addEventListener("DOMContentLoaded", () => {
    document.body.addEventListener("click", (event) => {
        let target = event.target;
        // Traverse up the DOM tree to find the closest ancestor element with the data-link attribute.
        // This ensures that clicks on child elements (such as an image inside a link) are correctly handled.
        while (target && !target.matches("[data-link]")) {
            target = target.parentElement;
        }

        if (target && target.matches("[data-link]")) {
            event.preventDefault();
            navigateTo(target.href);
        }
    });
    registerAll();
    router();
});

if (import.meta.hot) {
    import.meta.hot.accept((newModule) => {
        registerAll();
        router();
    });
}
