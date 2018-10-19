import { IJetApp, IJetURL, IJetView, ISubView, ISubViewInfo } from "./interfaces";
export declare abstract class JetBase implements IJetView {
    app: IJetApp;
    webixJet: boolean;
    _name: string;
    protected _parent: IJetView;
    protected _index: number;
    protected _container: HTMLElement | webix.ui.baseview;
    protected _root: webix.ui.baseview;
    protected _id: number;
    protected _events: {
        id: string;
        obj: any;
    }[];
    protected _subs: {
        [name: string]: ISubView;
    };
    private _data;
    private _url;
    constructor();
    getRoot(): webix.ui.baseview;
    destructor(): void;
    setParam(id: string, value: any, url?: boolean): void;
    getParam(id: string, parent: boolean): any;
    getUrl(): IJetURL;
    render(root?: string | HTMLElement | webix.ui.baseview, url?: IJetURL, parent?: IJetView): Promise<webix.ui.baseview>;
    getIndex(): number;
    getId(): number;
    getParentView(): IJetView;
    $$(id: string | webix.ui.baseview): webix.ui.baseview;
    on(obj: any, name: any, code: any): any;
    contains(view: IJetView): boolean;
    getSubView(name?: string): IJetView;
    getSubViewInfo(name?: string): ISubViewInfo;
    getName(): string;
    abstract refresh(): any;
    abstract show(path: any, config?: any): any;
    protected abstract _render(url: IJetURL): Promise<any>;
    protected abstract _urlChange(url: IJetURL): Promise<any>;
    protected _destroySubs(): void;
    protected _init_url_data(url: IJetURL): void;
}
