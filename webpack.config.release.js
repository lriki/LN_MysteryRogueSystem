
const webpack = require('webpack');
const fs = require('fs');
const path = require('path');
//const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

const METADATA = fs.readFileSync("./plugin-description.txt").toString();

module.exports = {
    mode: 'production',
    entry: './ts/main.ts',
    target: 'node',
    output: {
        path: __dirname,
        filename: './js/plugins/LN_MysteryRogueSystem.js'
    },
    resolve: {
        extensions: ['.ts', '.js', ".tsx"],

        plugins: [new TsconfigPathsPlugin({ configFile: 'tsconfig.json' })]
        //roots: [ path.resolve(__dirname, '.') ]
        //alias: {
        //    "@rmmz": "./rmmz/index.d.ts",
        //}
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: 'ts-loader'
            },
            {
                test: /.(vert|frag)$/,
                use: 'raw-loader',
                //include: [path.resolve(__dirname, 'src')],
                exclude: /node_modules/
            }
        ]
    },
    // optimization: {
    //     minimizer: [
    //         new UglifyJsPlugin({
    //             uglifyOptions: {
    //                 output: {
    //                     beautify: false,
    //                     preamble: METADATA,
    //                 },
    //             },
    //         }),
    //     ],
    // },
    optimization: {
        minimizer: [new TerserPlugin({
            terserOptions: {
                format: {
                    preamble: METADATA,
                }
            },
            // extractComments: {
            //     condition: /^\**!|@preserve|@license|@cc_on/i,
            // }
            // extractComments: {
            //     banner: METADATA,
            // }
            // extractComments: false,
            // {
            //     terserOptions: {
            // }
        })],
    },
    // plugins: [
    //     new webpack.BannerPlugin(
    //         {
    //             banner: METADATA,
    //             raw: true,
    //             entryOnly: true
    //         }
    //     )
    // ]
}
