import { defineConfig } from "vite";
import { readFileSync, readdirSync, statSync, writeFileSync } from "fs";

const microPlugin = () => {
    function importAllComponents(currentFolder = __dirname + "/src", currentModuleFolder = ".") {
        let components = [];

        for (let file of readdirSync(currentFolder)) {
            const stats = statSync(currentFolder + "/" + file);

            if (stats.isDirectory()) {
                components.push(...importAllComponents(currentFolder + "/" + file, currentModuleFolder + "/" + file));
                continue;
            } else if (!file.endsWith(".js")) {
                continue;
            }

            const path = currentFolder + "/" + file;

            const regex = /export\ default\ class\ ([a-zA-Z0-9]+)\ extends\ Component/gm;
            const source = readFileSync(path).toString();
            const result = regex.exec(source);

            if (result != null) {
                const name = result[1];
                const module = currentModuleFolder + "/" + file.substring(0, file.length - 3);
                components.push({ name: name, modulePath: module });
            }
        }

        return components;
    }

    function generateRegistry() {
        let components = importAllComponents();

        let s = "";

        s += 'import { Component } from "./micro";\n';

        for (const { name, modulePath } of components) {
            s += `import ${name} from "${modulePath}";\n`;
        }

        s += "\n";
        s += "export function registerAll() {\n";

        for (const { name, modulePath } of components) {
            s += `    Component.registry.set("${name}", ${name});\n`;
        }

        s += "}\n";

        return s;
    }

    return {
        name: "micro-gen",

        resolveId(id) {},

        load(id) {
            // if (id == "/app/src/main.js") {
            //     const originalSource = readFileSync("/app/src/main.js").toString();
            //     const injectedSource = originalSource + "\n" + generateRegistry();
            //     return injectedSource;
            // }
        },

        /**
         * @param {string} html
         */
        transformIndexHtml(html) {
            writeFileSync("/app/src/micro.generated.js", generateRegistry());
            return html;
        },
    };
};

export default defineConfig({
    base: "/",
    root: "src/",
    build: {
        minify: "terser",
    },
    plugins: [microPlugin()],
});
