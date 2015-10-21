define([
	"models/user",
	"libs/routie"
], function(users){

	var config = {
		login		:"#!/login",
		afterLogin	:"",
		afterLogout	:"#!/login",

		ping:5*60*1000
	};

	var session = users.session;

	//check user's status
	function ping(){
		if (users.getCurrentUser())
			session.status().then(function(status){
				if (!status)
					try_to_logout();
			});
	}

	//show inner or external link
	function show(url){
		if (url.indexOf("#") === 0)
			require(["app"], function(app){
				app.show(url.substr(2));
			});
		else
			document.location.href = url;
	}

	//reaction on logout link
	function try_to_logout(){
		if (users.getCurrentUser())
			users.setCurrentUser(null);
		else
			show(config.afterLogout);
	}

	//reaction on login link
	function try_to_login(a){
		if (users.getCurrentUser())
			show(config.afterLogin);
		else
			require(["app"], function(app){
				app.router("/login");
			});
	}

	routie("!/logout", try_to_logout);

	return  {
		$oninit:function(app, newconfig){
			if (newconfig)
				webix.extend(config, newconfig, true);

			if (config.ping)
				setInterval(ping, config.ping);

			config.afterLogin = config.afterLogin || ("#!"+app.config.start);
		},
		$onurl:function(url){
			var user = users.getCurrentUser();
			if ((!user && url != "login") || (user && url == "login")){
				try_to_login();
				return false;
			}
		},

		byName:function(name, pass){
			return session.login(name, pass);
		},
		login:try_to_login,
		logout:try_to_logout,
		afterLogin:function(response){
			users.setCurrentUser(response, true);
			webix.delay(function(){
				show(config.afterLogin)
			});
		}
	};
});