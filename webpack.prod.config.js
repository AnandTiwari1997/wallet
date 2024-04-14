const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: ['./polyfill.js', './src/index.tsx'],
    resolve: {
        extensions: ['.js', '.ts', '.tsx'],
        modules: [path.resolve(__dirname), 'node_modules'],
        preferRelative: true,
        alias: {
            'core-js/es6': 'core-js/es',
            modules: path.resolve(__dirname, 'modules/'),
            pages: path.resolve(__dirname, 'pages/')
        },
        roots: [path.resolve(__dirname, '/')]
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx|mjs|ts|tsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader'
                }
            },
            {
                test: /\.svg$/,
                issuer: /\.[jt]sx?$/,
                use: [{ loader: '@svgr/webpack', options: { typescript: true, icon: true } }]
            },
            {
                test: /\.css$/,
                use: [{ loader: 'style-loader' }, { loader: 'css-loader' }]
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './index.ejs',
            inject: false,
            favicon: './public/favicon.ico',
            isDevelopmentMode: false,
            minify: {
                collapseWhitespace: false,
                removeComments: false,
                minifyJS: true
            }
        })
    ],
    node: {
        global: true
    },

    // local to mode
    mode: 'production',
    output: {
        path: path.resolve(__dirname, 'dist'),
        publicPath: '/',
        filename: '[name]_bundle.[fullhash].js'
    },
    devtool: 'hidden-source-map'
};
