import { JetBase } from "./JetBase";
import { JetViewRaw } from "./JetViewRaw";
import { JetView } from "./JetView";
import {SubRouter} from "./routers/SubRouter";

import {
	IBaseView, IJetApp, IJetConfig, IJetRouter,
	IJetURL, IJetURLChunk,
	IJetView, IRoute, ISubView, IViewConfig } from "./interfaces";

import { Route } from "./Route";

let _once = true;

export class JetAppBase extends JetBase implements IJetView {
	public config: IJetConfig;
	public app: IJetApp;
	public ready: Promise<any>;

	callEvent: (name: string, parameters: any[]) => boolean;
	attachEvent: (name: string, handler: any) => void;

	private $router: IJetRouter;
	private _services: { [name: string]: any };
	private _subSegment: IRoute;

	constructor(config?: any) {
		const webix = (config || {}).webix || (window as any).webix;
		super(webix);

		// init config
		this.config = this.webix.extend({
			name: "App",
			version: "1.0",
			start: "/home"
		}, config, true);

		this.app = this.config.app;
		this.ready = Promise.resolve();
		this._services = {};

		this.webix.extend(this, this.webix.EventSystem);
	}
	getUrl():IJetURL{
		return this._subSegment.suburl();
	}
	getUrlString(){
		return this._subSegment.toString();
	}
	getService(name: string) {
		let obj = this._services[name];
		if (typeof obj === "function") {
			obj = this._services[name] = obj(this);
		}
		return obj;
	}
	setService(name: string, handler: any) {
		this._services[name] = handler;
	}
	destructor(){
		this.getSubView().destructor();
		super.destructor();
	}
	// copy object and collect extra handlers
	copyConfig(obj: any, target: any, config: IViewConfig) {
		// raw ui config
		if (obj instanceof JetBase ||
			(typeof obj === "function" && obj.prototype instanceof JetBase)){
			obj = { $subview: obj };
		}

		// subview placeholder
		if (typeof obj.$subview != "undefined") {
			return this.addSubView(obj, target, config);
		}

		// process sub-properties
		target = target || (obj instanceof Array ? [] : {});
		for (const method in obj) {
			let point = obj[method];

			// view class
			if (typeof point === "function" && point.prototype instanceof JetBase) {
				point = { $subview : point };
			}

			if (point && typeof point === "object" &&
				!(point instanceof this.webix.DataCollection) && !(point instanceof RegExp)) {
				if (point instanceof Date) {
					target[method] = new Date(point);
				} else {
					const copy = this.copyConfig(
						point,
						(point instanceof Array ? [] : {}),
						config);
					if (copy !== null){
						target[method] = copy;
					}
				}
			} else {
				target[method] = point;
			}
		}

		return target;
	}

	getRouter() {
		return this.$router;
	}

	clickHandler(e: Event) {
		if (e) {
			const target: HTMLElement = (e.target || e.srcElement) as HTMLElement;
			if (target && target.getAttribute) {
				const trigger: string = target.getAttribute("trigger");
				if (trigger) {
					this._forView(target, view => view.app.trigger(trigger));
				}
				const route: string = target.getAttribute("route");
				if (route) {
					this._forView(target, view => view.show(route));
				}
			}
		}
	}

	getRoot(){
		return this.getSubView().getRoot();
	}

	refresh(){
		if (!this._subSegment){
			return Promise.resolve(null);
		}

		return this.getSubView().refresh().then(view => {
			this.callEvent("app:route", [this.getUrl()]);
			return view;
		});
	}

	loadView(url:string): Promise<IJetView> {
		const views = this.config.views;
		let result = null;

		if (url === ""){
			return Promise.resolve(
				this._loadError("", new Error("Webix Jet: Empty url segment"))
			);
		}

		try {
			if (views) {
				if (typeof views === "function") {
					// custom loading strategy
					result = views(url);
				} else {
					// predefined hash
					result = views[url];
				}
				if (typeof result === "string"){
					url = result;
					result = null;
				}
			}

			if (!result){
				if (url === "_blank"){
					result = {};
				} else {
					result = this._loadViewDynamic(url);
				}
			}
		} catch(e){
			result = this._loadError(url, e);
		}

		// custom handler can return view or its promise
		if (!result.then){
			result = Promise.resolve(result);
		}

		// set error handler
		result = result
			.then(module => module.__esModule ? module.default : module)
			.catch(err => this._loadError(url, err));

		return result;
	}

	_forView(target: HTMLElement, handler){
		const view = this.webix.$$(target as any);
		if (view) {
			handler((view as any).$scope)
		}
	}

	_loadViewDynamic(url){
		return null;
	}

	createFromURL(chunk: IJetURLChunk, now?: IJetView): Promise<IJetView> {
		let view:Promise<IJetView>;

		if (chunk.isNew || !chunk.view) {
			view = this.loadView(chunk.page)
				.then(ui => this.createView(ui, name));
		} else {
			view = Promise.resolve(chunk.view);
		}

		return view;
	}

