import { noFloatingPromise } from "eslint-plugin-no-floating-promise";

export default [
    {
        plugins: {
            "no-floating-promise": noFloatingPromise,
        },
        rules: {
            "no-floating-promise/no-floating-promise": "warn",
        },
    },
];
