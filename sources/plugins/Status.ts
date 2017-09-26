import {IJetApp, IJetView} from "../interfaces";

const icons = {
	"good":	"check",
	"error": "warning",
	"saving": ""
};

const texts = {
	"good":	"Status.Good",
	"error": "Status.Error",
	"saving": "Status.Saving"
};

export function Status(app: IJetApp, view: IJetView, config: any){

	let status = "good";
	let count = 0;
	let iserror = false;

	function refresh(){
		const area = view.$$(config.target);
		if (area){
			(area as webix.ui.template).setHTML("<div class='status_"+status+"'><span class='webix_icon fa-"+icons[status]+"'></span> "+texts[status]+"</div>");
		}
	}
	function success(){
		count--;
		setStatus("good");
	}
	function fail(err){
		count--;
		setStatus("error", err);
	}
	function start(promise){
		if (promise){
			count++;
			setStatus("saving");
			promise = promise.then ? promise : promise[0][2];
			promise.then( success, fail );
		}
	}
	function getStatus(){
		return status;
	}
	function setStatus(mode, err?){
		if (count < 0){
			count = 0;
		}

		if (mode === "saving"){
			status = "saving";
			refresh();
		} else {
			iserror = (mode === "error");
			if (count === 0){
				status = iserror ? "error" : "good";
				if (iserror && app.callEvent("app:error:server",[err])){
					error(err);
				}

				refresh();
			}
		}
	}
	function error(err){
		(webix.alert as any)({
			title:"Status.ServerErrorTitle",
			text:"Status.ServerErrorText",
			width:"550px"
		});
		if (err){
			console.error(err.responseText || err);
		}
	}
	function track(data){
		const dp = webix.dp(data);
		if (dp){
			view.on(dp, "onAfterDataSend", start);
			view.on(dp, "onAfterSaveError", fail);
			view.on(dp, "onAfterSave", success);
		}
	}

	app.setService("status", {
		getStatus,
		setStatus,
		track
	});

	if (config.remote){
		view.on(webix, "onRemoteCall", start);
	}

	if (config.data){
		track(config.data);
	}
}