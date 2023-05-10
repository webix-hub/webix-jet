export const waitTime = function(time){ 
	return new Promise(res => setTimeout(res, time));
}

export const loadWebix = function(){
	return new Promise(res => {
		const script = document.createElement('script');	
		script.onload = () => {
			res();
		};
		script.src = "https://cdn.webix.com/edge/webix.js";
		document.head.appendChild(script);
	});
}