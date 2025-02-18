const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: ['./src/index.tsx'],
    externals: {
        App: 'App'
    },
    resolve: {
        extensions: ['.js', '.ts', '.tsx'],
        modules: [path.resolve(__dirname), 'node_modules'],
        preferRelative: true,
        alias: {
            'core-js/es6': 'core-js/es',
            'boxed-material-ui': path.resolve(__dirname, 'src', 'boxed-material-ui'),
            modules: path.resolve(__dirname, 'src', 'modules'),
            pages: path.resolve(__dirname, 'src', 'pages'),
            shared: path.resolve(__dirname, 'src', 'shared'),
            icons: path.resolve(__dirname, 'src', 'icons'),
            data: path.resolve(__dirname, 'src', 'data'),
            context: path.resolve(__dirname, 'src', 'context'),
            backend: path.resolve(__dirname, 'src', 'backend'),
            hooks: path.resolve(__dirname, 'src', 'hooks')
        },
        roots: [path.resolve(__dirname, 'src')],
        fallback: {
            fs: false,
            os: false,
            path: false
        }
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx|mjs|ts|tsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        cacheDirectory: true,
                        cacheCompression: false,
                        envName: 'production',
                        presets: ['@babel/preset-env', '@babel/preset-react', '@babel/preset-typescript'],
                        plugins: [
                            '@babel/plugin-proposal-class-properties',
                            '@babel/plugin-proposal-export-default-from',
                            '@babel/plugin-proposal-export-namespace-from',
                            '@babel/plugin-proposal-function-sent',
                            '@babel/plugin-proposal-json-strings',
                            '@babel/plugin-proposal-numeric-separator',
                            '@babel/plugin-proposal-throw-expressions',
                            '@babel/plugin-syntax-dynamic-import',
                            '@babel/plugin-syntax-import-meta',
                            '@babel/plugin-proposal-optional-chaining',
                            '@babel/plugin-proposal-private-methods',
                            '@babel/plugin-proposal-private-property-in-object',
                            '@babel/plugin-transform-runtime'
                        ]
                    }
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
