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
			for(const key in subs){
				if (!webix.$$(subs[key].id)){
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
		this.setBody({ id });

		this.$ready.push(function(){
			this.$app.render(webix.$$(id)).then(view => {
				this.setBody(view);
			});
		});
	},
	getChildViews(){
		return [this._body_cell];
	},
	getBody(){
		return this._body_cell;
	},
	setBody(view){
		if (!view.config){
			view = webix.ui(view, this.$view);
		}
		this._body_cell = view;
	},
	$setSize(x,y){
		webix.ui.view.prototype.$setSize.call(this, x,y);
		this._body_cell.$setSize(this.$width, this.$height);
	},
	$getSize(dx,dy){
		const selfSize = webix.ui.view.prototype.$getSize.call(this, dx, dy);
		const size = this.getBody().$getSize(dx, dy);

		size[0] = Math.max(selfSize[0], size[0]);
		size[1] = Math.min(selfSize[1], size[1]);
		size[2] = Math.max(selfSize[2], size[2]);
		size[3] = Math.min(selfSize[3], size[3]);
		size[4] = Math.max(selfSize[4], size[4]);

		return size;
	}
}, webix.ui.view);