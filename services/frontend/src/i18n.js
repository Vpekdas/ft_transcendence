 export function tr(str) {
    if (languageDb == undefined) {
        return str;
    }

    if (languageDb[str] != undefined) {
        return languageDb[str];
    }
    console.warn(`No translation for \`${str}\` in language \`${getLanguage()}\``);
    return str;
}

const defaultLanguage = "fr";

export function getLanguage() {
    if (localStorage.getItem("lang") == undefined) {
        setLanguage(defaultLanguage);
    }
    return localStorage.getItem("lang");
}

export async function setLanguage(l) {
    localStorage.setItem("lang", l);
    languageDb = await fetch(`/langs/${l}.json`).then((res) => res.json());
}

export var languageDb = undefined;

if (languageDb == undefined) {
    setTimeout(async () => {
        await setLanguage(getLanguage());
    }, 0);
}
