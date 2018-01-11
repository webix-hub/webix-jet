import { IJetRouter, IJetRouterCallback, IJetRouterOptions } from "../interfaces";
export declare class StoreRouter implements IJetRouter {
    private name;
    private cb;
    constructor(cb: IJetRouterCallback, config: any);
    set(path: string, config?: IJetRouterOptions): void;
    get(): any;
}
