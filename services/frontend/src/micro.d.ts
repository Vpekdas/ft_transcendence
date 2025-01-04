// Component types

export type ComponentDOMElementRef = {
    on(name: string, callback: any): void;
    do(callback: any): void;
};

export type ComponentDOM = {
    querySelector(selector: string): ComponentDOMElementRef;
    querySelectorAll(selector: string): ComponentDOMElementRef;
};

export type Component = (_: {
    params: Map<string, string>;
    attributes: Map<string, string>;
    dom: ComponentDOM;
}) => string;

// Router types

export type RouterSettings = { routes: { path: string; comp: any }[] };

// Parser types

export type Location = {
    line: number;
    column: number;
    length: number;
};
