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
