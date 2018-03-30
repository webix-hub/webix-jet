const w = webix as any;
const version = webix.version.split(".") as any[];

// will be fixed in webix 5.2
if (version[0]*10+version[1]*1 < 52) {
	w.ui.freeze = function(handler):any{
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
		return res;
	};
}

// adding views as classes
const baseAdd = w.ui.baselayout.prototype.addView as any;
const baseRemove = w.ui.baselayout.prototype.removeView as any;

const config = {
	addView(view, index){
		if (this.$scope && this.$scope.webixJet){
			view = this.$scope.app.copyConfig(view, {}, this.$scope._subs);
			baseAdd.apply(this, [view, index]);

			w.delay(()=>{
				this.$scope._checkSubViews("add", this.$scope._url);
			});
			return view.id;
		} else {
			return baseAdd.apply(this, arguments);
		}
	},
	removeView(){
		baseRemove.apply(this, arguments);
		if (this.$scope && this.$scope.webixJet){
			this.$scope._checkSubViews("delete");
		}
	}
};

w.extend(w.ui.layout.prototype, config, true);
w.extend(w.ui.baselayout.prototype, config, true);