import { JetView, JetApp, plugins } from "../../sources/index";

let events = [];
export function getEvents(){
    return events;
}
export function resetEvents(){
    events = [];
}


export class TopView extends JetView {
    init(){
        events.push("top-init");
    }
    config(){
        events.push("top-config");
        return { rows:[ {$subview:true} ] };
    }
    ready(){
        events.push("top-ready");
    }
    urlChange(){
        events.push("top-urlChange");
    }
    destroy(){
        events.push("top-destroy");
    }
}

export class SubView1 extends JetView {
    init(){
        events.push("sub1-init");
    }
    config(){
        events.push("sub1-config");
        return { template:"a" };
    }
    ready(){
        events.push("sub1-ready");
    }
    urlChange(){
        events.push("sub1-urlChange");
    }
    destroy(){
        events.push("sub1-destroy");
    }
}

export class SubView2 extends JetView {
    init(){
        events.push("sub2-init");
    }
    config(){
        events.push("sub2-config");
        return { template:"a" };
    }
    ready(){
        events.push("sub2-ready");
    }
    urlChange(){
        events.push("sub2-urlChange");
    }
    destroy(){
        events.push("sub2-destroy");
    }
}

export class MenuView extends JetView {
    init(){
        this.use(plugins.Menu, "s1");
    }
    config(){
        return { rows:[{ view:"segmented", id:"s1", options:["one", "two", "three"] }, { $subview:true }] };
    }
}

export class ChangeRouteFromInit extends JetView{
    config(){
        return { rows:[{$subview:true}] };
    }
    init(){
        this.show("./Other")
    }
}

export class ChangeRouteFromUrlChange extends JetView{
    config(){
        return { rows:[{$subview:true}] };
    }
    urlChange(){
        this.show("../Other")
    }
}

export class TopMenuView extends JetView {
    config(){
        return { rows:[{ $subview:SubMenuView }, { $subview:true }] };
    }
}

export class SubMenuView extends JetView {
    init(){
        this.use(plugins.Menu, "s1");
    }
    config(){
        return { view:"segmented", id:"s1", options:["one", "two", "three"] };
    }
}

export class UrlParamsView extends JetView {
    init(){
        this.use(plugins.UrlParam, ["mode", "id"]);
    }
    config(){
        return { rows:[ { template:"Now" }, { $subview:true } ]};
    }
}

export class SubApp extends JetApp {
    constructor(config){
        config.views = {
            top:{ row:[{ template:"Header" }, { $subview:true }] },
            body:{ template:"Body"}
        };
        config.start = config.start || "/top/body";
        config.views = {
            "top" : { id:"sb-tp", rows:[ {$subview: true} ] },
            "body2": { template:"body 2" },
            "body": { template:"body" }
        };
        super(config);
    }
}