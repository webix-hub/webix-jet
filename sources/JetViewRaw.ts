import {IJetApp} from "./interfaces";
import {JetView} from "./JetView";


// wrapper for raw objects and Jet 1.x structs
export class JetViewRaw extends JetView{
	private _ui:any;

	constructor(app:IJetApp, name:string, ui: any){
		super(app, name);
		this._ui = ui;
	}

	config(){
		return this._ui;
	}
}