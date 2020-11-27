import { IJetURL, IJetView, IPath, IRoute, IJetURLChunk, IJetUrlTarget } from "./interfaces";
import {NavigationBlocked} from "./errors";

import {parse, url2str} from "./helpers";

export class Route implements IRoute{
	public route: IPath;
	private index: number;
	private _next: number = 1;

	constructor(route: string|IPath, index: number){
		if (typeof route === "string"){
			this.route = {
				url:parse(route),
				path: route
			};
		} else {
			this.route = route;
		}

		this.index = index;
	}
	current():IJetURLChunk{
		return this.route.url[this.index];
	}
	next():IJetURLChunk{
		return this.route.url[this.index + this._next];
	}

	suburl():IJetURL{
		return this.route.url.slice(this.index);
	}
	shift(params) {
		const route = new Route(this.route, this.index + this._next);
		route.setParams(route.route.url, params, route.index);
		return route;
	}
	setParams(url, params, index) {
		if (params) {
			const old = url[index].params;
			for (var key in params) old[key] = params[key];
		}
	}
	refresh(){
		const url = this.route.url;
		for (let i=this.index+1; i<url.length; i++){
			url[i].isNew = true;
		}
	}
	toString(){
		const str = url2str(this.suburl());
		return str ? str.substr(1) : "";
	}
	_join(path: string, kids?: boolean){
		let url = this.route.url;
		if (path === null){ // change of parameters, route elements are not affected
			return url;
		}

		const old = this.route.url;
		let reset = true;
		url = old.slice(0, this.index+(kids?this._next:0));
		if (path){
			url = url.concat(parse(path));

			for (let i=0; i<url.length; i++){
				if (old[i]){
					url[i].view = old[i].view;
				}
				if (reset && old[i] && url[i].page === old[i].page) {
					url[i].isNew = false;
				} else if (url[i].isNew) {
					// if some segment was marked as new, all subsegments must be updated as well
					reset = false;
				}
			}
		}

		return url;
	}

	append(path:string):string{
		const url = this._join(path, true);
		this.route.path = url2str(url);
		this.route.url = url;

		return this.route.path;
	}

	show(path:IJetUrlTarget, view:IJetView, kids?: boolean):Promise<void>{
		const url = this._join(path.url, kids);
		this.setParams(url, path.params, this.index + (kids ? this._next : 0));
		

		return new Promise((res, rej) => {
			const redirect = url2str(url);
			const obj = {
				url,
				redirect,
				confirm: Promise.resolve()
			};

			const app = view ? view.app : null;
			// when creating a new route, it possible that it will not have any content
			// guard is not necessary in such case
			if (app){
				const result = app.callEvent("app:guard", [obj.redirect, view, obj]);
				if (!result){
					rej(new NavigationBlocked());
					return;
				}
			}

			let err;
			obj.confirm.catch(err => rej(err)).then(() => {
				if (obj.redirect === null){
					rej(new NavigationBlocked());
					return;
				}

				if (obj.redirect !== redirect){
					app.show(obj.redirect);
					rej(new NavigationBlocked());
					return;
				}

				this.route.path = redirect;
				this.route.url = url;
				res();
			});
		});
	}
	size(n:number){
		this._next = n;
	}
	split():IRoute{
		const route = {
			url: this.route.url.slice(this.index+1),
			path:""
		};

		if (route.url.length){
			route.path = url2str(route.url);
		}

		return new Route(route, 0);
	}
	update(name:string, value: string, index?:number){
		const chunk = this.route.url[this.index + (index || 0)];
		if (!chunk){
			this.route.url.push({ page:"", params:{} });
			return this.update(name, value, index);
		}

		if (name === ""){
			chunk.page = value;
		} else {
			chunk.params[name] = value;
		}

		this.route.path = url2str(this.route.url);
	}
}