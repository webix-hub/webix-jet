import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import typescript from 'rollup-plugin-typescript2';

module.exports = function(cli){
	const pkg = require("./package.json");
    const plugins = [
        typescript({
            tsconfigOverride:{
                compilerOptions:{
                    "target": "es5",
                    "lib": ["es2015", "dom"],
                    "declaration": false
                }
            }
        }),
        resolve(),
        commonjs()
    ];

	return {
		treeshake:true,
		input: "sources/index.ts",
		plugins,
        output: [
            { file: pkg.main, name: "webix.jet", format: 'umd', sourcemap: true }
        ],
		watch:{
			include: "sources/**/*.ts"
        }
    };  
};