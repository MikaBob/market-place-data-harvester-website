const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const dotenv = require('dotenv');

module.exports = () => {

    // Define environemnt variable from .env file
    const env = dotenv.config().parsed;

    // Parse all entry and merge them to one array
    const envKeys = Object.keys(env).reduce((prev, next) => {
        prev[`process.env.${next}`] = JSON.stringify(env[next]);
        return prev;
    }, {});

    return {
        entry: './src/index.js', // point de départ de react
        output: {
            path: path.join(__dirname, '/dist'), // sortie de la génération
            filename: 'index.min.js',
            publicPath: process.env.PUBLIC_URL || '/'
        },
        module: {
            rules: [
                {
                    test: /\.jsx?$/, // regex sur tout les fichiers .js ou .jsx
                    exclude: /node_modules/, // ne pas compiler les libs
                    use: {
                        loader: 'babel-loader', // babel loader compilera tout les fichiers en un seul
                    }
                },
                {
                    test: /\.css$/, // regex sur tout les fichiers .css
                    use: ['style-loader', 'css-loader'] // idem: compile tout les .css en un seul
                }
            ]
        },
        devServer: {
            historyApiFallback: true // permet de faire des refreshs et de taper une url à la main
        },
        plugins: [
            new HtmlWebpackPlugin({
                template: './src/index_template.html' // tempalte pour la génération du index.html final par webpack
            }),
            new webpack.DefinePlugin(envKeys)
        ]
    };
};