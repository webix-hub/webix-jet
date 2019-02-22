export interface IBaseView {
	config: IBaseConfig;
	name:string;
	getParentView():IBaseView;
	destructor():void;
}

export interface IWebixHTMLHelper{
	addCss(node:HTMLElement, css:string):void;
	removeCss(node:HTMLElement, css:string):void;
}
export interface IBaseConfig {
	id?:string;
	container?: string|HTMLElement;
}

export interface IWebixFacade{
	storage:any;
	html: IWebixHTMLHelper;
	EventSystem: any;
	DataCollection: any;

	$$(id: string):IBaseView;
	isArray(input:any):boolean;
	uid():number;
	ui(
		config: any,
		cont?: string|HTMLElement|IBaseView) : IBaseView;
	bind(handler:any, master:any);
	message(text:any);
	dp(id:string):any;
	toNode(id:string):HTMLElement;
	extend(a: any, b: any, force?:boolean):any;
	attachEvent(name: string, handler:any):string;
}

export interface IUIConfig{
	container? : string|HTMLElement;
}

export interface IJetApp extends IJetView{
	webix: IWebixFacade;
	config: IJetConfig;
	app: IJetApp;
	getUrl():IJetURL;
	getService(name:string):any;
	setService(name:string, obj: any):void;
	callEvent(name:string, parameters:any[]):boolean;
	attachEvent(name:string, handler:any):void;
	createFromURL(chunk:IJetURLChunk, now: IJetView) : Promise<IJetView>;
	show(path:any):Promise<void>;
	createView(obj:any, name?:string):IJetView;
	refresh():Promise<IBaseView>;
	error(name:string, data:any[]);
	copyConfig(source:any, target:any, config?:IViewConfig);
	getRouter(): IJetRouter;
	destructor(): void;
}

export interface IJetURLChunk{
	page:string;
	params:{ [name:string]:string };

	view?:IJetView;
	isNew?:boolean;
}

export type IJetURL = IJetURLChunk[];

export interface IJetView{
	app: IJetApp;
	$$(name:string):IBaseView;
	contains(view: IJetView):boolean;
	getSubView(name?:string):IJetView;
	getSubViewInfo(name?:string):ISubViewInfo;
	getRoot() : IBaseView;
	setParam(id:string, value:any, url?:boolean);
	getParam(id:string, parent:boolean):any;
	getUrl():IJetURL;
	getUrlString():string;
	getParentView() : IJetView;
	refresh():Promise<IBaseView>;
	render(
		area: ISubView|string|HTMLElement,
		url? : IRoute,
		parent?: IJetView) : Promise<IBaseView>;
	destructor();
	on(obj:any, name:string, code:any);
	show(path:any, config?:any):Promise<void>;
}

export interface IHash{
	[name:string]:any;
}

export interface IJetConfig{
	debug?:boolean;
	app?: IJetApp;
	name?:string;
	version?:string;
	start?:string;
	webix?:IWebixFacade;
	container:HTMLElement | string;
	animation:boolean;
	router: IJetRouterFactory;
	views: Function | IHash;
}

export interface IJetRouterOptions{
	[name:string]:any;
}

export interface IJetRouterFactory{
	new (cb:IJetRouterCallback, config:any, app:IJetApp);
}
export interface IJetViewFactory{
	new (app:IJetApp, name:string);
}

export interface IJetRouter{
	get():string;
	set(name:string, options?:IJetRouterOptions):void;
}
export type IJetRouterCallback = (url?:string) => any;

export interface IViewConfig{
	[name:string]:ISubView;
}

export interface ISubView{
	view?: IJetView;
	url: string | IJetViewFactory;
	name?: string;
	popup?: boolean;
	id: string;
	branch?: boolean;
	route?: IRoute;
	lock?: Promise<any>;
}

export interface ISubViewInfo{
	subview: ISubView;
	parent: IJetView;
}

export interface IPath{
	path: string;
	url: IJetURL;
	linkRouter?: boolean
}

export interface IRoute{
	route: IPath;

	current():IJetURLChunk;
	next():IJetURLChunk;

	suburl():IJetURL;
	shift():IRoute;
	show(url:string, view:IJetView, kids?: boolean):Promise<void>;
	refresh():void;
	size(n:number);
	update(name: string, value: string, index?:number);
	split():IRoute;
	append(path:string):string;
	toString():string;
}

export interface IDestructable{
	destructor():void;
}