
const webpack = require('webpack');
const fs = require('fs');
const path = require('path');
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

const METADATA = fs.readFileSync("./plugin-description.txt").toString();

module.exports = {
    //mode: 'production',
    mode: 'development',
    entry: './ts/index.ts',
    target: 'node',
    output: {
        path: __dirname,
        filename: './js/plugins/LN_RoguelikeEngine.js'
    },
    resolve: {
        extensions: ['.ts', '.js'],
        
        plugins: [new TsconfigPathsPlugin( { configFile: 'tsconfig.json' } )]
        //roots: [ path.resolve(__dirname, '.') ]
        //alias: {
        //    "@rmmz": "./rmmz/index.d.ts",
        //}
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                loader: 'ts-loader'
            }
        ]
    },
    optimization: {
        minimizer: [
            new UglifyJsPlugin({
                uglifyOptions: {
                    output: {
                        beautify: false,
                        preamble: METADATA,
                    },
                },
            }),
        ],
    },
    plugins: [
        new webpack.BannerPlugin(
            {
                banner: METADATA,
                raw: true,
                entryOnly: true
            }
        )
    ]
}
