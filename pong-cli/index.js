const readline = require("readline");

function clearScreen() {
    process.stdout.write("\x1b[2J");
}

function goto(x, y) {
    process.stdout.write(`\x1b[${y};${x}H`);
}

function print(txt) {
    process.stdout.write(txt);
}

const width = process.stdout.columns;
const height = process.stdout.rows;
const running = true;

// Setup key events
readline.emitKeypressEvents(process.stdin);

process.stdin.on("keypress", (chunk, key) => {
    if (!key) return;

    if (key.name == "escape") running = false;
});

/** @type Array<string> */
const buffer = new Array(width * height);

function clearBuffer() {
    for (let i = 0; i < width * height; i++) {
        buffer[i] = " ";
    }
}

function presentBuffer() {
    process.stdout.write(buffer.join(""));
}

while (running) {
    clearScreen();
    clearBuffer();

    buffer[20 + 5 * width] = "😀";

    presentBuffer();
}
