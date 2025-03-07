import { Component } from "../micro";

// https://codepen.io/DonKarlssonSan/pen/xQRjww?editors=0010

class Vector {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    // Setter to increase vector positions.
    addTo(vector) {
        this.x += vector.x;
        this.y += vector.y;
    }

    // Setter to decrease vector positions.
    subFrom(vector) {
        this.x -= vector.x;
        this.y -= vector.y;
    }

    // Setter to decrease vector positions.
    setLength(length) {
        const angle = this.getAngle();
        this.x = Math.cos(angle) * length;
        this.y = Math.sin(angle) * length;
    }

    // Getter that returns magnitude.
    getLength() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    // Getter that returns direction.
    getAngle() {
        return Math.atan2(this.y, this.x);
    }

    sub(vector) {
        return new Vector(this.x - vector.x, this.y - vector.y);
    }
}

class BlackHole {
    constructor(x, y) {
        this.pos = new Vector(x, y);
    }

    applyGravityOn(thing) {
        const dist = thing.pos.sub(this.pos);
        const length = dist.getLength();
        const g = 2000 / (length * length);

        dist.setLength(g);
        thing.vel.subFrom(dist);
    }
}

class Particle {
    constructor(x, y) {
        this.pos = new Vector(x, y);
        this.vel = new Vector(0, 0);
    }

    move() {
        if (this.vel.getLength() > 4) {
            this.vel.setLength(4);
        }
        this.pos.addTo(this.vel);
    }

    draw(ctx) {
        const r = this.pos.sub(new Vector(ctx.canvas.width / 2, ctx.canvas.height / 2)).getLength() / 60;
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, r, 0, Math.PI * 2);
        ctx.fill();
    }
}

export default class BlackHoleComponent extends Component {
    async init() {
        this.onready = () => {
            this.setupCanvas();
        };
    }

    setupCanvas() {
        const canvas = document.querySelector("#black-hole");
        const ctx = canvas.getContext("2d");

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        this.canvas = canvas;
        this.ctx = ctx;

        this.setupParticles();
        this.blackHole = new BlackHole(canvas.width / 2, canvas.height / 2);

        window.addEventListener("resize", this.resetCanvas.bind(this));
        this.resetCanvas();
        this.draw();
    }

    setupParticles() {
        this.particles = [];
        for (let i = 0; i < 42; i++) {
            const p = new Particle(Math.random() * this.canvas.width, Math.random() * this.canvas.height);
            this.particles.push(p);
        }
    }

    resetCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.blackHole.pos = new Vector(this.canvas.width / 2, this.canvas.height / 2);
    }

    draw() {
        requestAnimationFrame(this.draw.bind(this));
        // Clear the canvas
        this.ctx.fillStyle = "black";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw particle.
        this.ctx.fillStyle = "white";
        this.particles.forEach((p) => {
            this.blackHole.applyGravityOn(p);
            p.draw(this.ctx);
            p.move();
        });
        const newParticle = new Particle(
            this.random(-50, this.canvas.width + 50),
            this.random(-50, this.canvas.height + 50)
        );
        this.particles.push(newParticle);

        // Remove particles that are too close to the black hole.
        this.particles = this.particles.filter((p) => this.blackHole.pos.sub(p.pos).getLength() > 2);
    }

    random(min, max) {
        if (max === undefined) {
            max = min;
            min = 0;
        }
        return Math.floor(Math.random() * (max - min)) + min;
    }

    render() {
        return /* HTML */ `<canvas id="black-hole"></canvas> `;
    }
}
