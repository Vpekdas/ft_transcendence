import { defineConfig } from "vite";

export default defineConfig({
    base: "/",
    root: "src/",
    build: {
        minify: "terser",
    },
});
