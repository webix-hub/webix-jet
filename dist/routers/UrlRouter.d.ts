import { IJetRouter, IJetRouterCallback, IJetRouterOptions } from "../interfaces";
export declare class UrlRouter implements IJetRouter {
    private cb;
    private prefix;
    constructor(cb: IJetRouterCallback, config: any);
    set(path: string, config?: IJetRouterOptions): void;
    get(): string;
}
