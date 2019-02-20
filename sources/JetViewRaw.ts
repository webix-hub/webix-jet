import {IJetApp} from "./interfaces";
import {JetView} from "./JetView";


// wrapper for raw objects and Jet 1.x structs
export class JetViewRaw extends JetView{
	private _ui:any;

	constructor(app:IJetApp, config:any){
		super(app, config);
		this._ui = config.ui;
	}

	config(){
		return this._ui;
	}
}