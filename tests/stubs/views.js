var events = [];

class TopView extends jet.JetView {
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

class SubView1 extends jet.JetView {
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

class SubView2 extends jet.JetView {
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

class MenuView extends jet.JetView {
    init(){
        this.use(jet.plugins.Menu, "s1");
    }
    config(){
        return { rows:[{ view:"segmented", id:"s1", options:["one", "two", "three"] }, { $subview:true }] };
    }
}

class ChangeRouteFromInit extends jet.JetView{
    config(){
        return { rows:[{$subview:true}] };
    }
    init(){
        this.show("./Other")
    }
}

class ChangeRouteFromUrlChange extends jet.JetView{
    config(){
        return { rows:[{$subview:true}] };
    }
    urlChange(){
        this.show("../Other")
    }
}

class TopMenuView extends jet.JetView {
    config(){
        return { rows:[{ $subview:SubMenuView }, { $subview:true }] };
    }
}

class SubMenuView extends jet.JetView {
    init(){
        this.use(jet.plugins.Menu, "s1");
    }
    config(){
        return { view:"segmented", id:"s1", options:["one", "two", "three"] };
    }
}

class UrlParamsView extends jet.JetView {
    init(){
        this.use(jet.plugins.UrlParam, ["mode", "id"]);
    }
    config(){
        return { rows:[ { template:"Now" }, { $subview:true } ]};
    }
}

class SubApp extends jet.JetApp {
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