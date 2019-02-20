import {IJetURLChunk} from "./interfaces";


export function parse(url:string):IJetURLChunk[]{
	// remove starting /
	if (url[0] === "/"){
		url = url.substr(1);
	}

	// split url by "/"
	const parts = url.split("/");
	const chunks:IJetURLChunk[] = [];

	// for each page in url
	for (let i = 0; i < parts.length; i++){
		const test = parts[i];
		const result = {};

		// detect params
		// support old 			some:a=b:c=d
		// and new notation		some?a=b&c=d
		let pos = test.indexOf(":");
		if (pos === -1){
			pos = test.indexOf("?");
		}

		if (pos !== -1){
			const params = test.substr(pos+1).split(/[\:\?\&]/g);
			// create hash of named params
			for (const param of params) {
				const dchunk = param.split("=");
				result[dchunk[0]] = decodeURIComponent(dchunk[1]);
			}
		}

		// store parsed values
		chunks[i] = {
			page: (pos > -1 ? test.substr(0, pos) : test),
			params:result,
			isNew:true
		};
	}

	// return array of page objects
	return chunks;
}

export function url2str(stack:IJetURLChunk[]):string{
	const url = [];

	for (const chunk of stack){
		url.push("/"+chunk.page);
		const params = obj2str(chunk.params);
		if (params){
			url.push("?"+params);
		}
	}

	return url.join("");
}

function obj2str(obj){
	const str = [];
	for (const key in obj){
		if (str.length){
			str.push("&");
		}
		str.push(key+"="+encodeURIComponent(obj[key]));
	}

	return str.join("");
}