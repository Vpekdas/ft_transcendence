class Store {
    constructor(defaultValue) {
        this.value = defaultValue;
    }
}

export class Component {
    constructor(parent, name = "default") {
        /** @type Map<string, Store> */
        this.stores = new Map();
        this.parent = parent;
        /** @type string */
        this.name = name;
        this.updateHandler = undefined;
    }

    /**
     * @returns {Promise<string>} The generated HTML
     */
    async render() {
        return "";
    }

    events() {}

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

    getFullPath() {
        if (this.parent != undefined)
            return this.parent.getFullPath() + "_" + (this.constructor.name + "#" + this.name);
        return this.constructor.name + "#" + this.name;
    }
}
