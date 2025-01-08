// Component types

export type EventCallback = ((event: Event) => Promise<void>) | ((event: Event) => void);
export type DoCallback = ((component: Element) => Promise<void>) | ((component: Element) => void);

export type ComponentDOMElementRef = {
    on(name: string, callback: EventCallback): void;
    do(callback: DoCallback): void;
};

export type ComponentMountEvent = {};
export type ComponentDeleteEvent = {};

export type ComponentEvent = {
    // "mount": ComponentMountEvent,
    "delete": ComponentDeleteEvent
};

export type ComponentEventCallback<T> = ((event: T) => void) | ((event: T) => Promise<void>);

export type ComponentDOM = {
    querySelector(selector: string): ComponentDOMElementRef;
    querySelectorAll(selector: string): ComponentDOMElementRef;

    addEventListener(event: keyof ComponentEvent, callback: ComponentEventCallback<ComponentEvent[event]>): void;
};

export type Stores = {
    usePersistent(name: string, defaultValue: any): [() => typeof defaultValue, (value: typeof defaultValue) => void];
};

export type ComponentParams = {
    params: Map<string, string>;
    attributes: Map<string, string>;
    dom: ComponentDOM;
    stores: Stores;
};

export type Component = (_: ComponentParams) => string;

// Router types

export type RouterHook = (route: string) => void;
export type RouterSettings = {
    routes: { path: string; comp: any; attributes: any }[];
    hook: RouterHook;
    notFound: Component;
};

// Parser types

export type Location = {
    line: number;
    column: number;
    length: number;
};
