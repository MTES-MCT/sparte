const path = require('path');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');

const common = {
    entry: './assets/scripts/index.js',
    resolve: {
        extensions: [".js", ".jsx", ".ts", ".tsx"]
      },
    output: {
        'path': path.resolve(__dirname, 'static'),
        'filename': 'assets/scripts/bundle.js',
    },
    performance: {
        hints: false
    },
    module: {
        rules: [
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/i,
                type: 'asset/resource',
                generator: {
                    filename: 'assets/fonts/[hash][ext][query]'
                }
            },
            {
                'test': /\.(png|jpe?g|gif|svg)$/i,
                type: 'asset/resource',
                generator: {
                    filename: 'assets/images/[hash][ext][query]'
                }
            },
            {
                test: /\.css$/i,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader'
                ],
            },
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
                options: { presets: ['@babel/preset-env', '@babel/preset-react'] }
            },
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.json$/,
                type: 'json',
            },
            {
                test: /\.geojson$/,
                use: 'json-loader',
            },
        ]
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: 'assets/styles/[name].css',
            chunkFilename: '[id].css'
        }),
        new ESLintPlugin({
            extensions: ['js'],
            emitWarning: true,
            fix: true
        }),
    ]
}

const development = {
    ...common,
    mode: 'development',
    // devtool: 'cheap-source-map',
    plugins: [
        ...common.plugins,
        new BundleAnalyzerPlugin({
            analyzerPort: '8989',
            openAnalyzer: false
        })
    ]
}

const production = {
    ...common,
    mode: 'production',
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
    ]
}

module.exports = (env, argv) => {
    const mode = argv.mode || 'development';

    switch (mode) {
        case 'development':
            return development
        default:
            return production
    }
}
