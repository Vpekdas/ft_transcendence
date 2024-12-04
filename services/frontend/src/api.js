function getOrigin() {
    return window.location.origin.substring(0, window.location.origin.lastIndexOf(":"));
}

function api(route, port = 8000) {
    return getOrigin() + ":" + port + route;
}

export async function fetchApi(url, init) {
    init.credentials = "include";
    return await fetch(api(url), init);
}

export async function post(url, init = { body: "{}" }, port = 8000) {
    init.method = "POST";
    init.credentials = "include";
    return await fetch(api(url, port), init);
}

export async function isLoggedIn() {
    const response = await post("/api/isLoggedIn", {}).then((res) => res.json());
    console.log(response);
    return response["error"] === undefined;
}
