/** @type {Map<string, Component>} */
export let components = new Map();
/** @type {Map<string, string>} */
export let params = new Map();

let routerSettings = undefined;

/*
    COMPONENT MANIPULATION
 */

/**
 * @param {string} str
 * @returns
 */
function hash(str) {
    let h;

    h = 0;
    for (let index = 0; index < str.length; index++) {
        h = 37 * h + str.charCodeAt(index);
    }
    return h;
}

export class Component {
    constructor() {
        /** @type {Map<string, string>} */
        this.attributes = new Map();
        /** @type {() => void | (() => Promise<void>)} */
        this.onready = undefined;
        /** @type {Map<string, any>} */
        this.stores = new Map();
    }

    /**
     * Callback called on initial page load.
     */
    async init() {}

    /**
     * Callback called when the component is removed from the DOM.
     */
    clean() {}

    /**
     * Callback called each time the DOM is refreshed.
     *
     * @returns {string}
     */
    render() {}

    /*
        STORES
     */

    /**
     * @param {string} name
     * @returns {[() => typeof defaultValue, (value: typeof defaultValue) => void ]}
     */
    use(name, defaultValue) {
        return [
            () => {
                if (!this.stores.has(name)) {
                    this.stores.set(name, defaultValue);
                }
                return this.stores.get(name);
            },
            (value) => {
                this.stores.set(name, value);
                setTimeout(async () => await router());
            },
        ];
    }

    /**
     * A store which use localStorage to persist its value.
     *
     * @param {string} name
     * @returns {[() => typeof defaultValue, (value: typeof defaultValue) => void ]}
     */
    usePersistent(name, defaultValue) {
        const fullName = name;

        return [
            () => {
                const value = localStorage.getItem(fullName);

                if (value == null) {
                    localStorage.setItem(fullName, JSON.stringify(defaultValue));
                    return defaultValue;
                } else {
                    return JSON.parse(value);
                }
            },
            (value) => {
                localStorage.setItem(fullName, JSON.stringify(value));
                setTimeout(async () => await router());
            },
        ];
    }
}

/**
 * @param {Component} comp
 * @param {Map<string, string>} attributes
 * @param {Map<string, string>} params
 * @param {VirtualNode} parent
 * @param {Element} parentElement
 * @returns {Promise<VirtualNode>}
 */
function createComponentNode(comp, attributes, parent) {
    const name = comp.constructor.name;
    const node = new VirtualNodeComponent(comp, parent);
    comp.attributes = attributes;

    let rootElement = document.createElement("div");
    rootElement.classList.add("micro-" + name);
    rootElement.classList.add(node.id);

    node.element = rootElement;

    return node;
}

/*
    VIRTUAL DOM
 */

class VirtualNode {
    constructor() {
        /** @type {VirtualNode[]} */
        this.children = [];
    }

    /**
     * @returns {Element | string}
     */
    build() {
        return undefined;
    }

    async mount() {}

    clean() {
        for (let child of this.children) {
            child.clean();
        }
    }

    /**
     * @returns {Element}
     */
    buildTree() {
        let root = this.build();

        for (let child of this.children) {
            root.append(child.buildTree());
        }

        return root;
    }
}

class VirtualNodeText extends VirtualNode {
    /**
     * @param {string} text
     */
    constructor(text) {
        super();
        this.text = text;
    }

    build() {
        return document.createTextNode(this.text);
    }
}

class VirtualNodeElement extends VirtualNode {
    /**
     * @param {Element} element
     */
    constructor(element) {
        super();
        this.element = element;
    }

    /**
     * @returns {Element}
     */
    build() {
        return this.element.cloneNode(true);
    }
}

class VirtualNodeComponent extends VirtualNode {
    /**
     * @param {import("./micro").ComponentParams} params
     * @param {Component} component
     * @param {VirtualNode} parent
     * @param {Element} parentElement
     */
    constructor(component, parent) {
        super();
        this.component = component;
        this.name = this.component.constructor.name;
        this.parent = parent;
        /** @type {HTMLElement} */
        this.element = undefined;
        this.id = "id" + this.createComponentId();

        // TODO: Add the index of the node to the id.
    }

