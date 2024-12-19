function getOrigin() {
    return window.location.origin.substring(0, window.location.origin.lastIndexOf(":"));
}

export function getOriginNoProtocol() {
    return window.location.origin
        .substring(0, window.location.origin.lastIndexOf(":"))
        .replace("http://", "")
        .replace("https://", "");
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
    const response = await post("/api/check-logged", {}).then((res) => res.json());
    return response["error"] === undefined;
}

export async function getNickname(id) {
    return await post(`/api/player/${id}/nickname`);
}
