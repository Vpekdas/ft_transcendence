import { tr } from "../i18n";

/** @type {import("../micro").Component}  */
export default async function Clicker({ dom, stores }) {
    document.title = tr("Duck");

    return /* HTML */ ` <NavBar /><Duck />`;
}
