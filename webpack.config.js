const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MinifyPlugin = require("babel-minify-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");

const production = !!process.env.PRODUCTION;

module.exports = {
	devServer: !production && {
		contentBase: path.join(__dirname, 'dist'),
		compress: true,
		port: 8080
	},
	mode: production ? "production" : "development",
	entry: './src/index.tsx',
	plugins: [
		new CleanWebpackPlugin(),
		new HtmlWebpackPlugin({
			template: './src/index.html'
		}),
		new MinifyPlugin({
			"evaluate": false,
			"mangle": true
		}, {
			"comments": false
		}),
		new OptimizeCSSAssetsPlugin({}),
		new MiniCssExtractPlugin({}),
	],
	output: {
		filename: '[name].[contenthash].js',
		path: path.resolve(__dirname, 'dist'),
	},
	module: {
		rules: [
			{
				test: /\.s[ac]ss$/i,
				use: [
					// Creates `style` nodes from JS strings
					'style-loader',
					// Minifies CSS
					MiniCssExtractPlugin.loader,
					// Translates CSS into CommonJS
					'css-loader',
					// Compiles Sass to CSS
					'sass-loader',
				],
			},
			{
				test: /\.css$/i,
				use: [
					// Creates `style` nodes from JS strings
					'style-loader',
					// Minifies CSS
					MiniCssExtractPlugin.loader,
					// Translates CSS into CommonJS
					'css-loader',
				],
			},
			{
				test: /\.(png|jpe?g|gif)$/i,
				use: [
					{
						loader: 'file-loader',
					},
				],
			},
			// all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
			{ test: /\.tsx?$/, loader: "ts-loader" }
		],
	},
	resolve: {
		// Add `.ts` and `.tsx` as a resolvable extension.
		extensions: [".ts", ".tsx", ".js"],
		"alias": {
			"react": "preact/compat",
			"react-dom": "preact/compat"
		}
	},
	watch: !production,
	devtool: "source-map",
};