    createComponentId() {
        let parents = [this.name];
        let node = this.parent;

        while (node != undefined) {
            if (node instanceof VirtualNodeComponent) {
                parents.push(node.name);
            } else if (node instanceof VirtualNodeElement) {
                parents.push(node.element.tagName);
            }

            parents.push(node.name);
            node = node.parent;
        }

        return hash(parents.reverse().join("-")).toString(32);
    }

    async mount() {
        if (this.component.init) await this.component.init();
        this.parseInnerHTML();
    }

    clean() {
        this.component.clean();
    }

    parseInnerHTML() {
        if (this.component.render) this.children.push(...parseHTML(this.component.render(), this));
    }

    /**
     * @returns {Element}
     */
    build() {
        return this.element.cloneNode(true);
    }
}

/*
    PARSER
 */

class Token {}

class TokenTag extends Token {
    constructor(name, attribs) {
        super();
        this.name = name;
        this.attribs = attribs;
    }
}

class TokenOpenTag extends Token {
    constructor(name, attribs) {
        super();
        this.name = name;
        this.attribs = attribs;
    }
}

class TokenCloseTag extends Token {
    constructor(name) {
        super();
        this.name = name;
    }
}

class TokenString extends Token {
    constructor(text) {
        super();
        this.text = text;
    }
}

class ParseError extends Error {
    constructor(message) {
        super();
        this.message = message;
    }
}

function isWhitespace(c) {
    return c == " " || c == "\n" || c == "\r" || c == "\t";
}

function isOperator(c) {
    return c == "<" || c == ">" || c == "/" || c == "=" || c == "'" || c == '"';
}

/**
 * @param {string} str
 * @param {string[]} param
 * @returns {boolean}
 */
function containsOnly(str, param) {
    for (let ch of str) {
        if (!param.includes(ch)) {
            return false;
        }
    }
    return true;
}

/**
 * @param {string} source
 * @returns {Token[]}
 */
function tokenizeHTML(source) {
    /** @type {Token[]} */
    let tokens = [];
    let index = 0;

    while (index < source.length) {
        if (source[index] == "<") {
            index++;

            let name = "";
            let closing = false;

            if (source[index] == "/") {
                closing = true;
                index++;
            }

            while (index < source.length && !isWhitespace(source[index]) && !isOperator(source[index])) {
                name += source[index];
                index++;
            }

            if (closing) {
                // Closing tags are only allowed to have a whitespace after the name

                while (index < source.length && isWhitespace(source[index])) {
                    index++;
                }

                if (source[index] != ">") {
                    throw ParseError("Invalid character in closing tag");
                }

                index++;
                tokens.push(new TokenCloseTag(name));
            } else {
                // Parse attributes if any
                let attributes = new Map();

                while (index < source.length) {
                    while (index < source.length && isWhitespace(source[index])) {
                        index++;
                    }

                    let attributeName = "";

                    if (source[index] == ">") {
                        break;
                    } else if (source[index] == "/" || source[index] == ">") {
                        break;
                    } else if (isOperator(source[index])) {
                        throw new ParseError("unexpected character in open tag");
                    }

                    while (index < source.length && !isWhitespace(source[index]) && !isOperator(source[index])) {
                        attributeName += source[index];
                        index++;
                    }

                    while (index < source.length && isWhitespace(source[index])) {
                        index++;
                    }

                    if ((isOperator(source[index]) && source[index] != "=") || !isOperator(source[index])) {
                        attributes.set(attributeName, "");
                        continue;
                    } else if (source[index] == ">" || (source[index] == "/" && source[index + 1] == ">")) {
                        break;
                    } else if (source[index] != "=") {
                        throw new ParseError("unexpected character in open tag 2 ");
                    }

                    index++; // skip '='

                    while (index < source.length && isWhitespace(source[index])) {
                        index++;
                    }

                    let attributeValue = "";

                    if (source[index] == '"' || source[index] == "'") {
                        let delim = source[index];
                        let isEscape = false;

                        index++;

                        while (index < source.length && source[index] != delim && !isEscape) {
                            if (source[index] == "\\" && !isEscape) {
                                isEscape = true;
                            } else {
                                isEscape = false;
                                attributeValue += source[index];
                            }
                            index++;
                        }

                        if (source[index] != delim) {
                            throw new ParseError("expected string delimiter");
                        }

                        index++;
                    } else {
                        // TODO: implement custom types, like event listeners
                        throw new ParseError("expected string as attribute value");
                    }

                    attributes.set(attributeName, attributeValue);
                }

                if (source[index] == "/" && source[index + 1] == ">") {
                    index += 2;
                    tokens.push(new TokenTag(name, attributes));
                } else if (source[index] == ">") {
                    index++;
                    tokens.push(new TokenOpenTag(name, attributes));
                } else {
                    console.log(source[index]);
                    throw new ParseError("expected '>' or '/>' to close the tag ");
                }
            }
        } else {
            let s = "";

            while (index < source.length && source[index] != "<") {
                s += source[index];
                index++;
            }

            if (!containsOnly(s, [" ", "\n"])) {
                tokens.push(new TokenString(s));
            }
        }
    }

    return tokens;
}

