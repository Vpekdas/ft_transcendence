import { post } from "../utils";
import { navigateTo } from "../micro";

export default async function Logout({}) {
    await post("/api/logout", {});
    navigateTo("login");
    return /* HTML */ `<div></div>`;
}
