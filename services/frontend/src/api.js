function getOrigin() {
    return window.location.origin.substring(0, window.location.origin.lastIndexOf(":"));
}

function api(route) {
    return getOrigin() + ":8000" + route;
}

export async function fetchApi(url, init) {
    return await fetch(api(url), init);
}

export async function isLoggedIn() {
    return await fetchApi("/api/", {});
}
