export default class {
    constructor() {}

    setTitle(title) {
        document.title = title;
    }

    async getHtml() {
        return "";
    }

    async readPage(source) {
        return fetch(source)
            .then((res) => res.text())
            .catch((e) => console.error(e));
    }

    getOrigin() {
        return window.location.origin.substring(0, window.location.origin.lastIndexOf(":"));
    }
}
