(function(){

var app;
var view;
const waitTime = function(time){ 
	return new Promise(res => setTimeout(res, time));
}

describe("JetApp", () => {
	afterEach(function(){
		try{ app.destructor(); } catch(e){}
	});

	it("create/destory views on addView / removeView calls", () => {
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

		return app.render("sandbox")
		.then( _ => {
			events = [];
			app.getRoot().addView(view);
		})
		.then(_ => waitTime(20))	//addView doesn't return promise, so need to wait
		.then(_ => {
			expect(events, "after addView").deep.equal([ 
				"sub2-config", "sub2-init", "sub2-urlChange", "sub2-ready"
			]);
			expect(app.getSubView().contains(view)).to.be.true

			events = [];
			view.getRoot().getParentView().removeView(view.getRoot());
		})
		.then(_ => {
			expect(events, "after removeView").deep.equal(["sub2-destroy"]);
			expect(app.getSubView().contains(view)).to.be.false
		});
	});

});

})();