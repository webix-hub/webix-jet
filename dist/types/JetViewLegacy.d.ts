import { IJetApp, IJetURL } from "./interfaces";
import { JetView } from "./JetView";
export declare class JetViewLegacy extends JetView {
    private _ui;
    private _windows;
    constructor(app: IJetApp, name: string, ui: any);
    getRoot(): webix.ui.baseview;
    config(): any;
    destructor(): void;
    show(path: string, config: any): Promise<any>;
    init(): void;
    ready(): void;
    protected _realInitHandler(): void;
    protected _urlChange(url: IJetURL): Promise<any>;
}
