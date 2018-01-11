export function UnloadGuard(app, view, config) {
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
