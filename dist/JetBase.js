var JetBase = (function () {
    function JetBase() {
        this.webixJet = true;
        this._id = webix.uid();
        this._events = [];
        this._subs = {};
        this._data = {};
    }
    JetBase.prototype.getRoot = function () {
        return this._root;
    };
    JetBase.prototype.destructor = function () {
        var events = this._events;
        for (var i = events.length - 1; i >= 0; i--) {
            events[i].obj.detachEvent(events[i].id);
        }
        // destroy sub views
        for (var key in this._subs) {
            var subView = this._subs[key].view;
            // it possible that subview was not loaded with any content yet
            // so check on null
            if (subView) {
                subView.destructor();
            }
        }
        this._events = this._container = this.app = this._parent = null;
    };
    JetBase.prototype.setParam = function (id, value, url) {
        if (this._data[id] !== value) {
            this._data[id] = value;
            if (this.app.callEvent("app:paramchange", [this, id, value, url])) {
                if (url) {
                    // changing in the url
                    this.show((_a = {}, _a[id] = value, _a));
                }
            }
        }
        var _a;
    };
    JetBase.prototype.getParam = function (id, parent) {
        var value = this._data[id];
        if (typeof value !== "undefined" || !parent) {
            return value;
        }
        var view = this.getParentView();
        if (view) {
            return view.getParam(id, parent);
        }
    };
    JetBase.prototype.getUrl = function () {
        return this._url;
    };
    JetBase.prototype.render = function (root, url, parent) {
        var _this = this;
        this._parent = parent;
        if (url) {
            this._index = url[0].index;
        }
        this._init_url_data(url);
        root = root || document.body;
        var _container = (typeof root === "string") ? webix.toNode(root) : root;
        if (this._container !== _container) {
            this._container = _container;
            return this._render(url).then(function () { return _this.getRoot(); });
        }
        else {
            return this._urlChange(url).then(function () { return _this.getRoot(); });
        }
    };
    JetBase.prototype.getIndex = function () {
        return this._index;
    };
    JetBase.prototype.getId = function () {
        return this._id;
    };
    JetBase.prototype.getParentView = function () {
        return this._parent;
    };
    JetBase.prototype.$$ = function (id) {
        if (typeof id === "string") {
            var root_1 = this.getRoot();
            return root_1.queryView((function (obj) { return (obj.config.id === id || obj.config.localId === id) &&
                (obj.$scope === root_1.$scope); }), "self");
        }
        else {
            return id;
        }
    };
    JetBase.prototype.on = function (obj, name, code) {
        var id = obj.attachEvent(name, code);
        this._events.push({ obj: obj, id: id });
        return id;
    };
    JetBase.prototype.contains = function (view) {
        for (var key in this._subs) {
            var kid = this._subs[key].view;
            if (kid === view || kid.contains(view)) {
                return true;
            }
        }
        return false;
    };
    JetBase.prototype.getSubView = function (name) {
        var sub = this.getSubViewInfo(name);
        if (sub) {
            return sub.subview.view;
        }
    };
    JetBase.prototype.getSubViewInfo = function (name) {
        var sub = this._subs[name || "default"];
        if (sub) {
            return { subview: sub, parent: this };
        }
        // when called from a child view, searches for nearest parent with subview
        if (this._parent) {
            return this._parent.getSubViewInfo(name);
        }
        return null;
    };
    JetBase.prototype.getName = function () {
        return this._name;
    };
    JetBase.prototype._init_url_data = function (url) {
        if (url && url[0]) {
            this._data = {};
            webix.extend(this._data, url[0].params, true);
        }
        this._url = url;
    };
    return JetBase;
}());
export { JetBase };
