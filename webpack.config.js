let path = require('path');
let myRules = require('./webpack.config.rules.js')();
let UglifyJsPlugin = require('uglifyjs-webpack-plugin')
let HtmlWebpackPlugin = require('html-webpack-plugin');

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
        watchFiles: path.resolve(__dirname, 'src'),
        compress: true,
        port: 9000
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
