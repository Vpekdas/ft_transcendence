const forbiddenChar = /^[a-zA-Z0-9]+/;

export function isValidInput(input) {
    return forbiddenChar.test(input);
}