	createView(ui:any, name?:string){
		let obj;
		if (typeof ui === "function") {
			if (ui.prototype instanceof JetAppBase) {
				// UI class
				return new ui({ app: this, name, router:SubRouter });
			} else if (ui.prototype instanceof JetBase) {
				// UI class
				return new ui(this, { name });
			} else {
				// UI factory functions
				ui = ui(this);
			}
		}

		if (ui instanceof JetBase){
			obj = ui;
		} else {
			// UI object
			obj = new JetViewRaw(this, { name, ui });
		}
		return obj;
	}

	// show view path
	show(url: string) : Promise<any> {
		return this.render(this._container, (url||this.config.start));
	}

	// event helpers
	trigger(name: string, ...rest: any[]) {
		this.apply(name, rest);
	}
	apply(name: string, data: any[]) {
		this.callEvent(name, data);
	}
	action(name: string) {
		return this.webix.bind(function(...rest: any[]) {
			this.apply(name, rest);
		}, this);
	}
	on(name: string, handler) {
		this.attachEvent(name, handler);
	}

	use(plugin, config){
		plugin(this, null, config);
	}

	error(name:string, er:any[]){
		this.callEvent(name, er);
		this.callEvent("app:error", er);

		/* tslint:disable */
		if (this.config.debug){
			for (var i=0; i<er.length; i++){
				console.error(er[i]);
				if (er[i] instanceof Error){
					let text = er[i].message;
					if (text.indexOf("Module build failed") === 0){
						text = text.replace(/\x1b\[[0-9;]*m/g,"");
						document.body.innerHTML = `<pre style='font-size:16px; background-color: #ec6873; color: #000; padding:10px;'>${text}</pre>`;
					} else {
						text += "<br><br>Check console for more details";
						this.webix.message({ type:"error", text:text, expire:-1 });
					}
						
				}
			}
			debugger;
		}
		/* tslint:enable */
	}

	// renders top view
	render(
		root?: string | HTMLElement | ISubView,
		url?: IRoute | string, parent?: IJetView): Promise<IBaseView> {

		this._container = (typeof root === "string") ?
			this.webix.toNode(root):
			(root || document.body);

		const firstInit = !this.$router;
		let path:string = null;
		if (firstInit){
			if (_once){
				this.webix.attachEvent("onClick", e => this.clickHandler(e));
				_once = false;
			}

			if (typeof url === "string"){
				url = new Route(url, 0);
			}
			this._subSegment = this._first_start(url);
			this._subSegment.route.linkRouter = true;
		} else {
			if (typeof url === "string"){
				path = url;
			} else {
				if (this.app){
					path = url.split().route.path || this.config.start;
				} else {
					path = url.toString();
				}
			}
		}

		const top = this.getSubView();
		const segment = this._subSegment;
		const ready = segment.show(path, top)
			.then(() => this.createFromURL(segment.current(), top))
			.then(view => view.render(root, segment))
			.then(base => {
				this.$router.set(segment.route.path, { silent:true });
				this.callEvent("app:route", [this.getUrl()]);
				return base;
			});

		this.ready = this.ready.then(() => ready);
		return ready;
	}

	getSubView():IJetView{
		if (this._subSegment){
			const view = this._subSegment.current().view;
			if (view)
				return view;
		}
		return new JetView(this, {});
	}

	private _first_start(route: IRoute) : IRoute{
		this._segment = route;

		const cb = (a:string) => setTimeout(() => {
			(this as JetAppBase).show(a);
		},1);
		this.$router = new (this.config.router)(cb, this.config, this);

		// start animation for top-level app
		if (this._container === document.body && this.config.animation !== false) {
			const node = this._container as HTMLElement;
			this.webix.html.addCss(node, "webixappstart");
			setTimeout(() => {
				this.webix.html.removeCss(node, "webixappstart");
				this.webix.html.addCss(node, "webixapp");
			}, 10);
		}

		if (!route){
			// if no url defined, check router first
			let urlString = this.$router.get();
			if (!urlString){
				urlString = this.config.start;
				this.$router.set(urlString, { silent: true });
			}
			route = new Route(urlString, 0);
		} else if (this.app) {
			route.current().view = this;
			if (route.next()){
				route = route.split();
			} else {
				route = new Route(this.config.start, 0);
			}
		}

		return route;
	}

	// error during view resolving
	private _loadError(url: string, err: Error):any{
		this.error("app:error:resolve", [err, url]);
		return { template:" " };
	}

	private addSubView(obj, target, config:IViewConfig) : ISubView {
		const url = obj.$subview !== true ? obj.$subview : null;
		const name: string = obj.name || (url ? this.webix.uid() : "default");
		target.id = obj.id || "s" + this.webix.uid();

		const view : ISubView = config[name] = {
			id: target.id,
			url,
			branch: obj.branch,
			popup: obj.popup
		};

		return view.popup ? null : target;
	}
}
