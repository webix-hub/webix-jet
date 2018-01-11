var UrlRouter = (function () {
    function UrlRouter(cb, config) {
        this.cb = cb;
        this.prefix = config.routerPrefix || "";
    }
    UrlRouter.prototype.set = function (path, config) {
        var _this = this;
        window.history.pushState(null, null, this.prefix + path);
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
