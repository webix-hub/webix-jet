import {IJetApp,IJetURL} from "./interfaces";
import {JetView} from "./JetView";


// wrapper for raw objects and Jet 1.x structs
export class JetViewLegacy extends JetView{
	private _ui:any;
	private _windows: JetView[];

	constructor(app:IJetApp, name:string, ui: any){
		super(app, name);
		this._ui = ui;
		this._windows = [];
	}

	getRoot(){
		if (this.app.config.jet1xMode){
			const parent = this.getParentView();
			if (parent){
				return parent.getRoot();
			}
		}

		return this._root;
	}

	config(){
		return this._ui.$ui || this._ui;
	}
	destructor(){
		const destroy = this._ui.$ondestroy;
		if (destroy){
			destroy();
		}

		for (const window of this._windows){
			window.destructor();
		}

		super.destructor();
	}

	$ready(a,b){
		super._init(a,b);

		const init = this._ui.$oninit;
		if (init){
			const root = this.getRoot();
			init(root, (root as any).$scope);
		}

		const events = this._ui.$onevent;
		if (events){
			for (const key in events){
				this.on(this.app, key, events[key]);
			}
		}

		const windows = this._ui.$windows;
		if (windows){
			for (const conf of windows){
				if (conf.$ui){
					const view = new JetViewLegacy(this.app, this.getName(), conf);
					view.render(document.body);
					this._windows.push(view);
				} else {
					this.ui(conf);
				}
			}
		}
	}

	protected _urlChange(url : IJetURL):Promise<any>{
		return super._urlChange(url).then(() => {
			const onurlchange = this._ui.$onurlchange;
			if (onurlchange){
				const root = this.getRoot();
				onurlchange(url[0].params, url.slice(1), (root as any).$scope);
			}
		});
	}
}