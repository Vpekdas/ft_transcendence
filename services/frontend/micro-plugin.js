import { readdirSync, readFileSync, statSync, writeFileSync } from "fs";

function importAllComponents(currentFolder, currentModuleFolder = ".") {
    let components = [];

    for (let file of readdirSync(currentFolder)) {
        const stats = statSync(currentFolder + "/" + file);

        if (stats.isDirectory() && file != "node_modules") {
            components.push(...importAllComponents(currentFolder + "/" + file, currentModuleFolder + "/" + file));
            continue;
        } else if (!file.endsWith(".js")) {
            continue;
        }

        const path = currentFolder + "/" + file;

        // const regexAsync = /export\ default\ async\ function\ ([a-zA-Z0-9]+)\(/gm;
        const regexAsync =
            /export[\ \t\n]+default[\ \t\n]+class[\ \t\n]+([a-zA-Z][a-zA-Z0-9]*)[\ \t\n]+extends[\ \t\n]+Component/gm;
        const source = readFileSync(path).toString();
        const resultAsync = regexAsync.exec(source);

        if (resultAsync != null) {
            const name = resultAsync[1];
            const module = currentModuleFolder + "/" + file.substring(0, file.length - 3);
            components.push({
                name: name,
                modulePath: module,
            });
        }
    }

    return components;
}

function generateRegistrationCode(settings, rootDirectory) {
    let components = importAllComponents(__dirname + "/" + rootDirectory);

    let s = "";

    s += 'import { components } from "./micro";\n';

    for (const { name, modulePath } of components) {
        s += `import ${name} from "${modulePath}";\n`;
    }

    s += "\n";
    s += "export function registerAll() {\n";

    for (const { name } of components) {
        s += `    components.set("${name}", ${name});\n`;
    }

    s += "}\n";

    return s;
}

/**
 * @param {{ root: string, index: string }} settings
 * @returns
 */
export const microPlugin = (settings) => {
    return {
        name: "micro-plugin",

        /**
         * @param {string} html
         */
        transformIndexHtml(html) {
            writeFileSync(settings.root + "/micro.generated.js", generateRegistrationCode(settings, settings.root));

            let s = "";
            s += "<script type='module' src='" + settings.index.substring(1) + "' ></script>";
            s += "<div id='micro-app'></div>";

            return html.replace("%app%", s);
        },
    };
};
