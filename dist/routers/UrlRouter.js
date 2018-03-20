var UrlRouter = /** @class */ (function () {
    function UrlRouter(cb, config) {
        var _this = this;
        this.cb = cb;
        window.onpopstate = function () { return _this.cb(_this.get()); };
        this.prefix = config.routerPrefix || "";
    }
    UrlRouter.prototype.set = function (path, config) {
        var _this = this;
        if (this.get() != path) {
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
export { UrlRouter };
