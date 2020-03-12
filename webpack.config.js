
// 引入插件
const { resolve } = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const htmlwebpackplugin = new HtmlWebpackPlugin({
    template: './src/index.html',
    minify: {
        // 移除空格
        collapseWhitespace: true,
        // 移除注释
        removeComments: true
    }
});

// mini-css-extract-plugin 提取成单个css文件
// 引入插件
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const minicssextractplugin = new MiniCssExtractPlugin({
    filename: 'css/index.css'
})

// CSS兼容性处理  postcss-loader postcss-preset-env
// 设置nodejs环境变量
// process.env.NODE_ENV = 'development';

// css压缩 optimize-css-assets-webpack-plugin
const OptimizeCssAssetsWebpackPlugin = require('optimize-css-assets-webpack-plugin');
const optimizecssassetswebpackplugin = new OptimizeCssAssetsWebpackPlugin();

module.exports = {
    // 入口文件
    entry: './src/js/index.js',

    output: {
        filename: 'js/main.js',
        path: resolve(__dirname, 'dist')
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [
                    // style是将整合在js的css提取出来再append到style上
                    // { loader: 'style-loader' },
                    MiniCssExtractPlugin.loader,
                    // css-loader 是将css整合在js中
                    { loader: 'css-loader' },
                    /*
                        css兼容性处理：postcss --> postcss-loader postcss-preset-env

                        帮postcss找到package.json中browserslist里面的配置，通过配置加载指定的css兼容性样式

                        "browserslist": {
                        // 开发环境 --> 设置node环境变量：process.env.NODE_ENV = development
                        "development": [
                            "last 1 chrome version",
                            "last 1 firefox version",
                            "last 1 safari version"
                        ],
                        // 生产环境：默认是看生产环境
                        "production": [
                            ">0.2%",
                            "not dead",
                            "not op_mini all"
                        ]
                        }
                    */
                    {
                        loader: 'postcss-loader',
                        options: {
                            ident: 'postcss',
                            plugins: () => [
                                // postcss的插件
                                require('postcss-preset-env')()
                            ]
                        }

                    }
                ]
            },
            {
                test: /\.html?$/,
                use: [
                    { loader: 'html-loader' }
                ]
            }
        ]
    },
    plugins: [
        htmlwebpackplugin,
        // 分成单个文件
        minicssextractplugin,
        // 压缩css
        optimizecssassetswebpackplugin
    ],
    mode: 'production',
    devServer: {
        // 配置webpack-dev-sever
        host: 'localhost',
        // 压缩
        compress: true,
        // 端口
        port: 9000,
        // 是否自动打开
        open: true
    }
}