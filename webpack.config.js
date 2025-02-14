const path = require('path');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');

const common = {
    entry: './assets/scripts/index.js',
    resolve: {
        extensions: [".js", ".jsx", ".ts", ".tsx"],
        plugins: [
            new TsconfigPathsPlugin({
                configFile: path.resolve(__dirname, 'tsconfig.json')
            })
        ]
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
                test: /\.svg$/,
                oneOf: [
                    {
                        issuer: /\.(js|jsx|ts|tsx)$/,
                        use: ['@svgr/webpack'],
                    },
                    {
                        type: 'asset/resource',
                        generator: {
                            filename: 'assets/images/[hash][ext][query]'
                        }
                    }
                ]
            },
            {
                test: /\.(png|jpe?g|gif)$/i,
                type: 'asset/resource',
                generator: {
                    filename: 'assets/images/[hash][ext][query]'
                }
            },
            {
                test: /\.css$/i,
                use: [
                    // En dev : style-loader / En prod : MiniCssExtractPlugin.loader
                    process.env.NODE_ENV === 'production'
                        ? MiniCssExtractPlugin.loader
                        : 'style-loader',
                    'css-loader'
                ],
            },
            {
                test: /\.(js|jsx|ts|tsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            '@babel/preset-env',
                            '@babel/preset-react',
                            '@babel/preset-typescript'
                        ],
                        plugins: [
                            // Ajout de React Refresh uniquement en mode développement
                            process.env.NODE_ENV === 'development' && require.resolve('react-refresh/babel')
                        ].filter(Boolean),
                    }
                }
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
        new ESLintPlugin({
            extensions: ['js'],
            emitWarning: true,
            fix: true
        })
    ]
};

const development = {
    ...common,
    mode: 'development',
    output: {
        path: path.resolve(__dirname, 'static'),
        filename: 'assets/scripts/bundle.dev.js',
    },
    devtool: 'cheap-module-source-map',
    devServer: {
        hot: true,
        open: false,
        liveReload: false,
        static: path.resolve(__dirname, 'static'),
        port: 3000,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "X-Requested-With, Content-Type",
        },
    },
    plugins: [
        ...common.plugins,
        new BundleAnalyzerPlugin({
            analyzerPort: '8989',
            openAnalyzer: false
        }),
        new ReactRefreshWebpackPlugin(),
    ]
};

const production = {
    ...common,
    mode: 'production',
    output: {
        path: path.resolve(__dirname, 'static'),
        filename: 'assets/scripts/bundle.prod.js',
    },
    devtool: false,
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
        ...common.plugins,
        new MiniCssExtractPlugin({
            filename: 'assets/styles/[name].css',
            chunkFilename: '[id].css'
        })
    ]
};

module.exports = (env, argv) => {
    const mode = argv.mode || 'development';

    return mode === 'development' ? development : production;
};