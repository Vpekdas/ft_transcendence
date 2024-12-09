import DOMPurify from "dompurify";

export function sanitizeInput(input) {
    return input === DOMPurify.sanitize(input);
}
