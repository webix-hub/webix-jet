import {IJetApp, IJetURL, IJetView} from "../interfaces";

function show(view, config, value){
	if (config.urls){
		value = config.urls[value] || value;
	} else if (config.param){
		value = { [config.param]:value };
	}

	view.show(value);
}
export function Menu(app: IJetApp, view: IJetView, config: any){
	const frame = view.getSubViewInfo().parent;
	const ui = view.$$(config.id || config) as any;
	let silent = false;

	ui.attachEvent("onchange", function(){
		if (!silent){
			show(frame, config, this.getValue());
		}
	});
	ui.attachEvent("onafterselect", function(){
		if (!silent){
			let id = null;
			if (ui.setValue){
				id = this.getValue();
			} else if (ui.getSelectedId){
				id = ui.getSelectedId();
			}
			show(frame, config, id);
		}
	});

	view.on(app, `app:route`, function(){
		let name = "";
		if (config.param){
			name = view.getParam(config.param, true);
		} else {
			const segment = frame.getUrl()[1];
			if (segment){
				name = segment.page;
			}
		}

		if (name){
			silent = true;
			if (ui.setValue && ui.getValue() !== name){
				ui.setValue(name);
			} else if (ui.select && ui.exists(name) && ui.getSelectedId() !== name){
				ui.select(name);
			}
			silent = false;
		}
	});
}