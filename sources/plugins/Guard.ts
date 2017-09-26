import {IJetApp, IJetURL, IJetView} from "../interfaces";

export function UnloadGuard(app: IJetApp, view: IJetView, config: any){
	view.on(app, `app:guard`, function(_$url:IJetURL, point:IJetView, promise:any){
		if (point === view || point.contains(view)){
			const res = config();
			if (res === false){
				promise.confirm = Promise.reject(res);
			} else {
				promise.confirm = promise.confirm.then(() => res);
			}
		}
	});
}