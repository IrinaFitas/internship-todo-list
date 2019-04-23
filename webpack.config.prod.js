let path = require("path");
let webpack = require('webpack');
let ExtractTextPlugin = require("extract-text-webpack-plugin");
let HtmlWebpackPlugin = require('html-webpack-plugin');
let CleanWebpackPlugin = require('clean-webpack-plugin');
let conf = {
	entry: "./src/js/index.js",
	output: {
		path: path.resolve(__dirname, "./dist"),
		filename: "./js/bundle.[hash:8].js"
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				loader: "babel-loader",
				exclude: path.join(__dirname, 'node_modules')
			},
			{
				test: /\.css$/,
				use: ExtractTextPlugin.extract({
					fallback: "style-loader",
					use: "css-loader"
				})
			}
		]
	},
	plugins: [
		new ExtractTextPlugin('styles.[hash:8].css'),
		new HtmlWebpackPlugin({
			template: './index.html',
			filename: './index.html',
		}),
		new CleanWebpackPlugin()
	]
};

module.exports = (env, options) => {
	let production = options.mode === "produnction";
	
	conf.devtool = production ? "source-map" : "eval-sourcemap";
	
	return conf;
};
