import { IBaseView, IJetApp, IJetURL, IJetView,
	IRoute, ISubView, ISubViewInfo, IWebixFacade, IHash } from "./interfaces";

export abstract class JetBase implements IJetView{
	public app: IJetApp;
	public webix: IWebixFacade;
	public webixJet = true;

	protected _name: string;
	protected _parent: IJetView;
	protected _container: HTMLElement | ISubView;
	protected _root: IBaseView;
	protected _events:{ id:string, obj: any }[];
	protected _subs:{[name:string]:ISubView};
	protected _initUrl:IJetURL;
	protected _segment: IRoute;

	private _data:{[name:string]:any};
	

	constructor(webix:IWebixFacade, config?:any){
		this.webix = webix;
		this._events = [];
		this._subs = {};
		this._data = {};

		if (config && config.params) 
			webix.extend(this._data, config.params);
	}

	getRoot(): IBaseView {
		return this._root;
	}

	destructor() {
		this._detachEvents();
		this._destroySubs();
		this._events = this._container = this.app = this._parent = this._root = null;
	}
	setParam(id:string, value:any, url?:boolean):void|Promise<any>{
		if (this._data[id] !== value){
			this._data[id] = value;
			this._segment.update(id, value, 0);
			if (url){
				return this.show(null);
			}
		}
	}
	getParam(id:string, parent:boolean):any{
		const value = this._data[id];
		if (typeof value !== "undefined" || !parent){
			return value;
		}

		const view = this.getParentView();
		if (view){
			return view.getParam(id, parent);
		}
	}
	getUrl():IJetURL{
		return this._segment.suburl();
	}
	getUrlString():string{
		return this._segment.toString();
	}

	getParentView() : IJetView{
		return this._parent;
	}

	$$<T extends IBaseView>(id:string | IBaseView):T{
		if (typeof id === "string"){
			const root = this.getRoot() as any;
			return root.queryView(
				(obj => (obj.config.id === id || obj.config.localId === id) &&
						(obj.$scope === root.$scope)
				),
				"self");
		} else {
			return id as undefined as T;
		}
	}

	on(obj, name, code){
		const id = obj.attachEvent(name, code);
		this._events.push({ obj, id });
		return id;
	}

	contains(view: IJetView){
		for (const key in this._subs){
			const kid = this._subs[key].view;
			if (kid && (kid === view || kid.contains(view))){
				return true;
			}
		}
		return false;
	}

	getSubView(name?:string):IJetView{
		const sub = this.getSubViewInfo(name);
		if (sub){
			return sub.subview.view;
		}
	}

	getSubViewInfo(name?:string):ISubViewInfo{
		const sub = this._subs[name || "default"];
		if (sub){
			return { subview:sub, parent:this };
		}

		if (name === "_top"){
			this._subs[name] = { url:"", id:null, popup:true };
			return this.getSubViewInfo(name);
		}

		// when called from a child view, searches for nearest parent with subview
		if (this._parent){
			return this._parent.getSubViewInfo(name);
		}
		return null;
	}

	public abstract refresh();
	public abstract show(path:any, config?:any);
	public abstract render(
		root?: string | HTMLElement | ISubView,
		url?: IRoute, parent?: IJetView): Promise<IBaseView>;

	protected _detachEvents(){
		const events = this._events;
		for (let i = events.length - 1; i >= 0; i--){
			events[i].obj.detachEvent(events[i].id);
		}
	}
	protected _destroySubs(){
		// destroy sub views
		for (const key in this._subs){
			const subView = this._subs[key].view;
			// it possible that subview was not loaded with any content yet
			// so check on null
			if (subView){
				subView.destructor();
			}
		}

		// reset to prevent memory leaks
		this._subs = {};
	}
	protected _init_url_data(){
		const url = this._segment.current();
		this._data = {};
		this.webix.extend(this._data, url.params, true);
	}

	protected _getDefaultSub(){
		if (this._subs.default){
			return this._subs.default;
		}
		for (const key in this._subs){
			const sub = this._subs[key];
			if (!sub.branch && sub.view && key !== "_top"){
				const child = (sub.view as JetBase)._getDefaultSub();
				if (child){
					return child;
				}
			}
		}
	}

	protected _routed_view() {
		const parent = this.getParentView() as JetBase;
		if (!parent){
			return true;
		}

		const sub = parent._getDefaultSub();
		if (!sub && sub !== this){
			return false;
		}

		return parent._routed_view();
	}

	
}
