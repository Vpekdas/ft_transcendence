import { tr } from "../i18n";
import { Component, navigateTo } from "../micro";
import { getOrigin, post } from "../utils";

export default class Callback extends Component {
    async init() {
        const accessToken = localStorage.getItem("accessToken");

        const GET = location.search
            .substring(1)
            .split("&")
            .map((value) => value.split("="))
            .reduce((obj, item) => ((obj[item[0]] = item[1]), obj), {});

        if (accessToken == undefined) {
            const redirect_uri = getOrigin() + "/callback";

            console.log(redirect_uri);

            const res = await post("/api/signin-external", {
                body: JSON.stringify({ code: GET.code, redirect_uri: redirect_uri }),
            }).then((res) => res.json());

            localStorage.setItem("accessToken", res["access_token"]);
        } else {
            const res = await post("/api/signin-external", {
                body: JSON.stringify({ access_token: accessToken }),
            }).then((res) => res.json());

            if (res["error"]) {
                localStorage.removeItem("accessToken");
                navigateTo("/login?redirect=" + GET["redirect"]);
                return;
            }
        }

        if (GET["redirect"] == undefined) {
            navigateTo("/");
        } else {
            navigateTo(GET["redirect"]);
        }
    }

    render() {
        return /* HTML */ `<div></div>`;
    }
}
