export function tr(str) {
    if (languageDb == undefined) {
        return str;
    }

    if (languageDb[str] != undefined) {
        return languageDb[str];
    }
    if (localStorage.getItem("lang") != "en")
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

const availableLanguages = ["en", "fr", "tr"];

export async function setLanguage(l) {
    if (!availableLanguages.includes(l)) {
        l = "en";
    }
    localStorage.setItem("lang", l);
    await loadLang();
}

export var languageDb = undefined;

async function loadLang() {
    const l = localStorage.getItem("lang");
    if (l == undefined) {
        l = "en";
        localStorage.setItem("lang", l);
    }
    languageDb = await fetch(`/langs/${l}.json`).then((res) => res.json());
}

document.addEventListener("DOMContentLoaded", async () => {
    if (languageDb == undefined) await loadLang();
});
