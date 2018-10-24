const w = webix as any;
const version = webix.version.split(".") as any[];

// will be fixed in webix 5.3
if (version[0]*10+version[1]*1 < 53) {
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
			const jview = this.$scope;
			const subs = {};

			view = jview.app.copyConfig(view, {}, subs);
			baseAdd.apply(this, [view, index]);

			for (const key in subs){
				jview._renderFrame(key, subs[key], jview.getUrl()).then(() => {
					jview._subs[key] = subs[key];
				});
			}

			return view.id;
		} else {
			return baseAdd.apply(this, arguments);
		}
	},
	removeView(){
		baseRemove.apply(this, arguments);
		if (this.$scope && this.$scope.webixJet){
			const subs = this.$scope._subs;
			//check all sub-views, destroy and clean the removed one
			for(const key in subs){
				const test = subs[key];
				if (!webix.$$(test.id)){
					test.view.destructor();
					delete subs[key];
				}
			}
		}
	}
};

w.extend(w.ui.layout.prototype, config, true);
w.extend(w.ui.baselayout.prototype, config, true);

// wrapper for using Jet Apps as views

webix.protoUI({
	name:"jetapp",
	$init(cfg){
		this.$app = new this.app(cfg);

		const id = webix.uid().toString();
		cfg.body = { id };

		this.$ready.push(function(){
			this.$app.render(webix.$$(id));
		});
	}
}, (webix.ui as any).proxy);

declare namespace webix {
	namespace ui { 
		class jetapp extends webix.ui.view{
		}
	}
}