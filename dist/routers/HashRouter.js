import routie from "webix-routie/lib/routie";
var HashRouter = (function () {
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
export { HashRouter };
