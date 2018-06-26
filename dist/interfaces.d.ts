export interface IWebixFacade {
    $$(id: string): webix.ui.baseview;
    ui(config: any, cont?: string | HTMLElement | webix.ui.baseview): webix.ui.baseview;
    bind(handler: any, master: any): any;
    message(text: string): any;
    toNode(id: string): HTMLElement;
    uid(): string;
    extend(a: any, b: any, force: boolean): any;
}
export interface IUIConfig {
    container?: string | HTMLElement;
}
export interface IJetApp {
    webix: IWebixFacade;
    config: IJetConfig;
    canNavigate(name: string, view?: IJetView): Promise<string>;
    getService(name: string): any;
    setService(name: string, obj: any): void;
    callEvent(name: string, parameters: any[]): boolean;
    attachEvent(name: string, handler: any): void;
    createFromURL(url: IJetURLChunk[], now?: IJetView): Promise<IJetView>;
    show(path: any): any;
    createView(obj: any, name?: string): IJetView;
    refresh(): any;
    error(name: string, data: any[]): any;
    copyConfig(source: any, target: any, config?: IViewConfig): any;
    getRouter(): IJetRouter;
}
export interface IJetURLChunk {
    index: number;
    page: string;
    params: {
        [name: string]: string;
    };
}
export declare type IJetURL = IJetURLChunk[];
export interface IJetView {
    app: IJetApp;
    $$(name: string): webix.ui.baseview;
    contains(view: IJetView): boolean;
    getName(): string;
    getIndex(): number;
    getId(): number;
    getSubView(name?: string): IJetView;
    getSubViewInfo(name?: string): ISubViewInfo;
    getRoot(): webix.ui.baseview;
    setParam(id: string, value: any, url?: boolean): any;
    getParam(id: string, parent: boolean): any;
    getUrl(): IJetURL;
    getParentView(): IJetView;
    refresh(): any;
    render(area: webix.ui.baseview | string | HTMLElement, url?: IJetURL, parent?: IJetView): Promise<webix.ui.baseview>;
    destructor(): any;
    on(obj: any, name: string, code: any): any;
    show(path: any, config?: any): any;
}
export interface IHash {
    [name: string]: any;
}
export interface IJetConfig {
    debug?: boolean;
    jet1xMode?: boolean;
    name?: string;
    version?: string;
    start?: string;
    webix?: IWebixFacade;
    container: HTMLElement | string;
    animation: boolean;
    router: IJetRouterFactory;
    views: ((url: string) => any) | IHash;
}
export interface IJetRouterOptions {
    [name: string]: any;
}
export interface IJetRouterFactory {
    new (cb: IJetRouterCallback, config?: any): any;
}
export interface IJetViewFactory {
    new (app: IJetApp, name: string): any;
}
export interface IJetRouter {
    get(): string;
    set(name: string, options?: IJetRouterOptions): void;
}
export declare type IJetRouterCallback = (url?: string) => any;
export interface IViewConfig {
    [name: string]: ISubView;
}
export interface ISubView {
    view?: IJetView;
    url: string | IJetViewFactory | IJetApp;
    name?: string;
    id: string;
}
export interface ISubViewInfo {
    subview: ISubView;
    parent: IJetView;
}
