export function diff(oUrl, nUrl) {
    var i = 0;
    for (i; i < nUrl.length; i++) {
        var left = oUrl[i];
        var right = nUrl[i];
        if (!left) {
            break;
        }
        if (left.page !== right.page) {
            break;
        }
        for (var key in left.params) {
            if (left.params[key] !== right.params[key]) {
                break;
            }
        }
    }
    return i;
}
export function parse(url) {
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
export function url2str(stack) {
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
