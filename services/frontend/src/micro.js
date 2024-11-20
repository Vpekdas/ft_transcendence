class Store {
    constructor(defaultValue) {
        this.value = defaultValue;
    }
}

class ElementAccessor {
    constructor() {
        this.eventCallbacks = new Map();
    }

    on(eventName, callback) {
        this.eventCallbacks.set(eventName, callback);
    }
}

export class Component {
    constructor(parent, name = "default") {
        /** @type Map<string, Store> */
        this.stores = new Map();
        /** @type Map<string, Selector>  */
        this.accessors = new Map();
        this.parent = parent;
        /** @type string */
        this.name = name;
        this.updateHandler = undefined;
    }

    setTitle(title) {
        document.title = title;
    }

    /**
     * @returns {Promise<string>} The generated HTML
     */
    async render() {
        return "";
    }

    events() {
        for (let [selector, values] of this.accessors) {
            for (let [eventName, callback] of values.eventCallbacks) {
                document.querySelector(selector).addEventListener(eventName, callback);
            }
        }
    }

    /**
     * @param {string} name
     */
    useStore(name, defaultValue) {
        var store;

        if (!this.stores.has(name)) {
            this.stores.set(name, new Store(defaultValue));
        }
        store = this.stores.get(name);

        return [
            store.value,
            (value) => {
                store.value = value;
                setTimeout(() => this.update(), 0);
            },
        ];
    }

    usePersistentStore(name, defaultValue) {
        var key = this.getFullPath() + "__" + name;
        var item = window.localStorage.getItem(key);

        if (item == null) {
            item = JSON.stringify(defaultValue);
            window.localStorage.setItem(key, item);
        }

        return [
            JSON.parse(item),
            (value) => {
                window.localStorage.setItem(key, value);
                setTimeout(() => this.update(), 0);
            },
        ];
    }

    async update() {
        if (this.updateHandler != undefined) await this.updateHandler();
        if (this.parent != undefined) await this.parent.update();
    }

    /**
     * @param {string} selector
     * @returns {ElementAccessor}
     */
    query(selector) {
        var accessor;
        if (!this.accessors.has(selector)) {
            accessor = new ElementAccessor();
            this.accessors.set(selector, accessor);
        } else {
            accessor = this.accessors.get(selector);
        }
        return accessor;
    }

    getFullPath() {
        if (this.parent != undefined)
            return this.parent.getFullPath() + "_" + (this.constructor.name + "#" + this.name);
        return this.constructor.name + "#" + this.name;
    }

    getOrigin() {
        return window.location.origin.substring(0, window.location.origin.lastIndexOf(":"));
    }

    api(route) {
        return this.getOrigin() + ":8000" + route;
    }
}
