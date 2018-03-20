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
export { EmptyRouter };
