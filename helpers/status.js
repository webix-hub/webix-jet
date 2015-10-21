define([
	"app",
	"locale"
],function(app, _){

	var template;
	function message(text){
		var area = $$(template);
		if (area) area.setHTML(text);
	}

	var status = "good";
	var count = 0;
	var iserror = false;
	var saving_time = null;
	var saving_mode = null;
	var hide_time = null;

	function check_delayed_status(){
		saving_time = null;
		if (saving_mode)
			setStatus.apply(this, saving_mode);
	}
	function hide_status(){
		var area = $$(template);
		if (area){
			var message = area.$view.firstChild.firstChild;
			if (message)
				message.style.opacity = 0;
		}
		status = "";
	}

	function setStatus(mode, err){
		if (count < 0) count = 0;
		if (hide_time){
			clearTimeout(hide_time);
			hide_time = null;
		}

		if (mode == "saving"){
			if (status != mode){
				status = "saving";
				refresh();
			}
			if (!saving_time){
				saving_time = setTimeout(check_delayed_status, 750);
			}
		} else {
			if (saving_time)
				return saving_mode = [mode, err];

			iserror = (mode == "error");
			if (count === 0){
				status = iserror ? "error" : "good";
				if (iserror && app.callEvent("app:panic",[err]))
					show_error_message(err);
				else
					hide_time = setTimeout(hide_status, 3000);

				refresh();
			}
		}
	}

	var icons = {
		"good":	"check",
		"error": "warning",
		"saving": "refresh fa-spin"
	};

	var texts = {
		"good":	_("Status.Good"),
		"error": _("Status.Error"),
		"saving": _("Status.Saving")
	};

	function refresh(){
		message("<div class='status_message status_"+status+"'><span class='webix_icon fa-"+icons[status]+"'></span> "+texts[status]+"</div>");
	}

	function success_event(){
		count--;
		setStatus("good");
	}
	function fail_event(err){
		count--;
		setStatus("error", err);
	}

	function start_event(mode,url,params,xhr,headers,data,promise){
		if (promise){
			count++;
			setStatus("saving");

			promise.then( success_event, fail_event );
		}
	}

	webix.attachEvent("onBeforeAjax", start_event);
	
	function show_error_message(err){
		webix.alert({
			title:_("Status.ServerErrorTitle"),
			text:_("Status.ServerErrorText"),
			width:"550px"
		});
		if (err)
			console.log(err.responseText || err);
	}

	return {
		setStatus:setStatus,
		icons:icons,
		texts:texts,

		box:function(){
			template = "s"+webix.uid();
			return { id:template, view:"template", width:25, css:"status_box", borderless:true };
		},
		setContainer:function(box){
			template = box;
		},
		trackData:function(col){
			if (col && col.config && col.config.id){
				var dp = webix.dp.$$(col.config.id);
				if (dp){
					dp.attachEvent("onAfterDataSend", start_event);
					dp.attachEvent("onAfterSaveError", fail_event);
					dp.attachEvent("onAfterSave", success_event);
				}
			}
		}
	};
});