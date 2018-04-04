import {JetBase} from "./JetBase";

import {parse, url2str} from "./helpers";
import {
	IJetApp, IJetURL,
	IJetView, IJetViewFactory, ISubView, IUIConfig} from "./interfaces";

interface IDestructable{
	destructor():void;
}

export class JetView extends JetBase{
	private _children:IDestructable[];

	constructor(app : IJetApp, name : string){
		super();

		this.app = app;

		this._name = name;
		this._children = [];
	}

	ui(
		ui:webix.ui.viewConfig|IJetViewFactory,
		config?: IUIConfig
	) : webix.ui.baseview | IJetView{
		config = config || {};
		const container = config.container || (ui as webix.ui.viewConfig).container;

		const jetview = this.app.createView(ui);
		this._children.push(jetview);

		jetview.render(container, null, this);

		if (typeof ui !== "object" || (ui instanceof JetBase)){
			// raw webix UI
			return jetview;
		} else {
			return jetview.getRoot();
		}
	}

	show(path:any, config?:any):Promise<any>{
		config = config || {};

		// detect the related view
		if (typeof path === "string"){
			// root path
			if (path.substr(0,1) === "/"){
				return this.app.show(path);
			}
			// parent path, call parent view
			if (path.indexOf("../") === 0){
				const parent = this.getParentView();
				if (parent){
					parent.show("./"+path.substr(3), config);
				} else {
					this.app.show("/"+path.substr(3));
				}
				return;
			}
			// local path, do nothing
			if (path.indexOf("./") === 0){
				path = path.substr(2);
			}

			const sub = this.getSubViewInfo(config.target);
			if (!sub){
				return this.app.show("/"+path);
			}
			if (sub.parent !== this){
				return sub.parent.show(path, config);
			}
		}

		const currentUrl = parse(this.app.getRouter().get());

		// convert parameters to url
		if (typeof path === "object"){
			if (webix.isArray(path)){
				currentUrl[this._index+path[0]].page=path[1];
				path = "";
			} else {
				const temp = [];
				for (const key in path){
					temp.push(encodeURIComponent(key)+"="+encodeURIComponent(path[key]));
				}
				path = "?"+temp.join("&");
			}
		}

		// process url
		if (typeof path === "string"){
			// parameters only
			if (path.substr(0, 1) === "?") {
				const next = path.indexOf("/");
				let params = path;
				if (next > -1){
					params = path.substr(0, next);
				}
				const chunk = parse(params);
				webix.extend(currentUrl[this._index-1].params, chunk[0].params, true);
				path = next > -1 ? path.substr(next+1) : "";
			}

			const newChunk = path === "" ? currentUrl.slice(this._index) : parse(path);
			let url: IJetURL = null;
			if (this._index){
				url = currentUrl.slice(0, this._index).concat(newChunk);
				for	(let i=0; i<url.length; i++){
					url[i].index = i+1;
				}

				const urlstr = url2str(url);

				return this.app.canNavigate(urlstr, this).then(redirect => {
					if (urlstr !== redirect){
						// url was blocked and redirected
						return this.app.show(redirect);
					} else {
						return this._finishShow(url, redirect);
					}
				}).catch(() => false);
			} else {
				return this._finishShow(newChunk, "");
			}
		}
	}

	init(_$view:webix.ui.baseview, _$url: IJetURL){
		// stub
	}
	ready(_$view:webix.ui.baseview, _$url: IJetURL){
		// stub
	}
	config() : any {
		this.app.webix.message("View:Config is not implemented");
	}
	urlChange(_$view: webix.ui.baseview, _$url : IJetURL){
		// stub
	}

	destroy(){
		// stub
	}

	destructor(){
		this.destroy();

		// destroy child views
		const uis = this._children;
		for (let i = uis.length - 1; i >= 0; i--){
			if (uis[i] && uis[i].destructor){
				uis[i].destructor();
			}
		}

		// reset vars for better GC processing
		this.app = this._children = null;

		// destroy actual UI
		this._root.destructor();
		super.destructor();
	}

