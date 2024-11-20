class Store {
    constructor(defaultValue) {
        this.value = defaultValue;
    }
}

export class Component {
    constructor(parent) {
        /** @type Map<string, Store> */
        this.stores = new Map();
        this.parent = parent;
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

    async update() {
        if (this.updateHandler !== undefined) await this.updateHandler();
        if (this.parent != undefined) await this.parent.update();
    }
}
