module.exports = {
	output: {
		webassemblyModuleFilename: "[hash].wasm",
		publicPath: "dist/"
	},
	module: {
		rules: [
			{
				test: /\.wasm$/,
				type: "webassembly/async"
			}
		]
	},
	optimization: {
		chunkIds: "deterministic" // To keep filename consistent between different modes (for example building only)
	},
	experiments: {
    topLevelAwait: true,
		asyncWebAssembly: true,
		importAwait: true
	}
};
