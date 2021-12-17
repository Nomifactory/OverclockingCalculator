import * as path from "path";
import { CleanWebpackPlugin } from "clean-webpack-plugin";
import HtmlWebpackPlugin from "html-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import CssMinimizerPlugin from "css-minimizer-webpack-plugin";
import TerserPlugin from "terser-webpack-plugin";
import ESLintPlugin from "eslint-webpack-plugin";

const cfg = {
	mode: process.env.NODE_ENV || "development",
	entry: "./src/index.tsx",
	plugins: [
		new CleanWebpackPlugin(),
		new HtmlWebpackPlugin({
			template: "./src/index.html",
		}),
		new MiniCssExtractPlugin({}),
		new ESLintPlugin(),
	],
	output: {
		filename: "[name].[contenthash].js",
		path: path.resolve(__dirname, "dist"),
	},
	module: {
		rules: [
			{
				test: /\.((sa|sc)ss)$/i,
				use: [
					MiniCssExtractPlugin.loader,
					{
						loader: "css-loader",
						options: {
							importLoaders: 2,
						},
					},
					"postcss-loader",
					"sass-loader",
				],
			},
			{
				test: /\.css$/i,
				use: [
					// Minifies CSS
					MiniCssExtractPlugin.loader,
					// Translates CSS into CommonJS
					"css-loader",
				],
			},
			{
				test: /\.(png|jpe?g|gif)$/i,
				use: [
					{
						loader: "file-loader",
					},
				],
			},
			{
				test: /\.tsx?$/,
				loader: "ts-loader",
			},
		],
	},
	resolve: {
		// Add `.ts` and `.tsx` as a resolvable extension.
		extensions: [".ts", ".tsx", ".js"],
		alias: {
			"react": "preact/compat",
			"react-dom": "preact/compat",
		},
	},
	devtool: "source-map",
	devServer: {
		static: path.join(__dirname, "dist"),
		compress: true,
		port: 8080,
	},
	optimization: {
		minimize: true,
		minimizer: [new TerserPlugin(), new CssMinimizerPlugin()],
	},
};

module.exports = cfg;
