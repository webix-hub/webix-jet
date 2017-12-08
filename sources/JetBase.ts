import { IJetURL, IJetView, ISubView, ISubViewInfo } from "./interfaces";
import { JetApp } from "./JetApp";


function locate(ui, id){
	const cells = ui.getChildViews();
	for (const cell of cells) {
		let kid = cell;
		if (kid.config.localId === id){
			return kid;
		} else {
			kid = locate(kid, id);
		}
		if (kid){
			return kid;
		}
	}
	return null;
}

export abstract class JetBase implements IJetView{
	protected _parent: IJetView;
	protected _index: number;
	protected _app: JetApp;
	protected _container: HTMLElement | webix.ui.baseview;
	protected _root: webix.ui.baseview;
	protected _id: number;
	protected _name: string;
	protected _events:{ id:string, obj: any }[];
	protected _subs:{[name:string]:ISubView};


	constructor(){
		this._id = webix.uid() as number;

		this._events = [];
		this._subs = {};
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

		this._events = this._container = this._app = this._parent = null;
	}

	render(
		root: string | HTMLElement | webix.ui.baseview,
		url?: IJetURL, parent?: IJetView): Promise<webix.ui.baseview> {

		this._parent = parent;
		if (url) {
			this._index = url[0].index;
		}

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

	$$(id:string):webix.ui.baseview{
		let view = webix.$$(id);
		if (!view){
			view = locate(this.getRoot(), id);
		}
		return view;
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

	public abstract show(path:string, target?:any);
	protected abstract _render(url: IJetURL) : Promise<any>;
	protected abstract _urlChange(url: IJetURL) : Promise<any>;
}
