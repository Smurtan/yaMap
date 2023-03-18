let path = require('path');
//let myRules = require('./webpack.config.rules.js');
let UglifyJsPlugin = require('uglifyjs-webpack-plugin')
let HtmlPlugin = require('html-webpack-plugin');
//let {CleanWebpackPlugin} = require('clean-webpack-plugin');

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
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: "babel-loader"
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            },
            {
                test: /\.hbs/,
                use: "handlebars-loader"
            },
            {
                test: /\.(jpe?g|png|gif|svg|)$/i,
                use: 'file-loader?name=images/[hash].[ext]'
            },
            {
                test: /\.(eot|svg|ttf|woff|woff2)$/,
                use: 'file-loader?name=fonts/[hash].[ext]'
            }
        ]
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
        new HtmlPlugin({
            title: "Review Map",
            template: path.resolve("./index.hbs")
        })
    ],
    mode: process.env.NODE_ENV === "production" ? "production" : "development"
}
