// Component types

export type DoCallback = ((component: Element) => Promise<void>) | ((component: Element) => void);

export type ComponentDOMElementRef = {
    on(name: string, callback: any): void;
    do(callback: DoCallback): void;
};

export type ComponentDOM = {
    querySelector(selector: string): ComponentDOMElementRef;
    querySelectorAll(selector: string): ComponentDOMElementRef;
};

export type Stores = {
    usePersistent(name: string, defaultValue: any): [() => typeof defaultValue, (value: typeof defaultValue) => void];
};

export type Component = (_: {
    params: Map<string, string>;
    attributes: Map<string, string>;
    dom: ComponentDOM;
    stores: Stores;
}) => string;

// Router types

export type RouterHook = (route: string) => void;
export type RouterSettings = { routes: { path: string; comp: any }[]; hook: RouterHook; notFound: Component };

// Parser types

export type Location = {
    line: number;
    column: number;
    length: number;
};
