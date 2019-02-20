import {IJetApp, IJetView} from "../interfaces";

export function User(app: IJetApp, _view: IJetView, config: any){
	config = config || {};

	const login = config.login || "/login";
	const logout = config.logout || "/logout";
	const afterLogin = config.afterLogin || app.config.start;
	const afterLogout = config.afterLogout || "/login";
	const ping = config.ping || 5*60*1000;
	const model = config.model;
	let user = config.user;

	const service = {
		getUser(){
			return user;
		},
		getStatus(server? : boolean){
			if (!server){
				return user !== null;
			}

			return model.status().catch(() => null).then(data => {
				user = data;
			});
		},
		login(name:string, pass:string){
			return model.login(name, pass).then(data => {
				user = data;
				if (!data){
					throw new Error("Access denied");
				}

				app.callEvent("app:user:login", [ user ]);
				app.show(afterLogin);
			});
		},
		logout(){
			user = null;
			return model.logout().then(res => {
				app.callEvent("app:user:logout",[]);
				return res;
			});
		}
	};

	function canNavigate(url, obj){
		if (url === logout){
			service.logout();
			obj.redirect = afterLogout;
		} else if (url !== login && !service.getStatus()){
			obj.redirect = login;
		}
	}

	app.setService("user", service);

	app.attachEvent(`app:guard`, function(url: string, _$root: any, obj:any){
		if (config.public && config.public(url)){
			return true;
		}

		if (typeof user === "undefined"){
			obj.confirm = service.getStatus(true).then(() => canNavigate(url, obj));
		}

		return canNavigate(url, obj);
	});

	if (ping){
		setInterval(() => service.getStatus(true), ping);
	}
}