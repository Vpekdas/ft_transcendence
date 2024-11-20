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
}
