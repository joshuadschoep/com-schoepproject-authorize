import path from "path";
import TerserPlugin from "terser-webpack-plugin";
import { Configuration } from "webpack";
import ZipPlugin from "zip-webpack-plugin";

const config: Configuration = {
    entry: path.join(__dirname, "/src/index.ts"),
    mode: "production",
    output: {
        path: path.resolve(__dirname, "build"),
        filename: "index.js",
        libraryTarget: "commonjs",
    },
    target: "node",
    resolve: {
        extensions: [".js", ".ts"],
    },
    externals: ["aws-sdk"],
    module: {
        rules: [
            {
                test: /\.(t|j)sx?$/,
                exclude: /node_modules/,
                use: "babel-loader",
            },
        ],
    },
    plugins: [
        new ZipPlugin({
            filename: "build.zip"
        })
    ],
    optimization: {
        minimize: true,
        minimizer: [
            new TerserPlugin({
                extractComments: false,
                terserOptions: {
                    format: {
                        comments: false,
                    },
                },
            }),
        ],
    },
};

export default config;
