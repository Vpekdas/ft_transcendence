import { defineConfig } from "vite";
import { microPlugin } from "./micro-plugin";
import fs from "fs";
import path from "path";

function fixSourceMaps() {
    let currentInterval = null;
    return {
        name: "fix-source-map",
        enforce: "post",
        transform: function (source) {
            if (currentInterval) {
                return;
            }
            currentInterval = setInterval(function () {
                const nodeModulesPath = path.join(__dirname, "node_modules", ".vite", "deps");
                if (fs.existsSync(nodeModulesPath)) {
                    clearInterval(currentInterval);
                    currentInterval = null;
                    const files = fs.readdirSync(nodeModulesPath);
                    files.forEach(function (file) {
                        const mapFile = file + ".map";
                        const mapPath = path.join(nodeModulesPath, mapFile);
                        if (fs.existsSync(mapPath)) {
                            let mapData = JSON.parse(fs.readFileSync(mapPath, "utf8"));
                            if (!mapData.sources || mapData.sources.length == 0) {
                                mapData.sources = [path.relative(mapPath, path.join(nodeModulesPath, file))];
                                fs.writeFileSync(mapPath, JSON.stringify(mapData), "utf8");
                            }
                        }
                    });
                }
            }, 100);
            return source;
        },
    };
}

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
        fixSourceMaps(),
    ],
});
