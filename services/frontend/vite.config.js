import { defineConfig } from "vite";
import { readFileSync, readdirSync, statSync } from "fs";

const microPlugin = () => {
    const registryVirtualModuleId = "./micro-registry";
    const registryResolvedVirtualModuleId = "\0" + registryVirtualModuleId;

    const microVirtualModuleId = "./micro";
    const microResolvedVirtualModuleId = "\0" + microVirtualModuleId;

    let components = [];

    function importAllComponents(currentFolder = __dirname + "/src", currentModuleFolder = ".") {
        for (let file of readdirSync(currentFolder)) {
            const stats = statSync(currentFolder + "/" + file);

            if (stats.isDirectory()) {
                importAllComponents(currentFolder + "/" + file, currentModuleFolder + "/" + file);
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
            } else {
                console.warn(path, " does not have any match for component");
            }
        }
    }

    importAllComponents();

    function generateRegistry() {
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

        resolveId(id) {
            if (id == microVirtualModuleId) {
                return microResolvedVirtualModuleId;
            }
        },

        load(id) {
            if (id == registryResolvedVirtualModuleId) {
                const source = generateRegistry();
                return source;
            } else if (id == microResolvedVirtualModuleId) {
                return readFileSync(__dirname + "/src/micro.js").toString();
            }

            if (id == "/app/src/main.js") {
                const originalSource = readFileSync("/app/src/main.js").toString();
                const injectedSource = originalSource + "\n" + generateRegistry();
                return injectedSource;
            }
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
