import {JetBase} from "./JetBase";

import {
	IBaseConfig, IBaseView, IJetApp, IJetURL,
	IJetView, IJetViewFactory, ISubView, IUIConfig, IRoute } from "./interfaces";
import { Route } from "./Route";


export class JetView extends JetBase{
	private _children:IJetView[];

	constructor(app : IJetApp, config : any){
		super(app.webix);

		this.app = app;
		//this.$config = config;

		this._children = [];
	}

	ui(
		ui:IBaseConfig|IJetViewFactory,
		config?: IUIConfig
	) : IBaseView | IJetView{
		config = config || {};
		const container = config.container || (ui as IBaseConfig).container;

		const jetview = this.app.createView(ui);
		this._children.push(jetview);

		jetview.render(container, this._segment, this);

		if (typeof ui !== "object" || (ui instanceof JetBase)){
			// raw webix UI
			return jetview;
		} else {
			return jetview.getRoot();
		}
	}

	show(path:any, config?:any):Promise<any>{
		config = config || {};

		// convert parameters object to url
		if (typeof path === "object"){
			for (const key in path){
				this.setParam(key, path[key]);
			}
			path = null;
		} else {

			// deligate to app in case of root prefix
			if (path.substr(0,1) === "/"){
				return this.app.show(path);
			}

			// local path, do nothing
			if (path.indexOf("./") === 0){
				path = path.substr(2);
			}

			// parent path, call parent view
			if (path.indexOf("../") === 0){
				const parent = this.getParentView();
				if (parent){
					return parent.show(path.substr(3), config);
				} else {
					return this.app.show("/"+path.substr(3));
				}
			}

			const sub = this.getSubViewInfo(config.target);
			if (sub){
				if (sub.parent !== this){
					return sub.parent.show(path, config);
				} else if (config.target && config.target !== "default"){
					return this._renderFrameLock(config.target, sub.subview, path);
				}
			} else {
				if (path){
					return this.app.show("/"+path);
				} 
			}

		}

		return this._show(this._segment, path, this);
	}

	_show(segment:IRoute, path:string, view:IJetView){
		return segment.show(path, view, true).then(() => {
			this._init_url_data();
			return this._urlChange();
		}).then(() => {
			if (segment.route.linkRouter){
				this.app.getRouter().set(segment.route.path, { silent: true });
				this.app.callEvent("app:route", [segment.route.path]);
			}
		});
	}

	init(_$view:IBaseView, _$: IJetURL){
		// stub
	}
	ready(_$view:IBaseView, _$url: IJetURL){
		// stub
	}
	config() : any {
		this.app.webix.message("View:Config is not implemented");
	}
	urlChange(_$view: IBaseView, _$url : IJetURL){
		// stub
	}

	destroy(){
		// stub
	}

	destructor(){
		this.destroy();
		this._destroyKids();

		// destroy actual UI
		this._root.destructor();
		super.destructor();
	}

	use(plugin, config){
		plugin(this.app, this, config);
	}

	refresh(){
		const url = this.getUrl();
		this.destroy();
		this._destroyKids();
		this._destroySubs();
		this._detachEvents();

		if ((this._container as any).tagName){
			this._root.destructor();
		}

		this._segment.refresh();
		return this._render(this._segment);
	}

	render(
		root: string | HTMLElement | ISubView,
		url: IRoute, parent?: IJetView): Promise<IBaseView> {

		if (typeof url === "string"){
			url = new Route(url, 0);
		}

		this._segment = url;

		this._parent = parent;
		this._init_url_data();

		root = root || document.body;
		const _container = (typeof root === "string") ? this.webix.toNode(root) : root;

		if (this._container !== _container) {
			this._container = _container;
			return this._render(url);
		} else {
			return this._urlChange().then(() => this.getRoot());
		}
	}

	protected _render(url: IRoute):Promise<IBaseView>{
		const config = this.config();
		if (config.then){
			return config.then(cfg => this._render_final(cfg, url));
		} else {
			return this._render_final(config, url);
		}
	}

