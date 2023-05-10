// Type definitions for node-polyglot v0.4.1
// Project: https://github.com/airbnb/polyglot.js
// Definitions by: Tim Jackson-Kiely <https://github.com/timjk>
// Definitions: https://github.com/borisyankov/DefinitelyTyped

interface IInterpolationOptions {
	smart_count?: number;
	_?: string;
}
interface IPolyglotOptions {
	phrases?: any;
	locale?: string;
}

export default class Polyglot {
	constructor(options?: IPolyglotOptions);
	extend(phrases: any): void;
	t(phrase: string, smartCount?: number|IInterpolationOptions): string;
	clear(): void;
	replace(phrases: any): void;
	locale(): string;
	locale(locale: string): void;
}
