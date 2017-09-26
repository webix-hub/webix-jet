import {IJetApp, IJetURL, IJetView} from "../interfaces";

function show(view, config, value){
	if (config.urls){
		value = config.urls[value] || value;
	}
	view.show("./"+value);
}
export function Menu(app: IJetApp, view: IJetView, config: any){
	const ui = view.$$(config.id || config) as any;
	let silent = false;

	ui.attachEvent("onchange", function(){
		if (!silent){
			show(view, config, this.getValue());
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
			show(view, config, id);
		}
	});

	view.on(app, `app:route`, function(url:IJetURL){
		const segment = url[view.getIndex()];
		if (segment){
			silent = true;
			const page = segment.page;
			if (ui.setValue && ui.getValue() !== page){
				ui.setValue(page);
			} else if (ui.select && ui.exists(page) && ui.getSelectedId() !== page){
				ui.select(page);
			}
			silent = false;
		}
	});
}