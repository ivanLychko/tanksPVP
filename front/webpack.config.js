const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

const port = process.env.PORT || 3000;

module.exports = (env, argv) => {

    return {
        mode: argv.mode ? argv.mode : 'development',
        devtool: 'eval-source-map',
        entry: './src/index.js',
        output: {
            filename: 'bundle.[hash].js'
        },
        devtool: 'inline-source-map',
        module: {
            rules: [
                {
                    test: /\.(js)$/,
                    exclude: /node_modules/,
                    use: ['babel-loader']
                },
                {
                    test: /\.s[ac]ss$/i,
                    use: [
                        "style-loader",
                        "css-loader",
                        "sass-loader",
                    ],
                },
                {
                    test: /\.css$/i,
                    use: ["style-loader", "css-loader"],
                },
                {
                    test: /\.(woff(2)?|ttf|eot)(\?v=\d+\.\d+\.\d+)?$/,
                    type: 'asset/resource',
                    generator: {
                        filename: 'fonts/[name][ext]',
                    }
                },
                {
                    test: /\.(jpe?g|png|gif|ico|svg)$/,
                    type: 'asset/resource',
                    generator: {
                        filename: 'img/[name][ext]',
                    }
                },
                {
                    test: /\.(pdf)$/,
                    type: 'asset/resource',
                    generator: {
                        filename: '[name][ext]',
                    }
                }
            ]
        },
        plugins: [
            new HtmlWebpackPlugin({
                template: 'public/index.html',
             //   favicon: 'public/favicon.png'
            }),
            new CopyPlugin({
                patterns: [
                    {
                        from: 'public/robots.txt',
                        to: 'robots.txt'
                    }
                ]
            })
        ],
        devServer: {
            historyApiFallback: true,
            port: port,
            hot: true
        },
    };
};