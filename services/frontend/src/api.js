function getOrigin() {
    return window.location.origin.substring(0, window.location.origin.lastIndexOf(":"));
}

function api(route) {
    return getOrigin() + ":8000" + route;
}

export async function fetchApi(url, init) {
    init.credentials = "include";
    return await fetch(api(url), init);
}

export async function post(url, init = { body: "{}" }) {
    init.credentials = "include";
    init.method = "POST";
    return await fetch(api(url), init);
}

export async function isLoggedIn() {
    const response = await post("/api/isLoggedIn", {
        method: "POST",
    }).then((res) => res.json());
    return response["error"] === undefined;
}
