export function getOrigin() {
    let origin = window.location.href;
    let index = origin.startsWith("https://") ? 8 : 7;

    return origin.substring(0, origin.indexOf("/", index));
}

export function getOriginNoProtocol() {
    return getOrigin().replace("http://", "").replace("https://", "");
}

export function api(route) {
    return getOrigin() + route;
}

export async function fetchApi(url, init) {
    init.credentials = "include";
    return await fetch(api(url), init);
}

export async function post(url, init = { body: "{}" }) {
    init.method = "POST";
    init.credentials = "include";
    return await fetch(api(url), init);
}

export async function isLoggedIn() {
    const response = await post("/api/check-logged", {}).then((res) => res.json());
    return response["error"] === undefined;
}

export async function getNickname(id) {
    return (await post(`/api/player/${id}/nickname`).then((res) => res.json()))["nickname"];
}

export async function getUserIdByNickname(nickname) {
    try {
        const response = await fetch(`/api/get_user_id_by_nickname?nickname=${nickname}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (!data.user_id) {
            throw new Error("User ID not found in response");
        }
        return data.user_id;
    } catch (error) {
        console.error("Error fetching user ID by nickname:", error);
        return null;
    }
}

/**
 * @param {string} message
 * @param {string} iconClass
 */
export function showToast(message, iconClass) {
    const toastContainer = document.getElementById("toast-container");
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.innerHTML = `<i class="${iconClass} toast-icon"></i> ${message}`;
    toast.style.display = "flex";
    toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 5000);
}
