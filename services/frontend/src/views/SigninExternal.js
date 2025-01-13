import { getOrigin, post } from "../utils";
import { navigateTo } from "../micro";

/** @type {import("../micro").Component} */
export default async function SigninExternal({}) {
    const GET = location.search
        .substring(1)
        .split("&")
        .map((value) => value.split("="))
        .reduce((obj, item) => ((obj[item[0]] = item[1]), obj), {});

    console.log(getOrigin() + "/redirect");

    const res = await post("/api/signin-external", {
        body: JSON.stringify({ code: GET.code, redirect_uri: getOrigin() + "/redirect" }),
    }).then((res) => res.json());

    if (res["access_token"] == undefined) {
        console.error("NOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO");
        return;
    }

    localStorage.setItem("accessToken", res["access_token"]);

    if (GET["redirect"] == undefined) {
        navigateTo("/");
    } else {
        navigateTo(GET["redirect"]);
    }

    return /* HTML */ `<div></div>`;
}
