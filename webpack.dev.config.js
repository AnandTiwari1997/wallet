const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const PROXY_CONFIG = require('./proxy.api');

const API_PORT = 8000;
const API_URL = 'localhost';

module.exports = {
    entry: ['./polyfill.js', './src/index.tsx'],
    resolve: {
        extensions: ['.js', '.ts', '.tsx'],
        fullySpecified: false,
        modules: [path.resolve(__dirname), 'node_modules'],
        preferRelative: true,
        roots: [path.resolve(__dirname, 'src')],
        alias: {
            'core-js/es6': 'core-js/es',
            'boxed-material-ui': path.resolve(__dirname, 'src/', 'boxed-material-ui/'),
            modules: path.resolve(__dirname, 'src/', 'modules/'),
            pages: path.resolve(__dirname, 'src/', 'pages/'),
            shared: path.resolve(__dirname, 'src/', 'shared/'),
            icons: path.resolve(__dirname, 'src/', 'icons/'),
            data: path.resolve(__dirname, 'src/', 'data/'),
            context: path.resolve(__dirname, 'src/', 'context/'),
            backend: path.resolve(__dirname, 'src/', 'backend/'),
            hooks: path.resolve(__dirname, 'src/', 'hooks/')
        }
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
            isDevelopmentMode: true,
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
    mode: 'development',
    output: {
        path: path.resolve(__dirname),
        publicPath: '/',
        filename: '[name]_bundle.[fullhash].js'
    },
    devServer: {
        hot: true,
        static: [
            {
                directory: path.resolve(__dirname, 'public'),
                publicPath: '/'
            }
        ],
        host: process.env.WEBPACK_HOST || 'localhost',
        port: process.env.WEBPACK_PORT || 8081,
        proxy: [
            {
                context: PROXY_CONFIG,
                target: process.env.BACKEND_HOST || `http://${API_URL}:${API_PORT}`,
                changeOrigin: true
            }
        ],
        historyApiFallback: true
    },
    devtool: 'eval-cheap-module-source-map'
};
