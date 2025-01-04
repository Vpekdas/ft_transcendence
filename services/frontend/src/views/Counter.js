/** @type {import("../micro").Component} */
export default async function Counter({ dom }) {
    return /* HTML */ `<div>
        <NavBar />
        <p>Count is 1</p>
        <button id="add">Add !</button><button id="sub">Sub !</button>
    </div>`;
}
