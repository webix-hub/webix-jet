import { IJetApp, IJetURL, IJetView,
	ISubView, ISubViewInfo } from "./interfaces";


export abstract class JetBase implements IJetView{
	public app: IJetApp;
	public webixJet = true;
	protected _parent: IJetView;
	protected _index: number;
	protected _container: HTMLElement | webix.ui.baseview;
	protected _root: webix.ui.baseview;
	protected _id: number;
	protected _name: string;
	protected _events:{ id:string, obj: any }[];
	protected _subs:{[name:string]:ISubView};
	private _data:{[name:string]:any};
	private _url:IJetURL;


	constructor(){
		this._id = webix.uid() as number;

		this._events = [];
		this._subs = {};
		this._data = {};
	}

	getRoot(): webix.ui.baseview {
		return this._root;
	}

	destructor() {
		const events = this._events;
		for (let i = events.length - 1; i >= 0; i--){
			events[i].obj.detachEvent(events[i].id);
		}

		// destroy sub views
		for (const key in this._subs){
			const subView = this._subs[key].view;
			// it possible that subview was not loaded with any content yet
			// so check on null
			if (subView){
				subView.destructor();
			}
		}

		this._events = this._container = this.app = this._parent = null;
	}
	setParam(id:string, value:any, url?:boolean){
		if (this._data[id] !== value){
			this._data[id] = value;
			if (this.app.callEvent("app:paramchange", [this, id, value, url])){
				if (url){
					// changing in the url
					this.show({[id]:value});
				}
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
		return this._url;
	}
	render(
		root?: string | HTMLElement | webix.ui.baseview,
		url?: IJetURL, parent?: IJetView): Promise<webix.ui.baseview> {

		this._parent = parent;
		if (url) {
			this._index = url[0].index;
		}
		this._init_url_data(url);

		root = root || document.body;
		const _container = (typeof root === "string") ? webix.toNode(root) : root;

		if (this._container !== _container) {
			this._container = _container;
			return this._render(url).then(() => this.getRoot());
		} else {

			return this._urlChange(url).then(() => this.getRoot());
		}
	}

	getIndex():number{
		return this._index;
	}
	getId():number{
		return this._id;
	}
	getParentView() : IJetView{
		return this._parent;
	}

	$$(id:string | webix.ui.baseview):webix.ui.baseview{
		if (typeof id === "string"){
			const root = this.getRoot() as any;
			return root.queryView(
				(obj => (obj.config.id === id || obj.config.localId === id) &&
						(obj.$scope === root.$scope)
				),
				"self");
		} else {
			return id;
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
			if (kid === view || kid.contains(view)){
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

		// when called from a child view, searches for nearest parent with subview
		if (this._parent){
			return this._parent.getSubViewInfo(name);
		}
		return null;
	}

	getName():string{
		return this._name;
	}

	public abstract refresh();
	public abstract show(path:any, config?:any);
	protected abstract _render(url: IJetURL) : Promise<any>;
	protected abstract _urlChange(url: IJetURL) : Promise<any>;
	protected _init_url_data(url:IJetURL){
		if (url && url[0]){
			this._data = {};
			webix.extend(this._data, url[0].params, true);
		}
		this._url = url;
	}
}