/**
 * @param {VirtualNode} parent
 * @returns {boolean}
 */
function isInSvg(parent) {
    if (parent instanceof VirtualNodeElement && parent.element instanceof SVGElement) {
        return true;
    } else if (parent == null) {
        return false;
    } else {
        return isInSvg(parent.parentNode);
    }
}

function isValidSVGTag(name) {
    return (
        [
            "a",
            "animate",
            "animateMotion",
            "animateTransform",
            "circle",
            "clipPath",
            "defs",
            "desc",
            "ellipse",
            "feBlend",
            "feColorMatrix",
            "feComponentTransfer",
            "feComposite",
            "feConvolveMatrix",
            "feDiffuseLighting",
            "feDisplacementMap",
            "feDistantLight",
            "feDropShadow",
            "feFlood",
            "feFuncA",
            "feFuncB",
            "feFuncG",
            "feFuncR",
            "feGaussianBlur",
            "feImage",
            "feMerge",
            "feMergeNode",
            "feMorphology",
            "feOffset",
            "fePointLight",
            "feSpecularLighting",
            "feSpotLight",
            "feTile",
            "feTurbulence",
            "filter",
            "foreignObject",
            "g",
            "image",
            "line",
            "linearGradient",
            "marker",
            "mask",
            "metadata",
            "mpath",
            "path",
            "pattern",
            "polygon",
            "polyline",
            "radialGradient",
            "rect",
            "script",
            "set",
            "stop",
            "style",
            "svg",
            "switch",
            "symbol",
            "text",
            "textPath",
            "title",
            "tspan",
            "use",
            "view",
        ].find((v) => v === name) != undefined
    );
}

/**
 * @param {string} name
 * @param {Map<string, string>} attributes
 * @param {VirtualNode} parent
 * @param {Map<string, string>} params
 * @returns {VirtualNode}
 */
function createElement(name, attributes, parent) {
    let element = null;

    if (name == "svg" || (isInSvg(parent) && isValidSVGTag(name))) {
        element = document.createElementNS("http://www.w3.org/2000/svg", name);
    } else {
        element = document.createElement(name);
    }

    if (element instanceof HTMLUnknownElement) {
        const construct = components.get(name);

        if (construct == undefined) {
            throw new ParseError("Unknown component " + name);
        }

        const component = new construct();

        return createComponentNode(component, attributes, parent);
    }

    for (let attribute of attributes.keys()) {
        element.setAttribute(attribute, attributes.get(attribute));
    }

    return new VirtualNodeElement(element);
}

/**
 * @param {Token[]} tokens
 * @param {VirtualNode} parent
 * @returns {Array<VirtualNode>}
 */
function parseHTMLInner(tokens, parent) {
    let index = 0;
    let nodes = [];

    while (index < tokens.length) {
        if (tokens[index] instanceof TokenString) {
            nodes.push(new VirtualNodeText(tokens[index].text));
        } else if (tokens[index] instanceof TokenTag) {
            let element = createElement(tokens[index].name, tokens[index].attribs, parent);
            nodes.push(element);
        } else if (tokens[index] instanceof TokenOpenTag) {
            /** @type {TokenOpenTag} */
            let token = tokens[index];

            const tokenStart = index;
            let openTags = 0;
            let tagName = token.name;

            // find the closing tag, then recursively parse the tags
            index++;

            while (index < tokens.length) {
                if (tokens[index] instanceof TokenCloseTag && tokens[index].name == tagName && openTags == 0) {
                    break;
                } else if (tokens[index] instanceof TokenOpenTag && tokens[index].name == tagName) {
                    openTags++;
                } else if (tokens[index] instanceof TokenCloseTag && tokens[index].name == tagName) {
                    openTags--;
                }
                index++;
            }

            if (tokens[index] instanceof TokenCloseTag && tokens[index].name == tagName && openTags == 0) {
                const element = createElement(token.name, token.attribs, parent);
                const innerTokens = tokens.slice(tokenStart + 1, index);

                if (element instanceof VirtualNodeComponent) {
                    throw new ParseError("Components cannot have children");
                } else {
                    const children = parseHTMLInner(innerTokens, element);
                    element.children.push(...children);
                }

                nodes.push(element);
            } else {
                throw new ParseError("cannot find closing tag");
            }
        }

        index++;
    }

    return nodes;
}

