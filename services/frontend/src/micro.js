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
        /** @type Map<string, any> */
        this.attributes = new Map();
        this.parent = parent;
        /** @type string */
        this.name = name;
        this.updateHandler = undefined;
    }

    setTitle(title) {
        document.title = title;
    }

    /**
     * @returns {Promise<HTMLElement>} The generated HTML
     */
    async render() {
        return null;
    }

    attrib(name) {
        if (this.attributes.has(name)) {
            return this.attributes.get(name);
        }
        return null;
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

    useGlobalStore(name, defaultValue) {
        const key = "global__" + name;
        var item = localStorage.getItem(key);

        if (item == null) {
            item = JSON.stringify(defaultValue);
            localStorage.setItem(key, item);
        }

        return [
            JSON.parse(localStorage.getItem(key)),
            (value) => {
                localStorage.setItem(key, value);
                setTimeout(() => this.update(), 0);
            },
        ];
    }

    usePersistentStore(name, defaultValue) {
        var key = this.getFullPath() + "__" + name;
        var item = localStorage.getItem(key);

        if (item == null) {
            item = JSON.stringify(defaultValue);
            localStorage.setItem(key, item);
        }

        return [
            JSON.parse(localStorage.getItem(key)),
            (value) => {
                localStorage.setItem(key, value);
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

    events() {
        for (let [selector, values] of this.accessors) {
            for (let [eventName, callback] of values.eventCallbacks) {
                const el = document.querySelector(selector);

                if (el == null) continue;

                el.addEventListener(eventName, callback);
            }
        }
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

class ParsingError extends Error {
    static EXPECTING_TAG = 0;
    static UNKNOWN_ELEMENT = 1;
    static ONE_TOP_LEVEL_ELEMENT = 2;
    static NO_CLOSING_TAG = 3;
    static EXPECTING_IDENT = 4;

    constructor(err, token, source, data) {
        super(ParsingError.errorString(err, token, source, data), null);

        this.err = err;
        this.token = token;
        this.source = source;
        this.data = data;
    }

    static errorString(err, token, source, data) {
        switch (err) {
            case ParsingError.EXPECTING_TAG:
                return (
                    `Expecting an element but found ${token.s}` +
                    ParsingError.errorLocation(source, token.line, token.column, token.s.length)
                );
            case ParsingError.UNKNOWN_ELEMENT:
                return `Unknown element <${token.s}>`;
            case ParsingError.ONE_TOP_LEVEL_ELEMENT:
                return `Only top element is supported` /*+
                    ParsingError.errorLocation(source, token.line, token.column, 2 + token.s.length)*/;
            case ParsingError.NO_CLOSING_TAG:
                return (
                    `No closing tag for <${token.s}>` +
                    ParsingError.errorLocation(source, token.line, token.column, token.s.length)
                );
            case ParsingError.EXPECTING_IDENT:
                return (
                    `Expecting identifier but got \`${token.s}\`` +
                    ParsingError.errorLocation(source, token.line, token.column, token.s.length)
                );
        }
    }

    /**
     * @param {string} source
     * @param {number} line
     * @param {number} columnStart
     * @param {number} size
     */
    static errorLocation(source, line, columnStart, size) {
        const lines = source.split("\n");
        let s = `\n${lines[line - 1]}\n`;

        for (let i = 0; i < columnStart - 1; i++) {
            s += " ";
        }

        s += "^";

        for (let i = 1; i < size; i++) {
            s += "~";
        }

        return s;
    }
}

class HTMLComponent extends HTMLElement {
    constructor() {
        super();
        /** @type Component */
        this.component = undefined;
    }

    connectedCallback() {
        this.updateHTML();
    }

    disconnectedCallback() {}

    adoptedCallback() {
        this.updateHTML();
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue != newValue) {
            return;
        }

        if (this.component != undefined) {
            this.component.attributes.set(name, newValue);
            this.updateHTML();
        }
    }

    async updateHTML() {
        if (this.component != undefined) {
            const newChild = await this.component.render();
            if (this.children.length > 0) this.removeChild(this.children[0]);
            this.appendChild(newChild);

            this.component.events();
        }
    }

    events() {
        if (this.component != undefined) {
            for (let [selector, values] of this.accessors) {
                for (let [eventName, callback] of values.eventCallbacks) {
                    const el = document.querySelector(selector);

                    if (el == null) continue;

                    el.addEventListener(eventName, callback);
                }
            }
        }
    }
}

/**
 * @param {string} str
 * @returns {HTMLElement | ParsingError}
 */
export function html(parent, str) {
    // There is probably a better place to put this. This maybe should go away when parsing is done.
    if (customElements.get("micro-component") == undefined) {
        customElements.define("micro-component", HTMLComponent);
    }

    class Token {
        static IDENT = 0;
        static EQUALS = 1; // `=`
        static OPEN_TAG = 2; // `<`
        static CLOSE_TAG = 3; // `>`
        static QUOTES_STRING = 4; // `'...'`
        static DQUOTES_STRING = 5; // `"..."`
        static SLASH = 6; // `/`
        static CONTENT = 7; // Any text inside an element

        constructor(type, s, line, column) {
            this.type = type;
            this.s = s;
            this.line = line;
            this.column = column;
        }
    }

    /** @type Array<Token> */
    let tokens = new Array();
    let index = 0;
    let line = 1;
    let column = 1;

    function isWhitespace(c) {
        return c == " " || c == "\n" || c == "\r" || c == "\t";
    }

    function skipWhitespaces() {
        while (index < str.length && isWhitespace(str[index])) {
            if (str[index] == "\n") {
                line++;
                column = 1;
            } else {
                column++;
            }
            index++;
        }
    }

    let insideElement = false;

    while (index < str.length) {
        skipWhitespaces();

        if (str[index] == "<") {
            tokens.push(new Token(Token.OPEN_TAG, str[index], line, column));
            index++;
            column++;
            insideElement = false;
        } else if (str[index] == ">") {
            tokens.push(new Token(Token.CLOSE_TAG, str[index], line, column));
            index++;
            column++;
            insideElement = true;
        } else if (str[index] == "/") {
            tokens.push(new Token(Token.SLASH, str[index], line, column));
            index++;
            column++;
        } else if (str[index] == "=") {
            tokens.push(new Token(Token.EQUALS, str[index], line, column));
            index++;
            column++;
        } else if (str[index] == '"') {
            let value = "";
            let startColumn = column;
            index++;
            column++;
            while (index < str.length && str[index] != '"') {
                value += str[index];
                index++;
                column++;
            }
            // TODO: Check for errors
            tokens.push(new Token(Token.DQUOTES_STRING, value, line, startColumn));
            index++;
            column++;
        } else if (str[index] == "'") {
            let value = "";
            let startColumn = column;
            index++;
            column++;
            while (index < str.length && str[index] != "'") {
                value += str[index];
                index++;
                column++;
            }
            // TODO: Check for errors
            tokens.push(new Token(Token.QUOTES_STRING, value, line, startColumn));
            index++;
            column++;
        } else if (insideElement) {
            let value = "";
            let startColumn = column;
            while (index < str.length && str[index] != "<") {
                value += str[index];
                index++;
                column++;
            }
            // TODO: Check for errors
            tokens.push(new Token(Token.CONTENT, value, line, startColumn));
        } else {
            let value = "";
            let startColumn = column;
            while (
                index < str.length &&
                !isWhitespace(str[index]) &&
                str[index] != "<" &&
                str[index] != ">" &&
                str[index] != "/" &&
                str[index] != "="
            ) {
                value += str[index];
                index++;
                column++;
            }
            // TODO: Check for errors
            tokens.push(new Token(Token.IDENT, value, line, startColumn));
        }
    }

    function parseTags(parent, tokens, start, end) {
        let index = start;

        // console.log(...tokens.slice(start, end).map((v) => v.s));

        if (tokens[index].type != Token.OPEN_TAG) {
            throw new ParsingError(ParsingError.EXPECTING_TAG, tokens[index], str); // Expected opening tag!!!
        }

        index++;

        if (tokens[index].type != Token.IDENT) {
            throw new ParsingError(ParsingError.EXPECTING_IDENT, tokens[index], str); // Expecting element name!!!
        }

        const startToken = tokens[index];
        const name = tokens[index].s;
        index++;

        /** @type Map<string, string> */
        let attributes = new Map();
        let hasInnerHTML = false;

        // TODO: Check unexpected end of element

        while (index < end) {
            if (tokens[index].type == Token.CLOSE_TAG || tokens[index].type == Token.SLASH) {
                break;
            } else if (tokens[index].type != Token.IDENT) {
                throw new ParsingError(ParsingError.EXPECTING_IDENT, tokens[index], str); // Expecting attribute name !!!
            }

            const name = tokens[index].s;
            let value = "";

            index++;

            if (tokens[index].type == Token.EQUALS) {
                if (
                    tokens[index + 1].type == Token.IDENT ||
                    tokens[index + 1].type == Token.QUOTES_STRING ||
                    tokens[index + 1].type == Token.DQUOTES_STRING
                ) {
                    value += tokens[index + 1].s;
                    index++;
                } else {
                    throw new ParsingError(); // Expecting attribute value !!!
                }
                index++;
            }

            attributes.set(name, value);
        }

        if (tokens[index].type == Token.CLOSE_TAG) {
            hasInnerHTML = true;
            index++;
        } else if (tokens[index].type == Token.SLASH) {
            if (tokens[index + 1].type != Token.CLOSE_TAG) {
                throw new ParsingError(); // Expected `>` after `/` !!!
            }
            index += 2;
        }

        /** @type HTMLElement */
        let el;

        if (globalComponents.has(name)) {
            el = document.createElement("micro-component");

            const c = globalComponents.get(name);

            el.component = new c();
            el.component.parent = parent;
            el.component.updateHandler = async () => await el.updateHTML();

            for (let [key, value] of attributes) {
                el.setAttribute(key, value);
            }
        } else {
            el = document.createElement(name);
            if (el == undefined) {
                throw new ParsingError(ParsingError.UNKNOWN_ELEMENT, tokens[startToken], str); // Unknown element!!!
            }

            for (let [key, value] of attributes) {
                el.setAttribute(key, value);
            }
        }

        function findClosingTag(tagName) {
            let index2 = index;
            /** @type Map<string, number> */
            let openTags = new Map();

            function checkAllClosed() {
                for (let [key, count] of openTags) {
                    if (count != 0) {
                        return false;
                    }
                }
                return true;
            }

            openTags.set(tagName, 1);

            while (index2 < end) {
                if (tokens[index2].type == Token.OPEN_TAG) {
                    if (tokens[index2 + 1].type == Token.SLASH) {
                        // We reach a closing tag.

                        index2 += 2;

                        const name = tokens[index2].s;
                        if (!openTags.has(name)) {
                            openTags.set(name, -1);
                        } else {
                            openTags.set(name, openTags.get(name) - 1);
                        }

                        if (name == tagName && checkAllClosed()) {
                            return index2 - 2;
                        }
                    } else {
                        // We reach an opening tag.

                        index2++;
                        const name = tokens[index2].s;
                        while (
                            index2 < end &&
                            tokens[index2].type != Token.CLOSE_TAG &&
                            tokens[index2].type != Token.SLASH
                        ) {
                            index2++;
                        }
                        if (tokens[index2].type == Token.CLOSE_TAG) {
                            if (!openTags.has(name)) {
                                openTags.set(name, 1);
                            } else {
                                openTags.set(name, openTags.get(name) + 1);
                            }
                        } else if (tokens[index2].type == Token.SLASH) {
                            index2++;
                        }
                    }
                }

                index2++;
            }

            return Infinity;
        }

        if (hasInnerHTML) {
            // console.log(name, startToken);
            const newEnd = findClosingTag(name);

            if (newEnd >= tokens.length) {
                throw new ParsingError(ParsingError.NO_CLOSING_TAG, startToken, str);
            }

            // console.log(newEnd, tokens.length);

            if (tokens[index].type == Token.CONTENT) {
                el.innerText = tokens[index].s;
                index++;
            } else {
                var newParent = el instanceof HTMLComponent ? el.component : null;

                while (index < newEnd) {
                    const [child, stoppedIndex] = parseTags(newParent, tokens, index, newEnd); // `el` here could mess up events.
                    // console.log(child, tokens[stoppedIndex]);
                    index = stoppedIndex;
                    el.appendChild(child);
                }
            }

            index += 4; // `<`, `/`, `...` and `>`
        }

        return [el, index];
    }

    const [el, stoppedIndex] = parseTags(parent, tokens, 0, tokens.length);

    if (stoppedIndex < tokens.length) {
        throw new ParsingError(ParsingError.ONE_TOP_LEVEL_ELEMENT, tokens[stoppedIndex], str);
    }
    return el;
}

/** @type Map<string, any> */
export const globalComponents = new Map();
