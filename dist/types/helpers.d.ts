import { IJetURLChunk } from "./interfaces";
export declare function diff(oUrl: any, nUrl: any): number;
export declare function parse(url: string): IJetURLChunk[];
export declare function url2str(stack: IJetURLChunk[]): string;