/**
 * Parse a component's HTML code into an Element.
 *
 * @param {string} source
 * @param {VirtualNode} parent
 * @returns {Array<VirtualNode>}
 */
export function parseHTML(source, parent) {
    const tokens = tokenizeHTML(source);
    const nodes = parseHTMLInner(tokens, parent);

    return nodes;
}

/*
    ROOTER
 */

window.onpopstate = async () => {
    await router();
};

/**
 * @param {Node} node
 * @returns {string}
 */
function elementToString(node) {
    if (node instanceof VirtualNodeElement) {
        let element = node.element;
        let s = element.tagName + "-attribs[";

        for (let index = 0; index < element.attributes.length; index++) {
            s += element.attributes.item(index).name + "=" + element.attributes.item(index).value;
        }

        s += "]-class[";

        for (let index = 0; index < element.classList.length; index++) {
            s += element.classList.item(index) + ",";
        }

        s += "]";
        return s;
    } else if (node instanceof VirtualNodeText) {
        return "TEXT-" + node.text;
    } else if (node instanceof VirtualNodeComponent) {
        return "COMPONENT-" + node.name + "-" + node.id;
    }
}

function matchRoute(routes, path) {
    const parts = path.substring(1).split("/");

    for (let route of routes) {
        const routeParts = route.path.substring(1).split("/");

        if (routeParts.length !== parts.length) {
            continue;
        }

        let params = new Map();

        let index = 0;
        for (; index < parts.length; index++) {
            let part = parts[index];
            let routePart = routeParts[index];

            if (routePart[0] == "[" && routePart[routePart.length - 1] == "]") {
                /** @type {string} */
                let param = routePart.substring(1, routePart.length - 1);
                let value = part;

                if (param.includes("=")) {
                    let name = param.substring(0, param.indexOf("="));
                    let values = param.substring(param.indexOf("=") + 1);

                    if (values[0] == "$" && values[values.length - 1] == "$") {
                        const regex = new RegExp(values.substring(1, values.length - 1));

                        if (!regex.test(value)) {
                            break;
                        }
                    } else {
                        let values2 = values.split(",");

                        if (!values2.includes(value)) {
                            break;
                        }
                    }

                    param = name;
                }

                params.set(param, value);
            } else if (routePart != part) {
                break;
            }
        }

        if (index == parts.length) {
            return { route: route, params: params };
        }
    }

    return undefined;
}

/**
 * @param {VirtualNode} oldNode
 * @param {VirtualNode} newNode
 * @param {Element} oldElement
 * @param {Element} parentElement
 */
