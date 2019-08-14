let isPatched = false;
export default function patch(w: any){
	if (isPatched || !w){ return; }
	isPatched = true;

	// custom promise for IE8
	const win = window as any;
	if (!win.Promise){
		win.Promise = w.promise;
	}

	const version = w.version.split(".") as any[];

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

	function addViewCommon(base, view, index){
		// trigger logic only for widgets inside of jet-view
		// ignore case when addView used with already initialized widget
		if (base.$scope && base.$scope.webixJet && !view.queryView){
			const jview = base.$scope;
			const subs = {};

			view = jview.app.copyConfig(view, {}, subs);
			baseAdd.call(base, view, index);

			let ready;
			for (const key in subs){
				ready = jview._renderFrame(key, subs[key], null).then(() => {
					jview._subs[key] = subs[key];
					return subs[key].view.getRoot().config.id;
				});
			}

			return ready;
		} else {
			return baseAdd.call(base, view, index);
		}
	}

	const config = {
		addViewAsync(view, index){
			const res = addViewCommon(this, view, index);
			return w.promise.resolve(res);
		},
		addView(view, index){
			const res = addViewCommon(this, view, index);
			return (res && res.then) ? w.uid() : res;
		},
		removeView(){
			baseRemove.apply(this, arguments);
			if (this.$scope && this.$scope.webixJet){
				const subs = this.$scope._subs;
				// check all sub-views, destroy and clean the removed one
				for(const key in subs){
					const test = subs[key];
					if (!w.$$(test.id)){
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

	w.protoUI({
		name:"jetapp",
		$init(cfg){
			this.$app = new this.app(cfg);

			const id = w.uid().toString();
			cfg.body = { id };

			this.$ready.push(function(){
				this.$app.render({ id });
			});

			for (var key in this.$app){
				var origin = this.$app[key];
				if (typeof origin === "function" && !this[key]){
					this[key] = origin.bind(this.$app);
				}
			}
		}
	}, (w.ui as any).proxy);
}