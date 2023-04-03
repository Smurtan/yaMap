const path = require('path');
const myRules = require('./webpack.config.rules.js')();
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin');

const settingPath = path.resolve('./src', 'settings.json');
const proxy = {};

const settings = require(settingPath);
Object.assign(proxy, settings.proxy);

module.exports = {
    entry: {
        main: path.resolve('./src/index.js')
    },
    output: {
        filename: "[name].[hash].js",
        path: path.resolve(__dirname, './dist'),
        clean: true
    },
    devServer: {
        proxy,
        watchFiles: path.resolve(__dirname, './src'),
        compress: true,
        port: 8080
    },
    devtool: 'source-map',
    module: {
        rules: myRules
    },
    optimization: {
        minimizer: [
            new UglifyJsPlugin({
                cache: true,
                parallel: true,
                uglifyOptions: {
                    compress: false,
                    ecmaVersion: 6,
                    mangle: true
                },
                sourceMap: true
            })
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: "Review Map",
            template: path.resolve("./index.hbs")
        })
    ],
    mode: process.env.NODE_ENV === "production" ? "production" : "development"
}
