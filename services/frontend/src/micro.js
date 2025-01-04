import { registerAll } from "./micro.generated";

/**
 * @type Map<string, any>
 */
export let components = new Map();
let routerSettings = undefined;

/*
    ROOTER
 */

// TODO: This only works when saving this file for some reason
if (import.meta.hot) {
    import.meta.hot.accept(async (newModule) => {
        registerAll();
        await router();
    });
}

window.onpopstate = async () => {
    await router();
};

async function handleRedirect(callback) {
    try {
        return await callback();
    } catch (ex) {
        if (ex.url != undefined) {
            history.pushState(null, null, ex.url);
            await router();
        } else {
            throw ex;
        }
    }
}

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
                let param = routePart.substring(1, routePart.length - 1);
                let value = part;

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
    let oldElement = app.firstElementChild;

    if (routerSettings == undefined) {
        return;
    }

    const route = matchRoute(routerSettings.routes, location.pathname);

    if (route == undefined) {
        console.error("TODO: 404!");
        return;
    }

    // This should not be called here, only once during load and after each hot reload
    registerAll();

    /** @type {{object: any, element: Element}} */
    const { object, element } = await handleRedirect(
        async () => await createComponent(route.route.view, new Map(), route.params)
    );

    await registerComponentCallbacks(element, object);

    if (element == undefined) {
        throw new Error("What happened here ????");
    }

    if (oldElement == null) {
        app.append(element);
    } else {
        applyTreeDifference(oldElement, element);
    }
}

/**
 * @param {import("./micro").RouterSettings} settings
 */
export function defineRouter(settings) {
    routerSettings = settings;

    document.addEventListener("DOMContentLoaded", async () => {
        // Prevent <a> tags from reloading the page by preventing the default behaviour
        // and using our own `navigateTo`
        // TODO: check parents ?
        document.body.addEventListener("click", async (event) => {
            if (event.target instanceof HTMLAnchorElement) {
                event.preventDefault();
                await handleRedirect(async () => navigateTo(event.target.href));
            }
        });

        await handleRedirect(async () => await router());
    });
}

class NavigateTo {
    constructor(url) {
        this.url = url;
    }
}

/**
 * Redirect to another page without reload.
 *
 * @param {string} url
 */
export function navigateTo(url) {
    throw new NavigateTo(url);
}

/*
    COMPONENT MANIPULATION
 */

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
 * @param {any} comp
 * @param {Map<string, string>} attributes
 * @param {Map<string, string>} params
 * @returns {Promise<Element>}
 */
async function createComponent(comp, attributes, params) {
    let object = {
        params: params,
        dom: new ComponentDOM(),
        attributes: attributes,
    };

    const element = await parseHTML(await comp(object), comp.name);
    return { object, element };
}

async function registerComponentCallbacks(element, object) {
    for (let elementRef of object.dom.elements) {
        if (elementRef.type == "querySelector") {
            let query = element.querySelector(elementRef.selector);

            if (query == null) {
                console.warn("invalid querySelector string", elementRef.selector);
                continue;
            }

            for (let [eventName, callback] of elementRef.eventCallbacks.entries()) {
                query.addEventListener(eventName, async () => await handleRedirect(callback));
            }
        } else if (elementRef.type == "querySelectorAll") {
            let query = element.querySelectorAll(elementRef.selector);

            if (query.length == 0) {
                console.warn("invalid querySelectorAll string", elementRef.selector);
                continue;
            }

            for (let el of query) {
                for (let [eventName, callback] of elementRef.eventCallbacks.entries()) {
                    el.addEventListener(eventName, async () => await handleRedirect(callback));
                }
            }
        } else {
            throw new Error("invalid reference type " + elementRef.type);
        }

        // Execute `do` callbacks
        for (let callback of elementRef.doCallbacks) {
            await callback(element);
        }
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
 * @returns {Promise<Element | { object: any, element: Element } | undefined>}
 */
async function createElement(name, attributes, parent, params) {
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

        return await createComponent(component, attributes, params);
    }

    for (let attribute of attributes.keys()) {
        element.setAttribute(attribute, attributes.get(attribute));
    }

    return element;
}

/**
 * @param {Token[]} tokens
 * @param {HTMLElement} parent
 */
async function parseHTMLInner(tokens, parent, params) {
    let index = 0;

    while (index < tokens.length) {
        if (tokens[index] instanceof TokenString) {
            parent.append(tokens[index].text);
        } else if (tokens[index] instanceof TokenTag) {
            const res = await createElement(tokens[index].name, tokens[index].attribs, parent, params);

            if (res.element != undefined) {
                await registerComponentCallbacks(res.element, res.object);
                parent.append(res.element);
            } else {
                parent.append(res);
            }
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
                const element = await createElement(token.name, token.attribs, parent, params);

                if (element.element != undefined && element.element.hasAttribute("micro-component")) {
                    const innerTokens = tokens.slice(tokenStart + 1, index);

                    await parseHTMLInner(innerTokens, element.element);
                    await registerComponentCallbacks(element.element, element.object);
                    parent.append(element.element);
                } else {
                    const innerTokens = tokens.slice(tokenStart + 1, index);

                    await parseHTMLInner(innerTokens, element);
                    parent.append(element);
                }
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
 * @returns {Promise<HTMLElement>}
 */
async function parseHTML(source, name, params) {
    const tokens = tokenizeHTML(source, name);
    // console.log(...tokens);

    let div = document.createElement("div");
    div.classList.add("micro-" + name);
    div.setAttribute("micro-component", "");

    await parseHTMLInner(tokens, div, params);
    return div;
}