	use(plugin, config){
		plugin(this.app, this, config);
	}

	protected _render(url:IJetURL):Promise<any>{
		const config = this.config();
		if (config.then){
			return config.then(cfg => this._render_final(cfg, url));
		} else {
			return this._render_final(config, url);
		}
	}

	protected _render_final(config:any, url:IJetURL):Promise<any>{
		const prev = this._container as webix.ui.baseview;
		if (prev && (prev as any).$destructed){
			return Promise.reject("Container destroyed");
		}

		let response:Promise<any>;

		// using wrapper object, so ui can be changed from app:render event
		const result:any = { ui: {} };
		this.app.copyConfig(config, result.ui, this._subs);
		this.app.callEvent("app:render", [this, url, result]);
		result.ui.$scope = this;

		try {
			// special handling for adding inside of multiview - preserve old id
			if (prev && prev.getParentView){
				const parent = prev.getParentView();
				if (parent && parent.name === "multiview" && !result.ui.id){
					result.ui.id = prev.config.id;
				}
			}

			this._root = this.app.webix.ui(result.ui, this._container);
			if (this._root.getParentView()){
				this._container = this._root;
			}

			this._init(this._root, url);
			response = this._urlChange(url).then(() => {
				return this.ready(this._root, url);
			});
		} catch(e){
			response = Promise.reject(e);
		}

		return response.catch(err => this._initError(this, err));
	}

	protected _init(view:webix.ui.baseview, url: IJetURL){
		return this.init(view, url);
	}

	protected _urlChange(url:IJetURL):Promise<any>{
		this.app.callEvent("app:urlchange", [this, url, this._index]);

		const waits = [];
		for (const key in this._subs){
			const wait = this._renderFrame(key, this._subs[key], url);
			if (wait){
				waits.push(wait);
			}
		}

		return Promise.all(waits).then(() => {
			this.urlChange(this._root, url);
		});
	}

	protected _renderFrame(key:string, frame:ISubView, url:IJetURL):Promise<any>{
		if (frame.url){
			// we have fixed subview url
			if (typeof frame.url === "string"){
				const parsed = parse(frame.url);
				parsed.map(a => { a.index = 0; });
				return this._createSubView(frame, parsed);
			} else {
				let view = frame.view;
				if (typeof frame.url === "function" && !(view instanceof frame.url)){
					view = new frame.url(this.app, "");
				}
				if (!view){
					view = frame.url as any;
				}
				return this._renderSubView(frame, view, url);
			}
		} else if (key === "default" && url && url.length > 1){
			// we have an url and subview for it
			const suburl = url.slice(1);
			return this._createSubView(frame, suburl);
		}
	}

	private _initError(view: any, err: any){
		this.app.error("app:error:initview", [err, view]);
		return true;
	}

	private _createSubView(
					sub:ISubView,
					suburl:IJetURL):Promise<webix.ui.baseview>{
		return this.app.createFromURL(suburl, sub.view).then(view => {
			return this._renderSubView(sub, view, suburl);
		});
	}

	private _renderSubView(
					sub:ISubView,
					view:IJetView,
					suburl:IJetURL):Promise<webix.ui.baseview>{
		const cell = this.app.webix.$$(sub.id);
		return view.render(cell, suburl, this).then(ui => {
			// destroy old view
			if (sub.view && sub.view !== view){
				sub.view.destructor();
			}

			// save info about a new view
			sub.view = view;
			sub.id = ui.config.id as string;
			return ui;
		});
	}

	private _finishShow(url:IJetURL, path:string) : Promise<any>{
		let next;
		if (this._index){
			next = this._renderPartial(url.slice(this._index-1));
			this.app.getRouter().set(path, { silent: true });
			this.app.callEvent("app:route", [url]);
		} else {
			url.map(a => a.index = 0);
			next = this._renderPartial([null, ...url]);
		}
		return next;
	}

	private _renderPartial(url:IJetURL){
		this._init_url_data(url);
		return this._urlChange(url);
	}
}