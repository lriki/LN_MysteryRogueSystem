
const webpack = require('webpack');
const fs = require('fs');
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");

const METADATA = fs.readFileSync("./plugin-description.txt").toString();

module.exports = {
    mode: 'production',
    //mode: 'development',
    entry: './ts/index.ts',
    output: {
        path: __dirname,
        filename: './js/plugins/LN_RoguelikeEngine.js'
    },
    resolve: {
        extensions: ['.ts', '.js']
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