	protected _render_final(config:any, url:IRoute):Promise<any>{
		// get previous view in the same slot
		let slot:ISubView = null;
		let container:string|HTMLElement|IBaseView = null;
		let show = false;
		if (!(this._container as HTMLElement).tagName){
			slot = (this._container as ISubView);
			if (slot.popup){
				container = document.body;
				show = true;
			} else {
				container = this.webix.$$(slot.id);
			}
		} else {
			container = this._container as HTMLElement;
		}

		// view already destroyed
		if (!this.app || !container){
			return Promise.reject(null);
		}

		let response:Promise<any>;
		const current = this._segment.current();

		// using wrapper object, so ui can be changed from app:render event
		const result:any = { ui: {} };
		this.app.copyConfig(config, result.ui, this._subs);
		this.app.callEvent("app:render", [this, url, result]);
		result.ui.$scope = this;

		/* destroy old HTML attached views before creating new one */
		if (!slot && current.isNew && current.view){
			current.view.destructor();
		}

		try {
			// special handling for adding inside of multiview - preserve old id
			if (slot && !show){
				const oldui = container as IBaseView;
				const parent = oldui.getParentView();
				if (parent && parent.name === "multiview" && !result.ui.id){
					result.ui.id = oldui.config.id;
				}
			}

			this._root = this.app.webix.ui(result.ui, container);
			const asWin = this._root as any;
			// check for url added to ignore this.ui calls
			if (show && asWin.setPosition && !asWin.isVisible()){
				asWin.show();
			}

			// check, if we are replacing some older view
			if (slot){
				if (slot.view && slot.view !== this && slot.view !== this.app){
					slot.view.destructor();
				}

				slot.id = this._root.config.id as string;
				if (this.getParentView() || !this.app.app)
					slot.view = this;
				else {
					// when we have subapp, set whole app as a view
					// so on destruction, the whole app will be destroyed
					slot.view = this.app as any;
				}
			}

			if (current.isNew){
				current.view = this;
				current.isNew = false;
			}

			response = Promise.resolve(this._init(this._root, url)).then(() => {
				return this._urlChange().then(() => {
					this._initUrl = null;
					return this.ready(this._root, url.suburl());
				});
			});
		} catch(e){
			response = Promise.reject(e);
		}

		return response.catch(err => this._initError(this, err));
	}

	protected _init(view:IBaseView, url: IRoute){
		return this.init(view, url.suburl());
	}

	protected _urlChange():Promise<any>{
		this.app.callEvent("app:urlchange", [this, this._segment]);

		const waits = [];
		for (const key in this._subs){
			const frame = this._subs[key];
			const wait = this._renderFrameLock(key, frame, null);
			if (wait){
				waits.push(wait);
			}
		}

		return Promise.all(waits).then(() => {
			return this.urlChange(this._root, this._segment.suburl());
		});
	}

	protected  _renderFrameLock(key:string, frame:ISubView, path: string):Promise<any>{
		// if subview is not occupied by some rendering yet
		if (!frame.lock) {
			// retreive and store rendering end promise
			const lock =  this._renderFrame(key, frame, path);
			if (lock){
				// clear lock after frame rendering
				// as promise.finally is not supported by  Webix lesser than 6.2
				// using a more verbose notation
				frame.lock = lock.then(() => frame.lock = null, () => frame.lock = null)
			}
		}

		// return rendering end promise
		return frame.lock;
	}

	protected _renderFrame(key:string, frame:ISubView, path: string):Promise<any>{
		//default route
		if (key === "default"){
			if (this._segment.next()){
				// we have a next segment in url, render it
				return this._createSubView(frame, this._segment.shift());
			} else if (frame.view && frame.popup) {
				// there is no next segment, delete the existing sub-view
				frame.view.destructor();
				frame.view = null;
			}
		}
		
		//if new path provided, set it to the frame
		if (path !== null){
			frame.url = path;
		}

		// in case of routed sub-view
		if (frame.route){
			// we have a new path for sub-view
			if (path !== null){
				return frame.route.show(path, frame.view).then(() => {
					return this._createSubView(frame, frame.route);
				});
			}

			// do not trigger onChange for isolated sub-views
			if (frame.branch){
				return;
			}
		}

		let view = frame.view;
		// if view doesn't exists yet, init it
		if (!view && frame.url){
			if (typeof frame.url === "string"){
				// string, so we have isolated subview url
				frame.route = new Route(frame.url, 0);
				return this._createSubView(frame, frame.route);
			} else {
				// object, so we have an embeded subview
				if (typeof frame.url === "function" && !(view instanceof frame.url)){
					view = new frame.url(this.app, "");
				}
				if (!view){
					view = frame.url as any;
				}
			}
		}

		// trigger onChange for already existed view
		if (view){
			return view.render(frame, (frame.route || this._segment), this);
		}
	}

	private _initError(view: any, err: any){
		/*
			if view is destroyed, ignore any view related errors
		*/
		if (this.app){
			this.app.error("app:error:initview", [err, view]);
		}
		return true;
	}

	private _createSubView(
					sub:ISubView,
					suburl:IRoute):Promise<IBaseView>{
		return this.app.createFromURL(suburl.current(), sub.view).then(view => {
			return view.render(sub, suburl, this);
		});
	}

	private _destroyKids(){
		// destroy child views
		const uis = this._children;
		for (let i = uis.length - 1; i >= 0; i--){
			if (uis[i] && uis[i].destructor){
				uis[i].destructor();
			}
		}

		// reset vars for better GC processing
		this._children = [];
	}
}