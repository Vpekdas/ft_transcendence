import { defineConfig } from "vite";
import { microPlugin } from "./micro-plugin";

export default defineConfig({
    base: "/",
    root: "src/",
    build: {
        minify: "terser",
    },
    plugins: [
        microPlugin({
            root: "./src",
            index: "./main.js",
        }),
    ],
});
