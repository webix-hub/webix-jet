/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */
/* global Reflect, Promise */

var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return extendStatics(d, b);
};

function __extends(d, b) {
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

var JetBase = /** @class */ (function () {
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
        var _a;
        if (this._data[id] !== value) {
            this._data[id] = value;
            if (this.app.callEvent("app:paramchange", [this, id, value, url])) {
                if (url) {
                    // changing in the url
                    this.show((_a = {}, _a[id] = value, _a));
                }
            }
        }
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
//# sourceMappingURL=JetBase.js.map

function parse(url) {
    // remove starting /
    if (url[0] === "/") {
        url = url.substr(1);
    }
    // split url by "/"
    var parts = url.split("/");
    var chunks = [];
    // for each page in url
    for (var i = 0; i < parts.length; i++) {
        var test_1 = parts[i];
        var result = {};
        // detect params
        // support old 			some:a=b:c=d
        // and new notation		some?a=b&c=d
        var pos = test_1.indexOf(":");
        if (pos === -1) {
            pos = test_1.indexOf("?");
        }
        if (pos !== -1) {
            var params = test_1.substr(pos + 1).split(/[\:\?\&]/g);
            // create hash of named params
            for (var _i = 0, params_1 = params; _i < params_1.length; _i++) {
                var param = params_1[_i];
                var dchunk = param.split("=");
                result[dchunk[0]] = decodeURIComponent(dchunk[1]);
            }
        }
        // store parsed values
        chunks[i] = {
            page: (pos > -1 ? test_1.substr(0, pos) : test_1),
            params: result, index: i + 1
        };
    }
    // return array of page objects
    return chunks;
}
function url2str(stack) {
    var url = [];
    for (var _i = 0, stack_1 = stack; _i < stack_1.length; _i++) {
        var chunk = stack_1[_i];
        url.push("/" + chunk.page);
        var params = obj2str(chunk.params);
        if (params) {
            url.push("?" + params);
        }
    }
    return url.join("");
}
function obj2str(obj) {
    var str = [];
    for (var key in obj) {
        if (str.length) {
            str.push("&");
        }
        str.push(key + "=" + encodeURIComponent(obj[key]));
    }
    return str.join("");
}
//# sourceMappingURL=helpers.js.map

var JetView = /** @class */ (function (_super) {
    __extends(JetView, _super);
    function JetView(app, name) {
        var _this = _super.call(this) || this;
        _this.app = app;
        _this._name = name;
        _this._children = [];
        return _this;
    }
    JetView.prototype.ui = function (ui, config) {
        config = config || {};
        var container = config.container || ui.container;
        var jetview = this.app.createView(ui);
        this._children.push(jetview);
        jetview.render(container, null, this);
        if (typeof ui !== "object" || (ui instanceof JetBase)) {
            // raw webix UI
            return jetview;
        }
        else {
            return jetview.getRoot();
        }
    };
    JetView.prototype.show = function (path, config) {
        var _this = this;
        config = config || {};
        // detect the related view
        if (typeof path === "string") {
            // root path
            if (path.substr(0, 1) === "/") {
                return this.app.show(path);
            }
            // parent path, call parent view
            if (path.indexOf("../") === 0) {
                var parent_1 = this.getParentView();
                if (parent_1) {
                    parent_1.show("./" + path.substr(3), config);
                }
                else {
                    this.app.show("/" + path.substr(3));
                }
                return;
            }
            // local path, do nothing
            if (path.indexOf("./") === 0) {
                path = path.substr(2);
            }
            var sub = this.getSubViewInfo(config.target);
            if (!sub) {
                return this.app.show("/" + path);
            }
            if (sub.parent !== this) {
                return sub.parent.show(path, config);
            }
        }
        var currentUrl = parse(this.app.getRouter().get());
        // convert parameters to url
        if (typeof path === "object") {
            if (webix.isArray(path)) {
                var argIndex = this._index + path[0];
                if (!currentUrl[argIndex]) {
                    currentUrl[argIndex] = {};
                }
                currentUrl[argIndex].page = path[1];
                path = "";
            }
            else {
                var temp = [];
                for (var key in path) {
                    temp.push(encodeURIComponent(key) + "=" + encodeURIComponent(path[key]));
                }
                path = "?" + temp.join("&");
            }
        }
        // process url
        if (typeof path === "string") {
            // parameters only
            if (path.substr(0, 1) === "?") {
                var next = path.indexOf("/");
                var params = path;
                if (next > -1) {
                    params = path.substr(0, next);
                }
                var chunk = parse(params);
                webix.extend(currentUrl[this._index - 1].params, chunk[0].params, true);
                path = next > -1 ? path.substr(next + 1) : "";
            }
            var newChunk = path === "" ? currentUrl.slice(this._index) : parse(path);
            var url_1 = null;
            if (this._index) {
                url_1 = currentUrl.slice(0, this._index).concat(newChunk);
                for (var i = 0; i < url_1.length; i++) {
                    url_1[i].index = i + 1;
                }
                var urlstr_1 = url2str(url_1);
                return this.app.canNavigate(urlstr_1, this).then(function (redirect) {
                    if (redirect !== null) {
                        if (urlstr_1 !== redirect) {
                            // url was blocked and redirected
                            return _this.app.show(redirect);
                        }
                        else {
                            return _this._finishShow(url_1, redirect);
                        }
                    }
                    return null;
                });
            }
            else {
                return this._finishShow(newChunk, "");
            }
        }
    };
    JetView.prototype.init = function (_$view, _$url) {
        // stub
    };
    JetView.prototype.ready = function (_$view, _$url) {
        // stub
    };
    JetView.prototype.config = function () {
        this.app.webix.message("View:Config is not implemented");
    };
    JetView.prototype.urlChange = function (_$view, _$url) {
        // stub
    };
    JetView.prototype.destroy = function () {
        // stub
    };
    JetView.prototype.destructor = function () {
        this.destroy();
        this._destroyKids();
        // reset vars for better GC processing
        this.app = this._parentFrame = null;
        // destroy actual UI
        this._root.destructor();
        _super.prototype.destructor.call(this);
    };
    JetView.prototype.use = function (plugin, config) {
        plugin(this.app, this, config);
    };
    JetView.prototype.refresh = function () {
        var _this = this;
        this._destroyKids();
        var url = [];
        if (this._index > 1)
            url = parse(this.app.getRouter().get()).slice(this._index - 1);
        this._render(url).then(function () {
            _this._parentFrame.id = _this.getRoot().config.id;
        });
    };
    JetView.prototype._render = function (url) {
        var _this = this;
        var config = this.config();
        if (config.then) {
            return config.then(function (cfg) { return _this._render_final(cfg, url); });
        }
        else {
            return this._render_final(config, url);
        }
    };
    JetView.prototype._render_final = function (config, url) {
        var _this = this;
        var prev = this._container;
        if (prev && prev.$destructed) {
            return Promise.reject("Container destroyed");
        }
        var response;
        // using wrapper object, so ui can be changed from app:render event
        var result = { ui: {} };
        this.app.copyConfig(config, result.ui, this._subs);
        this.app.callEvent("app:render", [this, url, result]);
        result.ui.$scope = this;
        try {
            // special handling for adding inside of multiview - preserve old id
            if (prev && prev.getParentView) {
                var parent_2 = prev.getParentView();
                if (parent_2 && parent_2.name === "multiview" && !result.ui.id) {
                    result.ui.id = prev.config.id;
                }
            }
            this._root = this.app.webix.ui(result.ui, this._container);
            if (this._root.getParentView()) {
                this._container = this._root;
            }
            this._init(this._root, url);
            response = this._urlChange(url).then(function () {
                return _this.ready(_this._root, url);
            });
        }
        catch (e) {
            response = Promise.reject(e);
        }
        return response.catch(function (err) { return _this._initError(_this, err); });
    };
    JetView.prototype._init = function (view, url) {
        return this.init(view, url);
    };
    JetView.prototype._urlChange = function (url) {
        var _this = this;
        this.app.callEvent("app:urlchange", [this, url, this._index]);
        var waits = [];
        for (var key in this._subs) {
            var wait = this._renderFrame(key, this._subs[key], url);
            if (wait) {
                waits.push(wait);
            }
        }
        return Promise.all(waits).then(function () {
            _this.urlChange(_this._root, url);
        });
    };
    JetView.prototype._renderFrame = function (key, frame, url) {
        if (frame.url) {
            // we have fixed subview url
            if (typeof frame.url === "string") {
                var parsed = parse(frame.url);
                parsed.map(function (a) { a.index = 0; });
                return this._createSubView(frame, parsed);
            }
            else {
                var view = frame.view;
                if (typeof frame.url === "function" && !(view instanceof frame.url)) {
                    view = new frame.url(this.app, "");
                }
                if (!view) {
                    view = frame.url;
                }
                return this._renderSubView(frame, view, url);
            }
        }
        else if (key === "default" && url && url.length > 1) {
            // we have an url and subview for it
            var suburl = url.slice(1);
            return this._createSubView(frame, suburl);
        }
    };
    JetView.prototype._initError = function (view, err) {
        this.app.error("app:error:initview", [err, view]);
        return true;
    };
    JetView.prototype._createSubView = function (sub, suburl) {
        var _this = this;
        return this.app.createFromURL(suburl, sub.view).then(function (view) {
            return _this._renderSubView(sub, view, suburl);
        });
    };
    JetView.prototype._renderSubView = function (sub, view, suburl) {
        var cell = this.app.webix.$$(sub.id);
        return view.render(cell, suburl, this).then(function (ui) {
            // destroy old view
            if (sub.view && sub.view !== view) {
                sub.view.destructor();
            }
            // save info about a new view
            sub.view = view;
            sub.id = ui.config.id;
            if (view instanceof JetView) {
                view._parentFrame = sub;
            }
            return ui;
        });
    };
    JetView.prototype._finishShow = function (url, path) {
        var next;
        if (this._index) {
            next = this._renderPartial(url.slice(this._index - 1));
            this.app.getRouter().set(path, { silent: true });
            this.app.callEvent("app:route", [url]);
        }
        else {
            url.map(function (a) { return a.index = 0; });
            next = this._renderPartial([null].concat(url));
        }
        return next;
    };
    JetView.prototype._renderPartial = function (url) {
        this._init_url_data(url);
        return this._urlChange(url);
    };
    JetView.prototype._destroyKids = function () {
        // destroy child views
        var uis = this._children;
        for (var i = uis.length - 1; i >= 0; i--) {
            if (uis[i] && uis[i].destructor) {
                uis[i].destructor();
            }
        }
        // reset vars for better GC processing
        this._children = [];
    };
    return JetView;
}(JetBase));
//# sourceMappingURL=JetView.js.map

// wrapper for raw objects and Jet 1.x structs
var JetViewLegacy = /** @class */ (function (_super) {
    __extends(JetViewLegacy, _super);
    function JetViewLegacy(app, name, ui) {
        var _this = _super.call(this, app, name) || this;
        _this._ui = ui;
        _this._windows = [];
        return _this;
    }
    JetViewLegacy.prototype.getRoot = function () {
        if (this.app.config.jet1xMode) {
            var parent_1 = this.getParentView();
            if (parent_1) {
                return parent_1.getRoot();
            }
        }
        return this._root;
    };
    JetViewLegacy.prototype.config = function () {
        return this._ui.$ui || this._ui;
    };
    JetViewLegacy.prototype.destructor = function () {
        var destroy = this._ui.$ondestroy;
        if (destroy) {
            destroy();
        }
        for (var _i = 0, _a = this._windows; _i < _a.length; _i++) {
            var window_1 = _a[_i];
            window_1.destructor();
        }
        _super.prototype.destructor.call(this);
    };
    JetViewLegacy.prototype.show = function (path, config) {
        if (path.indexOf("/") === 0 || path.indexOf("./") === 0) {
            return _super.prototype.show.call(this, path, config);
        }
        _super.prototype.show.call(this, "../" + path, config);
    };
    JetViewLegacy.prototype.init = function () {
        if (this.app.config.legacyEarlyInit) {
            this._realInitHandler();
        }
    };
    JetViewLegacy.prototype.ready = function () {
        if (!this.app.config.legacyEarlyInit) {
            this._realInitHandler();
        }
    };
    JetViewLegacy.prototype._realInitHandler = function () {
        var init = this._ui.$oninit;
        if (init) {
            var root = this.getRoot();
            init(root, root.$scope);
        }
        var events = this._ui.$onevent;
        if (events) {
            for (var key in events) {
                this.on(this.app, key, events[key]);
            }
        }
        var windows = this._ui.$windows;
        if (windows) {
            for (var _i = 0, windows_1 = windows; _i < windows_1.length; _i++) {
                var conf = windows_1[_i];
                if (conf.$ui) {
                    var view = new JetViewLegacy(this.app, this.getName(), conf);
                    view.render(document.body);
                    this._windows.push(view);
                }
                else {
                    this.ui(conf);
                }
            }
        }
    };
    JetViewLegacy.prototype._urlChange = function (url) {
        var _this = this;
        return _super.prototype._urlChange.call(this, url).then(function () {
            var onurlchange = _this._ui.$onurlchange;
            if (onurlchange) {
                var root = _this.getRoot();
                onurlchange(url[0].params, url.slice(1), root.$scope);
            }
        });
    };
    return JetViewLegacy;
}(JetView));
//# sourceMappingURL=JetViewLegacy.js.map

// wrapper for raw objects and Jet 1.x structs
var JetViewRaw = /** @class */ (function (_super) {
    __extends(JetViewRaw, _super);
    function JetViewRaw(app, name, ui) {
        var _this = _super.call(this, app, name) || this;
        _this._ui = ui;
        return _this;
    }
    JetViewRaw.prototype.config = function () {
        return this._ui;
    };
    return JetViewRaw;
}(JetView));
//# sourceMappingURL=JetViewRaw.js.map

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var routie = createCommonjsModule(function (module) {
/*!
 * webix-routie - router for Webix-Jet
 * v0.4.0
 * MIT License
 *
 * based on routie - a tiny hash router
 * http://projects.jga.me/routie
 * copyright Greg Allen 2016
 * MIT License
*/

var Routie = function(w, isModule) {

  var routes = [];
  var map = {};
  var reference = 'routie';
  var oldReference = w[reference];
  var oldUrl;

  var Route = function(path, name) {
    this.name = name;
    this.path = path;
    this.keys = [];
    this.fns = [];
    this.params = {};
    this.regex = pathToRegexp(this.path, this.keys, false, false);

  };

  Route.prototype.addHandler = function(fn) {
    this.fns.push(fn);
  };

  Route.prototype.removeHandler = function(fn) {
    for (var i = 0, c = this.fns.length; i < c; i++) {
      var f = this.fns[i];
      if (fn == f) {
        this.fns.splice(i, 1);
        return;
      }
    }
  };

  Route.prototype.run = function(params) {
    for (var i = 0, c = this.fns.length; i < c; i++) {
      if (this.fns[i].apply(this, params) === false)
        return false;
    }
    return true;
  };

  Route.prototype.match = function(path, params){
    var m = this.regex.exec(path);

    if (!m) return false;


    for (var i = 1, len = m.length; i < len; ++i) {
      var key = this.keys[i - 1];

      var val = ('string' == typeof m[i]) ? decodeURIComponent(m[i]) : m[i];

      if (key) {
        this.params[key.name] = val;
      }
      params.push(val);
    }

    return true;
  };

  Route.prototype.toURL = function(params) {
    var path = this.path;
    for (var param in params) {
      path = path.replace('/:'+param, '/'+params[param]);
    }
    path = path.replace(/\/:.*\?/g, '/').replace(/\?/g, '');
    if (path.indexOf(':') != -1) {
      throw new Error('missing parameters for url: '+path);
    }
    return path;
  };

  var pathToRegexp = function(path, keys, sensitive, strict) {
    if (path instanceof RegExp) return path;
    if (path instanceof Array) path = '(' + path.join('|') + ')';
    path = path
      .concat(strict ? '' : '/?')
      .replace(/\/\(/g, '(?:/')
      .replace(/\+/g, '__plus__')
      .replace(/(\/)?(\.)?:(\w+)(?:(\(.*?\)))?(\?)?/g, function(_, slash, format, key, capture, optional){
        keys.push({ name: key, optional: !! optional });
        slash = slash || '';
        return '' + (optional ? '' : slash) + '(?:' + (optional ? slash : '') + (format || '') + (capture || (format && '([^/.]+?)' || '([^/]+?)')) + ')' + (optional || '');
      })
      .replace(/([/.])/g, '\\$1')
      .replace(/__plus__/g, '(.+)')
      .replace(/\*/g, '(.*)');
    return new RegExp('^' + path + '$', sensitive ? '' : 'i');
  };

  var addHandler = function(path, fn) {
    var s = path.split(' ');
    var name = (s.length == 2) ? s[0] : null;
    path = (s.length == 2) ? s[1] : s[0];

    if (!map[path]) {
      map[path] = new Route(path, name);
      routes.push(map[path]);
    }
    map[path].addHandler(fn);
  };

  var routie = function(path, fn) {
    if (typeof fn == 'function') {
      addHandler(path, fn);
      routie.reload();
    } else if (typeof path == 'object') {
      for (var p in path) {
        addHandler(p, path[p]);
      }
      routie.reload();
    } else if (typeof fn === 'undefined') {
      routie.navigate(path);
    }
  };

  routie.lookup = function(name, obj) {
    for (var i = 0, c = routes.length; i < c; i++) {
      var route = routes[i];
      if (route.name == name) {
        return route.toURL(obj);
      }
    }
  };

  routie.remove = function(path, fn) {
    var route = map[path];
    if (!route)
      return;
    route.removeHandler(fn);
  };

  routie.removeAll = function() {
    map = {};
    routes = [];
    oldUrl = '';
  };

  routie.navigate = function(path, options) {
    options = options || {};
    var silent = options.silent || false;

    if (silent) {
      removeListener();
    }
    setTimeout(function() {
      window.location.hash = path;

      if (silent) {
        setTimeout(function() { 
          addListener();
        }, 1);
      }

    }, 1);
  };

  routie.noConflict = function() {
    w[reference] = oldReference;
    return routie;
  };

  var getHash = function() {
    return window.location.hash.substring(1);
  };

  var checkRoute = function(hash, route) {
    var params = [];
    if (route.match(hash, params)) {
      return (route.run(params) !== false ? 1 : 0);
    }
    return -1;
  };

  var hashChanged = routie.reload = function() {
    var hash = getHash();
    for (var i = 0, c = routes.length; i < c; i++) {
      var route = routes[i];
      var state = checkRoute(hash, route);
      if (state === 1) {
        //route processed
        oldUrl = hash;
        break;
      } else if (state === 0){
        //route rejected
        routie.navigate(oldUrl, { silent:true });
        break;
      }
    }
  };

  var addListener = function() {
    if (w.addEventListener) {
      w.addEventListener('hashchange', hashChanged, false);
    } else {
      w.attachEvent('onhashchange', hashChanged);
    }
  };

  var removeListener = function() {
    if (w.removeEventListener) {
      w.removeEventListener('hashchange', hashChanged);
    } else {
      w.detachEvent('onhashchange', hashChanged);
    }
  };
  addListener();
  oldUrl = getHash();

  if (isModule){
    return routie;
  } else {
    w[reference] = routie;
  }
   
};

{
  module.exports = Routie(window,true);
  module.exports.default = module.exports;
}
});

var HashRouter = /** @class */ (function () {
    function HashRouter(cb, config) {
        var _this = this;
        this.config = config || {};
        this._prefix = this.config.routerPrefix;
        // use "#!" for backward compatibility
        if (typeof this._prefix === "undefined") {
            this._prefix = "!";
        }
        var rcb = function (_$a) { };
        routie(this._prefix + "*", function () {
            _this._lastUrl = "";
            return rcb(_this.get());
        });
        rcb = cb;
    }
    HashRouter.prototype.set = function (path, config) {
        if (this.config.routes) {
            var compare = path.split("?", 2);
            for (var key in this.config.routes) {
                if (this.config.routes[key] === compare[0]) {
                    path = key + (compare.length > 1 ? "?" + compare[1] : "");
                    break;
                }
            }
        }
        this._lastUrl = path;
        routie.navigate(this._prefix + path, config);
    };
    HashRouter.prototype.get = function () {
        var path = this._lastUrl ||
            (window.location.hash || "").replace("#" + this._prefix, "");
        if (this.config.routes) {
            var compare = path.split("?", 2);
            var key = this.config.routes[compare[0]];
            if (key) {
                path = key + (compare.length > 1 ? "?" + compare[1] : "");
            }
        }
        return path;
    };
    return HashRouter;
}());
//# sourceMappingURL=HashRouter.js.map

var w = webix;
var version = webix.version.split(".");
// will be fixed in webix 5.3
if (version[0] * 10 + version[1] * 1 < 53) {
    w.ui.freeze = function (handler) {
        // disabled because webix jet 5.0 can't handle resize of scrollview correctly
        // w.ui.$freeze = true;
        var res = handler();
        if (res && res.then) {
            res.then(function (some) {
                w.ui.$freeze = false;
                w.ui.resize();
                return some;
            });
        }
        else {
            w.ui.$freeze = false;
            w.ui.resize();
        }
        return res;
    };
}
// adding views as classes
var baseAdd = w.ui.baselayout.prototype.addView;
var baseRemove = w.ui.baselayout.prototype.removeView;
var config = {
    addView: function (view, index) {
        if (this.$scope && this.$scope.webixJet) {
            var jview_1 = this.$scope;
            var subs_1 = {};
            view = jview_1.app.copyConfig(view, {}, subs_1);
            baseAdd.apply(this, [view, index]);
            var _loop_1 = function (key) {
                jview_1._renderFrame(key, subs_1[key], jview_1.getUrl()).then(function () {
                    jview_1._subs[key] = subs_1[key];
                });
            };
            for (var key in subs_1) {
                _loop_1(key);
            }
            return view.id;
        }
        else {
            return baseAdd.apply(this, arguments);
        }
    },
    removeView: function () {
        baseRemove.apply(this, arguments);
        if (this.$scope && this.$scope.webixJet) {
            var subs = this.$scope._subs;
            for (var key in subs) {
                if (!webix.$$(subs[key].id)) {
                    delete subs[key];
                }
            }
        }
    }
};
w.extend(w.ui.layout.prototype, config, true);
w.extend(w.ui.baselayout.prototype, config, true);
// wrapper for using Jet Apps as views
webix.protoUI({
    name: "jetapp",
    $init: function (cfg) {
        this.$app = new this.app(cfg);
        var id = webix.uid().toString();
        cfg.body = { id: id };
        this.$ready.push(function () {
            this.$app.render(webix.$$(id));
        });
    }
}, webix.ui.proxy);
//# sourceMappingURL=patch.js.map

var JetApp = /** @class */ (function (_super) {
    __extends(JetApp, _super);
    function JetApp(config) {
        var _this = _super.call(this) || this;
        _this.webix = config.webix || webix;
        // init config
        _this.config = _this.webix.extend({
            name: "App",
            version: "1.0",
            start: "/home"
        }, config, true);
        _this._name = _this.config.name;
        _this._services = {};
        webix.extend(_this, webix.EventSystem);
        return _this;
    }
    JetApp.prototype.getService = function (name) {
        var obj = this._services[name];
        if (typeof obj === "function") {
            obj = this._services[name] = obj(this);
        }
        return obj;
    };
    JetApp.prototype.setService = function (name, handler) {
        this._services[name] = handler;
    };
    // copy object and collect extra handlers
    JetApp.prototype.copyConfig = function (obj, target, config) {
        // raw ui config
        if (obj.$ui) {
            obj = { $subview: new JetViewLegacy(this, "", obj) };
        }
        else if (obj instanceof JetBase ||
            (typeof obj === "function" && obj.prototype instanceof JetBase)) {
            obj = { $subview: obj };
        }
        // subview placeholder
        if (obj.$subview) {
            return this.addSubView(obj, target, config);
        }
        // process sub-properties
        target = target || (obj instanceof Array ? [] : {});
        for (var method in obj) {
            var point = obj[method];
            // view class
            if (typeof point === "function" && point.prototype instanceof JetBase) {
                point = { $subview: point };
            }
            if (point && typeof point === "object" &&
                !(point instanceof webix.DataCollection) && !(point instanceof RegExp)) {
                if (point instanceof Date) {
                    target[method] = new Date(point);
                }
                else {
                    target[method] = this.copyConfig(point, (point instanceof Array ? [] : {}), config);
                }
            }
            else {
                target[method] = point;
            }
        }
        return target;
    };
    JetApp.prototype.getRouter = function () {
        return this.$router;
    };
    JetApp.prototype.clickHandler = function (e) {
        if (e) {
            var target = (e.target || e.srcElement);
            if (target && target.getAttribute) {
                var trigger = target.getAttribute("trigger");
                if (trigger) {
                    this.trigger(trigger);
                }
                var route = target.getAttribute("route");
                if (route) {
                    this.show(route);
                }
            }
        }
    };
    JetApp.prototype.refresh = function () {
        var temp = this._container;
        //enforce view recreation
        this._view._name = webix.uid() + "";
        this._container = null;
        this.render(temp, parse(this.getRouter().get()), this._parent);
    };
    JetApp.prototype.loadView = function (url) {
        var _this = this;
        var views = this.config.views;
        var result = null;
        if (url === "") {
            return Promise.resolve(this._loadError("", new Error("Webix Jet: Empty url segment")));
        }
        try {
            if (views) {
                if (typeof views === "function") {
                    // custom loading strategy
                    result = views(url);
                }
                else {
                    // predefined hash
                    result = views[url];
                }
                if (typeof result === "string") {
                    url = result;
                    result = null;
                }
            }
            if (!result) {
                url = url.replace(/\./g, "/");
                result = require("jet-views/" + url);
            }
        }
        catch (e) {
            result = this._loadError(url, e);
        }
        // custom handler can return view or its promise
        if (!result.then) {
            result = Promise.resolve(result);
        }
        // set error handler
        result = result
            .then(function (module) { return module.__esModule ? module.default : module; })
            .catch(function (err) { return _this._loadError(url, err); });
        return result;
    };
    JetApp.prototype.createFromURL = function (url, now) {
        var _this = this;
        var chunk = url[0];
        var name = chunk.page;
        var view;
        if (now && now.getName() === name) {
            view = Promise.resolve(now);
        }
        else {
            view = this.loadView(chunk.page)
                .then(function (ui) { return _this.createView(ui, name); });
        }
        return view;
    };
    JetApp.prototype.createView = function (ui, name) {
        var obj;
        if (typeof ui === "function") {
            if (ui.prototype instanceof JetBase) {
                // UI class
                return new ui(this, name);
            }
            else {
                // UI factory functions
                ui = ui();
            }
        }
        if (ui instanceof JetBase) {
            obj = ui;
        }
        else {
            // UI object
            if (ui.$ui) {
                obj = new JetViewLegacy(this, name, ui);
            }
            else {
                obj = new JetViewRaw(this, name, ui);
            }
        }
        return obj;
    };
    // show view path
    JetApp.prototype.show = function (name) {
        if (this.$router.get() !== name) {
            return this._render(name);
        }
        else {
            return Promise.resolve(true);
        }
    };
    JetApp.prototype.canNavigate = function (url, view) {
        var obj = {
            url: parse(url),
            redirect: url,
            confirm: Promise.resolve(true)
        };
        var res = this.callEvent("app:guard", [url, (view || this._view), obj]);
        if (!res) {
            return Promise.reject("");
        }
        return obj.confirm.catch(function () { return obj.redirect = null; }).then(function () { return obj.redirect; });
    };
    JetApp.prototype.destructor = function () {
        this._view.destructor();
    };
    // event helpers
    JetApp.prototype.trigger = function (name) {
        var rest = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            rest[_i - 1] = arguments[_i];
        }
        this.apply(name, rest);
    };
    JetApp.prototype.apply = function (name, data) {
        this.callEvent(name, data);
    };
    JetApp.prototype.action = function (name) {
        return this.webix.bind(function () {
            var rest = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                rest[_i] = arguments[_i];
            }
            this.apply(name, rest);
        }, this);
    };
    JetApp.prototype.on = function (name, handler) {
        this.attachEvent(name, handler);
    };
    JetApp.prototype.use = function (plugin, config) {
        plugin(this, null, config);
    };
    JetApp.prototype.error = function (name, er) {
        this.callEvent(name, er);
        this.callEvent("app:error", er);
        /* tslint:disable */
        if (this.config.debug) {
            for (var i = 0; i < er.length; i++) {
                console.error(er[i]);
                if (er[i] instanceof Error) {
                    var text = er[i].message;
                    if (text.indexOf("Module build failed") === 0) {
                        text = text.replace(/\x1b\[[0-9;]*m/g, "");
                        document.body.innerHTML = "<pre style='font-size:16px; background-color: #ec6873; color: #000; padding:10px;'>" + text + "</pre>";
                    }
                    else {
                        text += "<br><br>Check console for more details";
                        webix.message({ type: "error", text: text, expire: -1 });
                    }
                }
            }
            debugger;
        }
        /* tslint:enable */
    };
    // renders top view
    JetApp.prototype._render = function (url) {
        var _this = this;
        var firstInit = !this.$router;
        if (firstInit) {
            webix.attachEvent("onClick", function (e) { return _this.clickHandler(e); });
            url = this._first_start(url);
        }
        var strUrl = typeof url === "string" ? url : url2str(url);
        return this.canNavigate(strUrl).then(function (newurl) {
            if (newurl !== null) {
                _this.$router.set(newurl, { silent: true });
                return _this._render_stage(newurl);
            }
            return null;
        });
    };
    JetApp.prototype._render_stage = function (url) {
        var _this = this;
        var parsed = (typeof url === "string") ? parse(url) : url;
        // block resizing while rendering parts of UI
        return webix.ui.freeze(function () {
            return _this.createFromURL(parsed, _this._view).then(function (view) {
                // save reference for old and new views
                var oldview = _this._view;
                _this._view = view;
                // render url state for the root
                return view.render(_this._container, parsed, _this._parent).then(function (root) {
                    // destroy and detach old view
                    if (oldview && oldview !== _this._view) {
                        oldview.destructor();
                    }
                    if (_this._view.getRoot().getParentView()) {
                        _this._container = root;
                    }
                    _this._root = root;
                    _this.callEvent("app:route", [parsed]);
                    return view;
                });
            }).catch(function (er) {
                _this.error("app:error:render", [er]);
            });
        });
    };
    JetApp.prototype._urlChange = function (_$url) {
        alert("Not implemented");
        return Promise.resolve(true);
    };
    JetApp.prototype._first_start = function (url) {
        var _this = this;
        var cb = function (a) { return setTimeout(function () {
            _this._render(a);
        }, 1); };
        this.$router = new (this.config.router || HashRouter)(cb, this.config);
        // start animation for top-level app
        if (this._container === document.body && this.config.animation !== false) {
            var node_1 = this._container;
            webix.html.addCss(node_1, "webixappstart");
            setTimeout(function () {
                webix.html.removeCss(node_1, "webixappstart");
                webix.html.addCss(node_1, "webixapp");
            }, 10);
        }
        if (!url || url.length === 1) {
            url = this.$router.get() || this.config.start;
            this.$router.set(url, { silent: true });
        }
        return url;
    };
    // error during view resolving
    JetApp.prototype._loadError = function (url, err) {
        this.error("app:error:resolve", [err, url]);
        return { template: " " };
    };
    JetApp.prototype.addSubView = function (obj, target, config) {
        var url = obj.$subview !== true ? obj.$subview : null;
        var name = obj.name || (url ? this.webix.uid() : "default");
        target.id = obj.id || "s" + this.webix.uid();
        var view = config[name] = { id: target.id, url: url };
        if (view.url instanceof JetBase) {
            view.view = view.url;
        }
        return target;
    };
    return JetApp;
}(JetBase));

var StoreRouter = /** @class */ (function () {
    function StoreRouter(cb, config) {
        this.name = (config.storeName || config.id + ":route");
        this.cb = cb;
    }
    StoreRouter.prototype.set = function (path, config) {
        var _this = this;
        webix.storage.session.put(this.name, path);
        if (!config || !config.silent) {
            setTimeout(function () { return _this.cb(path); }, 1);
        }
    };
    StoreRouter.prototype.get = function () {
        return webix.storage.session.get(this.name);
    };
    return StoreRouter;
}());
//# sourceMappingURL=StoreRouter.js.map

var UrlRouter = /** @class */ (function () {
    function UrlRouter(cb, config) {
        var _this = this;
        this.cb = cb;
        window.onpopstate = function () { return _this.cb(_this.get()); };
        this.prefix = config.routerPrefix || "";
    }
    UrlRouter.prototype.set = function (path, config) {
        var _this = this;
        if (this.get() !== path) {
            window.history.pushState(null, null, this.prefix + path);
        }
        if (!config || !config.silent) {
            setTimeout(function () { return _this.cb(path); }, 1);
        }
    };
    UrlRouter.prototype.get = function () {
        var path = window.location.pathname.replace(this.prefix, "");
        return path !== "/" ? path : "";
    };
    return UrlRouter;
}());
//# sourceMappingURL=UrlRouter.js.map

var EmptyRouter = /** @class */ (function () {
    function EmptyRouter(cb, _$config) {
        this.path = "";
        this.cb = cb;
    }
    EmptyRouter.prototype.set = function (path, config) {
        var _this = this;
        this.path = path;
        if (!config || !config.silent) {
            setTimeout(function () { return _this.cb(path); }, 1);
        }
    };
    EmptyRouter.prototype.get = function () {
        return this.path;
    };
    return EmptyRouter;
}());
//# sourceMappingURL=EmptyRouter.js.map

function UnloadGuard(app, view, config) {
    view.on(app, "app:guard", function (_$url, point, promise) {
        if (point === view || point.contains(view)) {
            var res_1 = config();
            if (res_1 === false) {
                promise.confirm = Promise.reject(res_1);
            }
            else {
                promise.confirm = promise.confirm.then(function () { return res_1; });
            }
        }
    });
}
//# sourceMappingURL=Guard.js.map

//     (c) 2012-2018 Airbnb, Inc.

// var has = require('has');
function has(store, key) {
  return Object.prototype.hasOwnProperty.call(store, key);
}
// var forEach = require('for-each');
function forEach(obj, handler, context) {
  for (var key in obj) {
    if (has(obj, key)) {
      handler.call((context || obj), obj[key], key, obj);
    }
  }
}
// var trim = require('string.prototype.trim');
function trim(str) {
  return str.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
}
// var warning = require('warning');
function warn(message) {
  message = 'Warning: ' + message;
  if (typeof console !== 'undefined') {
    console.error(message);
  }

  try { throw new Error(message); } catch (x) {}
}

var replace = String.prototype.replace;
var split = String.prototype.split;

// #### Pluralization methods
// The string that separates the different phrase possibilities.
var delimiter = '||||';

var russianPluralGroups = function (n) {
  var end = n % 10;
  if (n !== 11 && end === 1) {
    return 0;
  }
  if (2 <= end && end <= 4 && !(n >= 12 && n <= 14)) {
    return 1;
  }
  return 2;
};

// Mapping from pluralization group plural logic.
var pluralTypes = {
  arabic: function (n) {
    // http://www.arabeyes.org/Plural_Forms
    if (n < 3) { return n; }
    var lastTwo = n % 100;
    if (lastTwo >= 3 && lastTwo <= 10) return 3;
    return lastTwo >= 11 ? 4 : 5;
  },
  bosnian_serbian: russianPluralGroups,
  chinese: function () { return 0; },
  croatian: russianPluralGroups,
  french: function (n) { return n > 1 ? 1 : 0; },
  german: function (n) { return n !== 1 ? 1 : 0; },
  russian: russianPluralGroups,
  lithuanian: function (n) {
    if (n % 10 === 1 && n % 100 !== 11) { return 0; }
    return n % 10 >= 2 && n % 10 <= 9 && (n % 100 < 11 || n % 100 > 19) ? 1 : 2;
  },
  czech: function (n) {
    if (n === 1) { return 0; }
    return (n >= 2 && n <= 4) ? 1 : 2;
  },
  polish: function (n) {
    if (n === 1) { return 0; }
    var end = n % 10;
    return 2 <= end && end <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2;
  },
  icelandic: function (n) { return (n % 10 !== 1 || n % 100 === 11) ? 1 : 0; },
  slovenian: function (n) {
    var lastTwo = n % 100;
    if (lastTwo === 1) {
      return 0;
    }
    if (lastTwo === 2) {
      return 1;
    }
    if (lastTwo === 3 || lastTwo === 4) {
      return 2;
    }
    return 3;
  }
};


// Mapping from pluralization group to individual language codes/locales.
// Will look up based on exact match, if not found and it's a locale will parse the locale
// for language code, and if that does not exist will default to 'en'
var pluralTypeToLanguages = {
  arabic: ['ar'],
  bosnian_serbian: ['bs-Latn-BA', 'bs-Cyrl-BA', 'srl-RS', 'sr-RS'],
  chinese: ['id', 'id-ID', 'ja', 'ko', 'ko-KR', 'lo', 'ms', 'th', 'th-TH', 'zh'],
  croatian: ['hr', 'hr-HR'],
  german: ['fa', 'da', 'de', 'en', 'es', 'fi', 'el', 'he', 'hi-IN', 'hu', 'hu-HU', 'it', 'nl', 'no', 'pt', 'sv', 'tr'],
  french: ['fr', 'tl', 'pt-br'],
  russian: ['ru', 'ru-RU'],
  lithuanian: ['lt'],
  czech: ['cs', 'cs-CZ', 'sk'],
  polish: ['pl'],
  icelandic: ['is'],
  slovenian: ['sl-SL']
};

function langToTypeMap(mapping) {
  var ret = {};
  forEach(mapping, function (langs, type) {
    forEach(langs, function (lang) {
      ret[lang] = type;
    });
  });
  return ret;
}

function pluralTypeName(locale) {
  var langToPluralType = langToTypeMap(pluralTypeToLanguages);
  return langToPluralType[locale]
    || langToPluralType[split.call(locale, /-/, 1)[0]]
    || langToPluralType.en;
}

function pluralTypeIndex(locale, count) {
  return pluralTypes[pluralTypeName(locale)](count);
}

function escape(token) {
  return token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function constructTokenRegex(opts) {
  var prefix = (opts && opts.prefix) || '%{';
  var suffix = (opts && opts.suffix) || '}';

  if (prefix === delimiter || suffix === delimiter) {
    throw new RangeError('"' + delimiter + '" token is reserved for pluralization');
  }

  return new RegExp(escape(prefix) + '(.*?)' + escape(suffix), 'g');
}

var dollarRegex = /\$/g;
var dollarBillsYall = '$$';
var defaultTokenRegex = /%\{(.*?)\}/g;

// ### transformPhrase(phrase, substitutions, locale)
//
// Takes a phrase string and transforms it by choosing the correct
// plural form and interpolating it.
//
//     transformPhrase('Hello, %{name}!', {name: 'Spike'});
//     // "Hello, Spike!"
//
// The correct plural form is selected if substitutions.smart_count
// is set. You can pass in a number instead of an Object as `substitutions`
// as a shortcut for `smart_count`.
//
//     transformPhrase('%{smart_count} new messages |||| 1 new message', {smart_count: 1}, 'en');
//     // "1 new message"
//
//     transformPhrase('%{smart_count} new messages |||| 1 new message', {smart_count: 2}, 'en');
//     // "2 new messages"
//
//     transformPhrase('%{smart_count} new messages |||| 1 new message', 5, 'en');
//     // "5 new messages"
//
// You should pass in a third argument, the locale, to specify the correct plural type.
// It defaults to `'en'` with 2 plural forms.
function transformPhrase(phrase, substitutions, locale, tokenRegex) {
  if (typeof phrase !== 'string') {
    throw new TypeError('Polyglot.transformPhrase expects argument #1 to be string');
  }

  if (substitutions == null) {
    return phrase;
  }

  var result = phrase;
  var interpolationRegex = tokenRegex || defaultTokenRegex;

  // allow number as a pluralization shortcut
  var options = typeof substitutions === 'number' ? { smart_count: substitutions } : substitutions;

  // Select plural form: based on a phrase text that contains `n`
  // plural forms separated by `delimiter`, a `locale`, and a `substitutions.smart_count`,
  // choose the correct plural form. This is only done if `count` is set.
  if (options.smart_count != null && result) {
    var texts = split.call(result, delimiter);
    result = trim(texts[pluralTypeIndex(locale || 'en', options.smart_count)] || texts[0]);
  }

  // Interpolate: Creates a `RegExp` object for each interpolation placeholder.
  result = replace.call(result, interpolationRegex, function (expression, argument) {
    if (!has(options, argument) || options[argument] == null) { return expression; }
    // Ensure replacement value is escaped to prevent special $-prefixed regex replace tokens.
    return replace.call(options[argument], dollarRegex, dollarBillsYall);
  });

  return result;
}

// ### Polyglot class constructor
function Polyglot(options) {
  var opts = options || {};
  this.phrases = {};
  this.extend(opts.phrases || {});
  this.currentLocale = opts.locale || 'en';
  var allowMissing = opts.allowMissing ? transformPhrase : null;
  this.onMissingKey = typeof opts.onMissingKey === 'function' ? opts.onMissingKey : allowMissing;
  this.warn = opts.warn || warn;
  this.tokenRegex = constructTokenRegex(opts.interpolation);
}

// ### polyglot.locale([locale])
//
// Get or set locale. Internally, Polyglot only uses locale for pluralization.
Polyglot.prototype.locale = function (newLocale) {
  if (newLocale) this.currentLocale = newLocale;
  return this.currentLocale;
};

// ### polyglot.extend(phrases)
//
// Use `extend` to tell Polyglot how to translate a given key.
//
//     polyglot.extend({
//       "hello": "Hello",
//       "hello_name": "Hello, %{name}"
//     });
//
// The key can be any string.  Feel free to call `extend` multiple times;
// it will override any phrases with the same key, but leave existing phrases
// untouched.
//
// It is also possible to pass nested phrase objects, which get flattened
// into an object with the nested keys concatenated using dot notation.
//
//     polyglot.extend({
//       "nav": {
//         "hello": "Hello",
//         "hello_name": "Hello, %{name}",
//         "sidebar": {
//           "welcome": "Welcome"
//         }
//       }
//     });
//
//     console.log(polyglot.phrases);
//     // {
//     //   'nav.hello': 'Hello',
//     //   'nav.hello_name': 'Hello, %{name}',
//     //   'nav.sidebar.welcome': 'Welcome'
//     // }
//
// `extend` accepts an optional second argument, `prefix`, which can be used
// to prefix every key in the phrases object with some string, using dot
// notation.
//
//     polyglot.extend({
//       "hello": "Hello",
//       "hello_name": "Hello, %{name}"
//     }, "nav");
//
//     console.log(polyglot.phrases);
//     // {
//     //   'nav.hello': 'Hello',
//     //   'nav.hello_name': 'Hello, %{name}'
//     // }
//
// This feature is used internally to support nested phrase objects.
Polyglot.prototype.extend = function (morePhrases, prefix) {
  forEach(morePhrases, function (phrase, key) {
    var prefixedKey = prefix ? prefix + '.' + key : key;
    if (typeof phrase === 'object') {
      this.extend(phrase, prefixedKey);
    } else {
      this.phrases[prefixedKey] = phrase;
    }
  }, this);
};

// ### polyglot.unset(phrases)
// Use `unset` to selectively remove keys from a polyglot instance.
//
//     polyglot.unset("some_key");
//     polyglot.unset({
//       "hello": "Hello",
//       "hello_name": "Hello, %{name}"
//     });
//
// The unset method can take either a string (for the key), or an object hash with
// the keys that you would like to unset.
Polyglot.prototype.unset = function (morePhrases, prefix) {
  if (typeof morePhrases === 'string') {
    delete this.phrases[morePhrases];
  } else {
    forEach(morePhrases, function (phrase, key) {
      var prefixedKey = prefix ? prefix + '.' + key : key;
      if (typeof phrase === 'object') {
        this.unset(phrase, prefixedKey);
      } else {
        delete this.phrases[prefixedKey];
      }
    }, this);
  }
};

// ### polyglot.clear()
//
// Clears all phrases. Useful for special cases, such as freeing
// up memory if you have lots of phrases but no longer need to
// perform any translation. Also used internally by `replace`.
Polyglot.prototype.clear = function () {
  this.phrases = {};
};

// ### polyglot.replace(phrases)
//
// Completely replace the existing phrases with a new set of phrases.
// Normally, just use `extend` to add more phrases, but under certain
// circumstances, you may want to make sure no old phrases are lying around.
Polyglot.prototype.replace = function (newPhrases) {
  this.clear();
  this.extend(newPhrases);
};


// ### polyglot.t(key, options)
//
// The most-used method. Provide a key, and `t` will return the
// phrase.
//
//     polyglot.t("hello");
//     => "Hello"
//
// The phrase value is provided first by a call to `polyglot.extend()` or
// `polyglot.replace()`.
//
// Pass in an object as the second argument to perform interpolation.
//
//     polyglot.t("hello_name", {name: "Spike"});
//     => "Hello, Spike"
//
// If you like, you can provide a default value in case the phrase is missing.
// Use the special option key "_" to specify a default.
//
//     polyglot.t("i_like_to_write_in_language", {
//       _: "I like to write in %{language}.",
//       language: "JavaScript"
//     });
//     => "I like to write in JavaScript."
//
Polyglot.prototype.t = function (key, options) {
  var phrase, result;
  var opts = options == null ? {} : options;
  if (typeof this.phrases[key] === 'string') {
    phrase = this.phrases[key];
  } else if (typeof opts._ === 'string') {
    phrase = opts._;
  } else if (this.onMissingKey) {
    var onMissingKey = this.onMissingKey;
    result = onMissingKey(key, opts, this.currentLocale, this.tokenRegex);
  } else {
    this.warn('Missing translation for key: "' + key + '"');
    result = key;
  }
  if (typeof phrase === 'string') {
    result = transformPhrase(phrase, opts, this.currentLocale, this.tokenRegex);
  }
  return result;
};


// ### polyglot.has(key)
//
// Check if polyglot has a translation for given key
Polyglot.prototype.has = function (key) {
  return has(this.phrases, key);
};

// export transformPhrase
Polyglot.transformPhrase = function transform(phrase, substitutions, locale) {
  return transformPhrase(phrase, substitutions, locale);
};

var webixPolyglot = Polyglot;

function Locale(app, _view, config) {
    config = config || {};
    var storage = config.storage;
    var lang = storage ? (storage.get("lang") || "en") : (config.lang || "en");
    var service = {
        _: null,
        polyglot: null,
        getLang: function () { return lang; },
        setLang: function (name, silent) {
            var path = (config.path ? config.path + "/" : "") + name;
            var data = require("jet-locales/" + path);
            if (data.__esModule) {
                data = data.default;
            }
            var poly = service.polyglot = new webixPolyglot({ phrases: data });
            poly.locale(name);
            service._ = webix.bind(poly.t, poly);
            lang = name;
            if (storage) {
                storage.put("lang", lang);
            }
            if (!silent) {
                app.refresh();
            }
        }
    };
    app.setService("locale", service);
    service.setLang(lang, true);
}
//# sourceMappingURL=Locale.js.map

function show(view, config, value) {
    if (config.urls) {
        value = config.urls[value] || value;
    }
    view.show("./" + value);
}
function Menu(app, view, config) {
    var ui = view.$$(config.id || config);
    var silent = false;
    ui.attachEvent("onchange", function () {
        if (!silent) {
            show(view, config, this.getValue());
        }
    });
    ui.attachEvent("onafterselect", function () {
        if (!silent) {
            var id = null;
            if (ui.setValue) {
                id = this.getValue();
            }
            else if (ui.getSelectedId) {
                id = ui.getSelectedId();
            }
            show(view, config, id);
        }
    });
    view.on(app, "app:route", function (url) {
        var segment = url[view.getIndex()];
        if (segment) {
            silent = true;
            var page = segment.page;
            if (ui.setValue && ui.getValue() !== page) {
                ui.setValue(page);
            }
            else if (ui.select && ui.exists(page) && ui.getSelectedId() !== page) {
                ui.select(page);
            }
            silent = false;
        }
    });
}
//# sourceMappingURL=Menu.js.map

var baseicons = {
    good: "check",
    error: "warning",
    saving: "refresh fa-spin"
};
var basetext = {
    good: "Ok",
    error: "Error",
    saving: "Connecting..."
};
function Status(app, view, config) {
    var status = "good";
    var count = 0;
    var iserror = false;
    var expireDelay = config.expire;
    if (!expireDelay && expireDelay !== false) {
        expireDelay = 2000;
    }
    var texts = config.texts || basetext;
    var icons = config.icons || baseicons;
    if (typeof config === "string") {
        config = { target: config };
    }
    function refresh(content) {
        var area = view.$$(config.target);
        if (area) {
            if (!content) {
                content = "<div class='status_" +
                    status +
                    "'><span class='webix_icon fa-" +
                    icons[status] + "'></span> " + texts[status] + "</div>";
            }
            area.setHTML(content);
        }
    }
    function success() {
        count--;
        setStatus("good");
    }
    function fail(err) {
        count--;
        setStatus("error", err);
    }
    function start(promise) {
        count++;
        setStatus("saving");
        if (promise && promise.then) {
            promise.then(success, fail);
        }
    }
    function getStatus() {
        return status;
    }
    function hideStatus() {
        if (count === 0) {
            refresh(" ");
        }
    }
    function setStatus(mode, err) {
        if (count < 0) {
            count = 0;
        }
        if (mode === "saving") {
            status = "saving";
            refresh();
        }
        else {
            iserror = (mode === "error");
            if (count === 0) {
                status = iserror ? "error" : "good";
                if (iserror) {
                    app.error("app:error:server", [err.responseText || err]);
                }
                else {
                    if (expireDelay) {
                        setTimeout(hideStatus, expireDelay);
                    }
                }
                refresh();
            }
        }
    }
    function track(data) {
        var dp = webix.dp(data);
        if (dp) {
            view.on(dp, "onAfterDataSend", start);
            view.on(dp, "onAfterSaveError", function (_id, _obj, response) { return fail(response); });
            view.on(dp, "onAfterSave", success);
        }
    }
    app.setService("status", {
        getStatus: getStatus,
        setStatus: setStatus,
        track: track
    });
    if (config.remote) {
        view.on(webix, "onRemoteCall", start);
    }
    if (config.ajax) {
        view.on(webix, "onBeforeAjax", function (_mode, _url, _data, _request, _headers, _files, promise) {
            start(promise);
        });
    }
    if (config.data) {
        track(config.data);
    }
}
//# sourceMappingURL=Status.js.map

function Theme(app, _view, config) {
    config = config || {};
    var storage = config.storage;
    var theme = storage ?
        (storage.get("theme") || "flat-default")
        :
            (config.theme || "flat-default");
    var service = {
        getTheme: function () { return theme; },
        setTheme: function (name, silent) {
            var parts = name.split("-");
            var links = document.getElementsByTagName("link");
            for (var i = 0; i < links.length; i++) {
                var lname = links[i].getAttribute("title");
                if (lname) {
                    if (lname === name || lname === parts[0]) {
                        links[i].disabled = false;
                    }
                    else {
                        links[i].disabled = true;
                    }
                }
            }
            webix.skin.set(parts[0]);
            // remove old css
            webix.html.removeCss(document.body, "theme-" + theme);
            // add new css
            webix.html.addCss(document.body, "theme-" + name);
            theme = name;
            if (storage) {
                storage.put("theme", name);
            }
            if (!silent) {
                app.refresh();
            }
        }
    };
    app.setService("theme", service);
    service.setTheme(theme, true);
}
//# sourceMappingURL=Theme.js.map

function copyParams(view, url, route) {
    for (var i = 0; i < route.length; i++) {
        view.setParam(route[i], url[i + 1] ? url[i + 1].page : "");
    }
}
function UrlParam(app, view, config) {
    var route = config.route || config;
    view.on(app, "app:urlchange", function (subview, url) {
        if (view === subview) {
            copyParams(view, url, route);
            url.splice(1, route.length);
        }
    });
    view.on(app, "app:paramchange", function (subview, name, value, url) {
        if (view === subview && url) {
            for (var i = 0; i < route.length; i++) {
                if (route[i] === name) {
                    // changing in the url
                    view.show([i, value]);
                    return false;
                }
            }
        }
    });
    copyParams(view, view.getUrl(), route);
}
//# sourceMappingURL=UrlParam.js.map

function User(app, _view, config) {
    config = config || {};
    var login = config.login || "/login";
    var logout = config.logout || "/logout";
    var afterLogin = config.afterLogin || app.config.start;
    var afterLogout = config.afterLogout || "/login";
    var ping = config.ping || 5 * 60 * 1000;
    var model = config.model;
    var user = config.user;
    var service = {
        getUser: function () {
            return user;
        },
        getStatus: function (server) {
            if (!server) {
                return user !== null;
            }
            return model.status().catch(function () { return null; }).then(function (data) {
                user = data;
            });
        },
        login: function (name, pass) {
            return model.login(name, pass).then(function (data) {
                user = data;
                if (!data) {
                    throw new Error("Access denied");
                }
                app.callEvent("app:user:login", [user]);
                app.show(afterLogin);
            });
        },
        logout: function () {
            user = null;
            return model.logout().then(function (res) {
                app.callEvent("app:user:logout", []);
                return res;
            });
        }
    };
    function canNavigate(url, obj) {
        if (url === logout) {
            service.logout();
            obj.redirect = afterLogout;
        }
        else if (url !== login && !service.getStatus()) {
            obj.redirect = login;
        }
    }
    app.setService("user", service);
    app.attachEvent("app:guard", function (url, _$root, obj) {
        if (typeof user === "undefined") {
            obj.confirm = service.getStatus(true).then(function () { return canNavigate(url, obj); });
        }
        return canNavigate(url, obj);
    });
    if (ping) {
        setInterval(function () { return service.getStatus(true); }, ping);
    }
}
//# sourceMappingURL=User.js.map

/*
MIT License
Copyright (c) 2018 XB Software
*/
var plugins = {
    UnloadGuard: UnloadGuard, Locale: Locale, Menu: Menu, Theme: Theme, User: User, Status: Status, UrlParam: UrlParam
};
if (!window.Promise) {
    window.Promise = webix.promise;
}
//# sourceMappingURL=index.js.map

export { plugins, JetApp, JetView, HashRouter, StoreRouter, UrlRouter, EmptyRouter };
//# sourceMappingURL=jet.es6.js.map
