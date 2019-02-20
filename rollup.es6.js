import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import typescript from 'rollup-plugin-typescript2';

module.exports = function(cli){
	const pkg = require("./package.json");
    const plugins = [
        resolve(),
        typescript({ useTsconfigDeclarationDir: true }),
        commonjs()
    ];

	return {
		treeshake:true,
		input: "sources/index.ts",
		plugins,
        output: [
            { file: pkg.module, format: 'es', sourcemap: true }
        ],
		watch:{
			include: "sources/**/*.ts"
        }
    };  
};