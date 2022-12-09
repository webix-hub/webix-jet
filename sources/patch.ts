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

	const config = {
		addView(view, index){
			// trigger logic only for widgets inside of jet-view
			// ignore case when addView used with already initialized widget
			if (this.$scope && this.$scope.webixJet && !view.queryView){
				const jview = this.$scope;
				const subs = {};

				view = jview.app.copyConfig(view, {}, subs);
				baseAdd.apply(this, [view, index]);

				for (const key in subs){
					jview._renderFrame(key, subs[key], null).then(() => {
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
	const ignoreList = { 
		width:1, height:1, gravity:1,
		minWidth:1, minHeight:1,
		maxWidth:1, maxHeight:1,
		id:1, view:1, _inner:1,  body:1
	};

	w.protoUI({
		name:"jetapp",
		$init(cfg){
			this._app_create(cfg);
			
			cfg.body = {};
			this.$ready.push(() => this._app_ready());
		},
		refresh(){
			const old = this.$app;
			this._app_create(this.config);
			this._app_ready().then(() => old.destructor());
		},
		_app_create(cfg){
			const appCfg = {};
			const copy = (Object as any).getOwnPropertyDescriptors;
			const keys = copy ? copy(cfg) : cfg;
			for (var key in keys){
				if (!ignoreList[key]) 
					appCfg[key] = cfg[key];
			}

			this.$app = new this.app(appCfg);
		},
		_app_ready(){
			this.callEvent("onInit", [this.$app]);
			return this.$app.render({ id:this.getChildViews()[0].config.id });
		}
	}, (w.ui as any).proxy, w.EventSystem);
}