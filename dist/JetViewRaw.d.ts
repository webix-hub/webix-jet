import { IJetApp } from "./interfaces";
import { JetView } from "./JetView";
export declare class JetViewRaw extends JetView {
    private _ui;
    constructor(app: IJetApp, name: string, ui: any);
    config(): any;
}