async function updateDOM(oldNode, newNode, oldElement, parentElement) {
    if (oldNode == undefined) {
        let newElement = newNode.build();
        parentElement.appendChild(newElement);

        // console.log(parentElement, newElement, parentElement.childNodes);
        // console.log("adding", newElement, "to", parentElement);
        // console.log(newNode.children);

        if (!(newNode instanceof VirtualNodeText)) {
            await newNode.mount();

            for (let child of newNode.children) {
                await updateDOM(undefined, child, parentElement, newElement);
            }

            if (newNode instanceof VirtualNodeComponent && newNode.component.onready) {
                await newNode.component.onready();
            }
        }

        return;
    }

    if (parentElement instanceof Text) {
        return;
    }

    let oldString = elementToString(oldNode);
    let newString = elementToString(newNode);

    if (oldString != newString) {
        let newElement = newNode.build();

        // console.log(newElement, oldElement);

        oldNode.clean();
        parentElement.replaceChild(newElement, oldElement);

        console.log("replacing", oldString, "with", newString);

        if (!(newNode instanceof VirtualNodeText)) {
            await newNode.mount();

            for (let child of newNode.children) {
                await updateDOM(undefined, child, parentElement, newElement);
            }

            if (newNode instanceof VirtualNodeComponent && newNode.component.onready) {
                await newNode.component.onready();
            }
        }

        return;
    }

    if (newNode instanceof VirtualNodeText) {
        // Text nodes cant have children
        return;
    }

    let index = 0;

    await newNode.mount(); // what

    for (; index < oldNode.children.length; index++) {
        if (index >= newNode.children.length) {
            let oldNode2 = oldNode.children.at(index);
            let oldElement2 = oldElement.childNodes.item(index);

            oldNode2.clean();

            console.log("removing ", oldElement2);
            oldElement.removeChild(oldElement2);
        } else {
            let oldNode2 = oldNode.children.at(index);
            let newNode2 = newNode.children.at(index);
            // console.log(oldNode, oldElement, parentElement);
            // console.log(oldNode.children.length, newNode.children.length, oldElement.childNodes.length);
            let oldElement2 = oldElement.childNodes.item(index);

            await updateDOM(oldNode2, newNode2, oldElement2, oldElement);
        }
    }

    for (; index < newNode.children.length; index++) {
        let newElement = newNode.children[index].build();

        parentElement.append(newElement);
        await newElement.mount();

        if (!(newNode instanceof VirtualNodeText)) {
            for (let child of newNode.children) {
                await updateDOM(undefined, child, parentElement, newElement);

                if (newNode instanceof VirtualNodeComponent && newNode.component.onready) {
                    await newNode.component.onready();
                }
            }
        }
    }
}

/** @type {VirtualNode} */
let rootNode;
let initialPageLoad = true;

async function router() {
    let app = document.getElementById("micro-app");

    if (routerSettings == undefined) {
        return;
    }

    const route = matchRoute(routerSettings.routes, location.pathname);
    /** @type {VirtualNodeComponent} */
    let newNode;

    // This should not be called here, only once during load and after each hot reload
    // registerAll();

    if (route != undefined) {
        if (routerSettings.hook && initialPageLoad) {
            // We don't want to call the hook every time we refresh the page, only when navigating
            // between pages.
            await routerSettings.hook(route.route.path);
        }

        let attributes;

        if (route.route.attributes != undefined) {
            attributes = new Map(Object.entries(route.route.attributes));
        }

        params = route.params;

        let view = new route.route.view();

        newNode = await createComponentNode(view, attributes, undefined);
    } else if (routerSettings.notFound != undefined) {
        let view = new routerSettings.notFound();

        newNode = await createComponentNode(view, new Map(), undefined);
    }

    await updateDOM(rootNode, newNode, app.firstElementChild, app);
    // console.log(document.querySelector(".container-fluid.round-container"));

    // let observer = new MutationObserver((mutationList, observer) => {
    //     for (let mutation of mutationList) {
    //         if (mutation.type == "childList") {
    //             console.log(mutation.removedNodes);
    //         }
    //     }
    // });

    // observer.observe(document.querySelector(".container-fluid.round-container").parentElement, {
    //     attributes: true,
    //     childList: true,
    //     subtree: true,
    // });

    rootNode = newNode;

    initialPageLoad = false;
}

/**
 * @param {import("./micro").RouterSettings} settings
 */
export function defineRouter(settings) {
    routerSettings = settings;

    document.addEventListener("DOMContentLoaded", async () => {
        // Prevent <a> tags from reloading the page by preventing the default behaviour
        // and using our own `navigateTo`
        document.body.addEventListener("click", async (event) => {
            /** @type {Element | null} */
            let target = event.target;

            while (target != null && !(target instanceof HTMLAnchorElement)) {
                target = target.parentElement;
            }

            if (target instanceof HTMLAnchorElement) {
                event.preventDefault();
                navigateTo(target.href);
            }
        });

        await router();
    });

    // TODO: This only works when saving this file for some reason
    if (import.meta.hot) {
        import.meta.hot.accept(async (newModule) => {
            await router();
        });
    }
}

/**
 * Redirect to another page without reload.
 *
 * @param {string} url
 */
export function navigateTo(url) {
    history.pushState(null, null, url);
    initialPageLoad = true;
    setTimeout(async () => await router());
}

/**
 * Force the refresh of the DOM.
 */
export async function dirty() {
    await router();
}
