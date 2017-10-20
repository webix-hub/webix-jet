const w = webix as any;

// will be added in webix 5.1
if (!w.ui.freeze){
	w.ui.freeze = function(handler){
		// disabled because webix jet 5.0 can't handle resize of scrollview correctly
		// w.ui.$freeze = true;
		const res = handler();
		if (res && res.then){
			res.then(function(some){
				w.ui.$freeze = false;
				w.ui.resize();
				return some;
			});
		} else {
			w.ui.$freeze = false;
			w.ui.resize();
		}
	};
}