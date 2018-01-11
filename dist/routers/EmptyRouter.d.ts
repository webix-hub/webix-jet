import { IJetRouter, IJetRouterCallback, IJetRouterOptions } from "../interfaces";
export declare class EmptyRouter implements IJetRouter {
    private path;
    private cb;
    constructor(cb: IJetRouterCallback, _$config: any);
    set(path: string, config?: IJetRouterOptions): void;
    get(): string;
}
