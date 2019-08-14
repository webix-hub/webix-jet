(function(){

var app;
var view;
const waitTime = function(time){ 
	return new Promise(res => setTimeout(res, time));
};

describe("JetApp", () => {
	afterEach(function(){
		try{ app.destructor(); } catch(e){}
	});

	it("create/destory views on addView / removeView calls", async () => {
        events = [];
       
		app = new jet.JetApp({
			start:"/Top/Sub1", router: jet.EmptyRouter,
			debug: true,
			version: 2,
			views:{
				"Top":TopView,
				"Sub1":SubView1,
				"Sub2":SubView2
			}
		});

		view = new SubView2(app, "");

		await app.render("sandbox")

		events = [];
		app.getRoot().addView(view);

		await waitTime(20);	//addView doesn't return promise, so need to wait

		expect(events, "after addView").deep.equal([ 
			"sub2-config", "sub2-init", "sub2-urlChange", "sub2-ready"
		]);
		expect(app.getSubView().contains(view)).to.be.true

		events = [];
		view.getRoot().getParentView().removeView(view.getRoot());

		await waitTime(20);

		expect(events, "after removeView").deep.equal(["sub2-destroy"]);
		expect(app.getSubView().contains(view)).to.be.false
	});

	it("get view id after adding JetView", async () => {
        app = new jet.JetApp({
			start:"/Top/Sub1", router: jet.EmptyRouter,
			debug: true,
			version: 2,
			views:{
				"Top":TopView,
				"Sub1":SubView1,
				"Sub2":SubView2
			}
		});

    	await app.render("sandbox")
		let id = await app.getRoot().addViewAsync(FixedIdView);
		expect(id).to.equal("v123");
	});

	it("get view id after adding custom view with JetViews", async () => {
        app = new jet.JetApp({
			start:"/Top/Sub1", router: jet.EmptyRouter,
			debug: true,
			version: 2,
			views:{
				"Top":TopView,
				"Sub1":SubView1,
				"Sub2":SubView2
			}
		});

    	await app.render("sandbox")
		let id1 = await app.getRoot().addViewAsync({ id: "v1", view:"list" });
		expect(id1).to.equal("v1");

		let id2 = await app.getRoot().addViewAsync({ id: "v2", rows:[ SubView1 ] });
		expect(id2).to.equal("v2");

		let id3 = await app.getRoot().addViewAsync({ id: "v3", rows:[ SubView1, SubView2 ] });
		expect(id3).to.equal("v3");
	});
})

})();