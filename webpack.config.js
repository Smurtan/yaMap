let path = require('path');
let rules = require('./webpack.config.rules');
let HtmlPlugin = require('html-webpack-plugin');
let CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = {
    entry: {
        index: './src/index.js'
    },
    output: {
        filename: "[name].[hash].js",
        path: path.resolve('dist')
    },
    devServer: {
        index: "index.html",
        overlay: true
    },
    devtool: 'source-map',
    module: {
        rules
    },
    optimization: {

    },
    plugins: [
        new HtmlPlugin({
            title: "Review Map",
            template: "index.hbs"
        }),
        new CleanWebpackPlugin(['dist'])
    ],
    mode: process.env.NODE_ENV === "production" ? "production" : "development"
}
