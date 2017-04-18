var webpack = require('webpack');
var path = require('path');

module.exports = {
    // 入口文件，默认每一个页面的入口文件只有一个
    entry: {
        // 入口文件
        entry: './src/Hls.js'
    },
    // 打包后的js输出位置
    output: {
        path: __dirname + '//dist',
        filename: '[name].js'
    },
    module: {
        loaders: [{
            test: /\.js$/,
            loader: 'babel-loader',
            exclude: /node_modules/
        }]
    },
    plugins: [
        new webpack.BannerPlugin('This file is created by loliner.'),
        // 将 公用库 打包
        new webpack.optimize.CommonsChunkPlugin({
            name: 'vendor',
            filename: 'vendor.bundle.js'
        }),
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: '"production"'
                    // NODE_ENV: '"development"'
            }
        }),
        new webpack.LoaderOptionsPlugin({
            options: {
                babel: {
                    presets: ['es2015', 'stage-0','stage-1']
                }
            }
        })
    ],
    resolve: {
        alias: {
            // 路径别名
            // 'COMPONENTS': path.resolve(__dirname, './static/home/components'),
            // 'PAGEMODULE': path.resolve(__dirname, './static/home/pageModule'),
            // 'TOOLS': path.resolve(__dirname, './static/home/tools')
        }
    }
}
