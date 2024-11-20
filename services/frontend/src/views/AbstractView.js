export default class {
    constructor() {}

    setTitle(title) {
        document.title = title;
    }

    async getHtml() {
        return "";
    }

    addEventListeners() {}

    getOrigin() {
        return window.location.origin.substring(0, window.location.origin.lastIndexOf(":"));
    }

    api(route) {
        return this.getOrigin() + ":8000" + route;
    }
}
