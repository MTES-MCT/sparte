const path = require("path");
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const TerserPlugin = require("terser-webpack-plugin");

const common = {
    entry: "./assets/scripts/index.js",
    output: {
        "path": path.resolve(__dirname, "static"),
        "filename": "bundle.js"
    },
    module: {
        rules: [
            {
                test: /\.css$/i,
                use: [
                    MiniCssExtractPlugin.loader,
                    "svg-loader",
                    "css-loader"
                ]
            }
        ]
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: "[name].css",
            chunkFilename: "[id].css"
        })
    ],
}

const development = {
    ...common,
    mode: "development",
    devtool: "cheap-source-map",
    plugins: [
        ...common.plugins,
        new BundleAnalyzerPlugin({
            analyzerPort: "8989"
        })
    ],
}

const production = {
    ...common,
    mode: "production",
    optimization: {
        minimize: true,
        minimizer: [new TerserPlugin({
            terserOptions: {
                format: {
                    comments: false,
                },
            },
            extractComments: false,
        })],
    },
    plugins: [
        ...common.plugins
    ],
}

module.exports = (env, argv) => {
    const mode = argv.mode || "development";

    switch (mode) {
        case "development":
            return development
        default:
            return production
    }
}
