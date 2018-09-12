import { IJetRouter, IJetRouterCallback, IJetRouterOptions } from "../interfaces";
export declare class SubRouter implements IJetRouter {
    private path;
    private parent;
    private prefix;
    constructor(cb: IJetRouterCallback, config: any);
    set(path: string, config?: IJetRouterOptions): void;
    get(): string;
}
