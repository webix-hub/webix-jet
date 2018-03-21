var StoreRouter = (function () {
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
export { StoreRouter };
