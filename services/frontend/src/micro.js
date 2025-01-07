import { registerAll } from "./micro.generated";

/**
 * @type Map<string, any>
 */
export let components = new Map();
let routerSettings = undefined;
let initialPageLoad = true;

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
    if (node instanceof Element) {
        let s = node.tagName + "-attribs[";

        for (let index = 0; index < node.attributes.length; index++) {
            s += node.attributes.item(index).name + "=" + node.attributes.item(index).value;
        }

        s += "]-class[";

        for (let index = 0; index < node.classList.length; index++) {
            s += node.classList.item(index);
        }

        s += "]";
        return s;
    } else if (node instanceof Text) {
        return node.data;
    }
}

/**
 * Recursively go down through the node tree and replace nodes only when necessary.
 *
 * @param {Element} old
 * @param {Element} element
 */
function applyTreeDifference(old, element) {
    let index = 0;

    // NOTE: When calling `Element.replaceChild` the node is removed from the original tree before
    //       replacing in the new tree, decrementing `element.childNodes.length` in the process.
    //       We need to clone the node before!

    for (; index < old.childNodes.length; index++) {
        if (index >= element.childNodes.length) {
            old.removeChild(old.childNodes.item(index));
        } else {
            let oldString = elementToString(old.childNodes.item(index));
            let newString = elementToString(element.childNodes.item(index));

            if (oldString != newString) {
                // replace the node
                old.replaceChild(element.childNodes[index].cloneNode(true), old.childNodes[index]);
            } else {
                // nothing to do, go down the tree recursively
                if (old.childNodes[index] instanceof Element) {
                    applyTreeDifference(old.childNodes[index], element.childNodes[index]);
                }
            }
        }
    }

    for (; index < element.childNodes.length; index++) {
        old.appendChild(element.childNodes.item(index));
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

async function router() {
    let app = document.getElementById("micro-app");
    let node = new ComponentNode(undefined, "$Root", undefined);
    let oldElement = app.firstElementChild;

    if (routerSettings == undefined) {
        return;
    }

    const route = matchRoute(routerSettings.routes, location.pathname);
    let newElement;

    // This should not be called here, only once during load and after each hot reload
    registerAll();

    if (route != undefined) {
        if (routerSettings.hook && initialPageLoad) {
            // We don't want to call the hook every time we refresh the page, only when navigating
            // between pages.
            await routerSettings.hook(route.route.path);
        }

        let attributes = new Map();

        if (route.route.attributes != undefined) {
            attributes = new Map(Object.entries(route.route.attributes));
        }

        newElement = await createComponent(route.route.view, attributes, route.params, node);
    } else if (routerSettings.notFound != undefined) {
        newElement = await createComponent(routerSettings.notFound, new Map(), new Map(), node);
    } else {
        const element = await parseHTML(
            "<div style='width: 100%; height: 100%; background-color: white; text-align: center;'><h1>404 - Not Found</h1></div>",
            undefined,
            undefined,
            new ComponentNode({}, "", undefined)
        );
        newElement = element;
    }

    if (newElement == undefined) {
        throw new Error("Invalid view");
    }

    if (oldElement == null) {
        app.append(newElement);
    } else {
        app.replaceChildren([]);
        app.appendChild(newElement);
        // applyTreeDifference(oldElement, newElement);
    }

    // TODO: Restore the previous behavior with applyTreeDifference and the two following calls inside a if (initialPageLoad)
    //       But find why elements with the differente class are not replaced correctly in applyTreeDifference

    node.addEventListeners();
    await node.applyDoCallbacks();

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
            registerAll();
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

class ComponentNode {
    /**
     * @param {any} object
     * @param {string} name
     */
    constructor(object, name, parent) {
        /** @type {Array<ComponentNode>} */
        this.children = [];
        this.object = object;
        this.parent = parent;
        this.name = name;

        // TODO: Id cant be random or reloading the page will not work
        this.id = name + "-" + this.createComponentId();
    }

    /**
     * @param {ComponentNode} node
     */
    appendChild(node) {
        this.children.push(node);
    }

    addEventListeners() {
        for (let child of this.children) {
            child.addEventListeners();
        }

        if (this.object != undefined) {
            const element = document.querySelector("." + this.id);

            if (element == undefined) {
                throw new Error("no component with id " + this.id);
            }

            for (let elementRef of this.object.dom.elements) {
                if (elementRef.type == "querySelector") {
                    /** @type {Element} */
                    let query = element.querySelector(elementRef.selector);

                    if (query == null) {
                        console.warn("invalid querySelector string", elementRef.selector);
                        continue;
                    }

                    for (let [eventName, callback] of elementRef.eventCallbacks.entries()) {
                        query.addEventListener(eventName, callback);
                    }
                } else if (elementRef.type == "querySelectorAll") {
                    let query = element.querySelectorAll(elementRef.selector);

                    if (query.length == 0) {
                        console.warn("invalid querySelectorAll string", elementRef.selector);
                        continue;
                    }

                    for (let el of query) {
                        for (let [eventName, callback] of elementRef.eventCallbacks.entries()) {
                            el.addEventListener(eventName, callback);
                        }
                    }
                }
            }
        }
    }

    async applyDoCallbacks() {
        for (let child of this.children) {
            await child.applyDoCallbacks();
        }

        if (this.object != undefined) {
            const element = document.querySelector("." + this.id);

            for (let elementRef of this.object.dom.elements) {
                if (elementRef.type == "querySelector") {
                    let query = element.querySelector(elementRef.selector);

                    if (query == null) {
                        console.warn("invalid querySelector string", elementRef.selector);
                        continue;
                    }

                    for (let elementRef of this.object.dom.elements) {
                        for (let callback of elementRef.doCallbacks) {
                            await callback(query);
                        }
                    }
                } else if (elementRef.type == "querySelectorAll") {
                    let query = element.querySelectorAll(elementRef.selector);

                    if (query.length == 0) {
                        console.warn("invalid querySelectorAll string", elementRef.selector);
                        continue;
                    }

                    for (let el of query) {
                        for (let elementRef of this.object.dom.elements) {
                            for (let callback of elementRef.doCallbacks) {
                                await callback(query);
                            }
                        }
                    }
                }
            }
        }
    }

    createComponentId() {
        let parents = [];
        let node = this.parent;

        while (node != undefined) {
            parents.push(node.name);
            node = node.parent;
        }

        return hash(parents.reverse().join("-")).toString(32);
    }
}

/**
 * An interface to manipulate the inner DOM of a component.
 */
class ComponentDOM {
    constructor() {
        /** @type {Array<ComponentDOMElementRef} */
        this.elements = [];
    }

    /**
     * @param {string} name
     * @param {any} callback
     * @returns {ComponentDOMElementRef}
     */
    querySelector(selector) {
        const ref = new ComponentDOMElementRef("querySelector", selector);
        this.elements.push(ref);
        return ref;
    }

    /**
     * @param {string} name
     * @param {any} callback
     */
    querySelectorAll(selector) {
        const ref = new ComponentDOMElementRef("querySelectorAll", selector);
        this.elements.push(ref);
        return ref;
    }
}

class ComponentDOMElementRef {
    constructor(type, selector) {
        this.type = type;
        this.selector = selector;
        this.eventCallbacks = new Map();
        this.doCallbacks = [];
    }

    /**
     * @param {string} name
     * @param {any} callback
     */
    on(name, callback) {
        this.eventCallbacks.set(name, callback);
    }

    /**
     * @param {any} callback
     */
    do(callback) {
        this.doCallbacks.push(callback);
    }
}

/**
 * An interface to access different types of scores.
 */
class Stores {
    constructor(componentName) {
        this.componentName = componentName;
        this.stores = new Map();
    }

    // /**
    //  * @param {string} name
    //  * @returns {[ value: typeof defaultValue, setValue: (value: typeof defaultValue) => void ]}
    //  */
    // use(name, defaultValue) {}

    /**
     * A store which use localStorage to persist its value.
     *
     * @param {string} name
     * @returns {[() => typeof defaultValue, (value: typeof defaultValue) => void ]}
     */
    usePersistent(name, defaultValue) {
        const fullName = this.componentName + "_" + name;

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
 * @param {any} comp
 * @param {Map<string, string>} attributes
 * @param {Map<string, string>} params
 * @param {ComponentNode} parentNode
 * @returns {Promise<Element>}
 */
async function createComponent(comp, attributes, params, parentNode) {
    let object = {
        params: params,
        dom: new ComponentDOM(),
        attributes: attributes,
        stores: new Stores(comp.name),
    };

    const node = new ComponentNode(object, comp.name, parentNode);
    object.node = node;

    const element = await parseHTML(await comp(object), comp.name, params, node);
    element.classList.add(node.id);

    parentNode.appendChild(node);

    return element;
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
 * @param {string} source
 * @returns {Token[]}
 */
function tokenizeHTML(source, parentName) {
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

                    if (!isOperator(source[index]) && source[index] != "=") {
                        attributes.set(attributeName, "");
                        continue;
                    } else if (source[index] == ">" || (source[index] == "/" && source[index + 1] == ">")) {
                        break;
                    } else if (source[index] != "=") {
                        throw new ParseError("unexpected character in open tag 2 " + parentName);
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
                    throw new ParseError("expected '>' or '/>' to close the tag " + parentName);
                }
            }
        } else {
            let s = "";

            while (index < source.length && source[index] != "<") {
                s += source[index];
                index++;
            }

            tokens.push(new TokenString(s));
        }
    }

    return tokens;
}

/**
 * @param {HTMLElement} parent
 * @returns {boolean}
 */
function isInSvg(parent) {
    if (parent instanceof SVGElement) {
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
 * @param {Element} parent
 * @param {Map<string, string>} params
 * @param {ComponentNode} parentNode
 * @returns {Promise<Element | undefined>}
 */
async function createElement(name, attributes, parent, params, parentNode) {
    let element = null;

    if (name == "svg" || (isInSvg(parent) && isValidSVGTag(name))) {
        element = document.createElementNS("http://www.w3.org/2000/svg", name);
    } else {
        element = document.createElement(name);
    }

    if (element instanceof HTMLUnknownElement) {
        const component = components.get(name);

        if (component == undefined) {
            throw new ParseError("Unknown component " + name);
        }

        return await createComponent(component, attributes, params, parentNode);
    }

    for (let attribute of attributes.keys()) {
        element.setAttribute(attribute, attributes.get(attribute));
    }

    return element;
}

/**
 * @param {Token[]} tokens
 * @param {HTMLElement} parent
 * @param {Map<string, string>} params
 * @param {ComponentNode} parentNode
 */
async function parseHTMLInner(tokens, parent, params, parentNode) {
    let index = 0;

    while (index < tokens.length) {
        if (tokens[index] instanceof TokenString) {
            parent.append(tokens[index].text);
        } else if (tokens[index] instanceof TokenTag) {
            const res = await createElement(tokens[index].name, tokens[index].attribs, parent, params, parentNode);

            parent.append(res);
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
                const element = await createElement(token.name, token.attribs, parent, params, parentNode);
                const innerTokens = tokens.slice(tokenStart + 1, index);

                await parseHTMLInner(innerTokens, element, params, parentNode);
                parent.append(element);
            } else {
                throw new ParseError("cannot find closing tag");
            }
        }

        index++;
    }
}

/**
 * Parse an HTML string into an HTMLElement
 *
 * @param {string} source
 * @param {string} name
 * @param {Map<string, string>} params
 * @param {ComponentNode} parentNode
 * @returns {Promise<HTMLElement>}
 */
export async function parseHTML(source, name, params, parentNode) {
    const tokens = tokenizeHTML(source, name);
    // console.log(...tokens);

    let div = document.createElement("div");
    div.classList.add("micro-" + name);

    await parseHTMLInner(tokens, div, params, parentNode);
    return div;
}
