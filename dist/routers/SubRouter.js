var SubRouter = (function () {
    function SubRouter(cb, config) {
        this.path = "";
        this.parent = config.parentRouter;
        this.prefix = config.routerPrefix || "";
    }
    SubRouter.prototype.set = function (path, config) {
        //get path till current router
        //it depends on uniquiness of module name, which can't be guaranteed
        var fullpath = this.parent.get();
        var start = fullpath.indexOf(this.prefix);
        if (start != -1) {
            fullpath = fullpath.substr(0, start + this.prefix.length);
        }
        //remove module name from app's path
        this.path = path.replace(this.prefix, "");
        //set new full path to the parent router
        this.parent.set(fullpath + this.path, config);
    };
    SubRouter.prototype.get = function () {
        return this.path;
    };
    return SubRouter;
}());
export { SubRouter };
