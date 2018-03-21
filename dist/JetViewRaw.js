var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import { JetView } from "./JetView";
// wrapper for raw objects and Jet 1.x structs
var JetViewRaw = (function (_super) {
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
export { JetViewRaw };
