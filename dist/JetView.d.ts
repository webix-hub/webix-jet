import { JetBase } from "./JetBase";
import { IJetApp, IJetURL, IJetView, IJetViewFactory, IUIConfig } from "./interfaces";
export declare class JetView extends JetBase {
    private _children;
    constructor(app: IJetApp, name: string);
    ui(ui: webix.ui.viewConfig | IJetViewFactory, config?: IUIConfig): webix.ui.baseview | IJetView;
    show(path: any, config?: any): Promise<any>;
    init(_$view: webix.ui.baseview, _$url: IJetURL): void;
    ready(_$view: webix.ui.baseview, _$url: IJetURL): void;
    config(): any;
    urlChange(_$view: webix.ui.baseview, _$url: IJetURL): void;
    destroy(): void;
    destructor(): void;
    use(plugin: any, config: any): void;
    protected _render(url: IJetURL): Promise<any>;
    protected _render_final(config: any, url: IJetURL): Promise<any>;
    protected _init(view: webix.ui.baseview, url: IJetURL): void;
    protected _urlChange(url: IJetURL): Promise<any>;
    private _initError(view, err);
    private _createSubView(sub, suburl);
    private _renderSubView(sub, view, suburl);
    private _finishShow(url, path);
    private _renderPartial(url);
    private _checkSubViews(mode, url);
}
