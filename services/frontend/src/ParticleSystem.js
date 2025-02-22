import * as THREE from "three";

// https://www.youtube.com/watch?v=h1UQdbuF204&t=543s
// https://www.youtube.com/watch?v=OFqENgtqRAY&t=0s

// Allow us to make a smooth transition by interpolating the next particle.
// For example, each particle will grow, change color, etc.
class LinearSpline {
    constructor(interpolator) {
        this.points = [];
        this.interpolator = interpolator;
    }

    addPoint(t, value) {
        this.points.push([t, value]);
    }

    get(t) {
        let p1 = 0;
        // Find the first key point where the time is greater than the given time t.
        for (let i = 0; i < this.points.length; i++) {
            if (t < this.points[i][0]) {
                p1 = i;
                break;
            }
        }

        const p2 = Math.min(this.points.length - 1, p1 + 1);

        const t1 = this.points[p1][0];
        const t2 = this.points[p2][0];

        const v1 = this.points[p1][1];
        const v2 = this.points[p2][1];

        // Normalize the time to get the lifecycle between 0 and 1.
        const tNorm = (t - t1) / (t2 - t1);

        return this.interpolator(tNorm, v1, v2);
    }
}

class ParticleSystem {
    constructor(params) {
        this.params = params;
        this.particles = [];
        this.geometry = new THREE.BufferGeometry();

        const { vertexShader, fragmentShader, texture } = this.params;

        this.material = new THREE.ShaderMaterial({
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            uniforms: {
                diffuseTexture: { value: new THREE.TextureLoader().load(texture) },
                pointMultiplier: { value: window.innerHeight / (2.0 * Math.tan((0.5 * 75.0 * Math.PI) / 180.0)) },
            },
            blending: THREE.AdditiveBlending,
            depthTest: true,
            depthWrite: false,
            transparent: true,
            vertexColors: true,
        });

        this.points = new THREE.Points(this.geometry, this.material);
        this.params.parent.add(this.points);

        // Particles start with being transparent, then opaque, then disappear.
        this.alphaSpline = new LinearSpline((t, a, b) => a + t * (b - a));
        this.alphaSpline.addPoint(0.0, 0.0);
        this.alphaSpline.addPoint(0.1, 1.0);
        this.alphaSpline.addPoint(0.6, 1.0);
        this.alphaSpline.addPoint(1.0, 0.0);

        // Particles start with being yellow then red.
        this.colorSpline = new LinearSpline((t, a, b) => a.clone().lerp(b, t));
        this.colorSpline.addPoint(0.0, new THREE.Color(0xffff80));
        this.colorSpline.addPoint(1.0, new THREE.Color(0xff8080));

        // Particles start with size 1, then grow, then decrease.
        this.sizeSpline = new LinearSpline((t, a, b) => a + t * (b - a));
        this.sizeSpline.addPoint(0.0, 1.0);
        this.sizeSpline.addPoint(0.5, 5.0);
        this.sizeSpline.addPoint(1.0, 1.0);

        this.updateGeometry();
    }

    createParticle(basePosition) {
        const life = (Math.random() * 0.75 + 0.25) * 5.0;

        return {
            position: basePosition
                .clone()
                .add(
                    new THREE.Vector3(
                        (Math.random() * 2 - 1) * 1.0,
                        (Math.random() * 2 - 1) * 1.0,
                        (Math.random() * 2 - 1) * 1.0
                    )
                ),
            size: (Math.random() * 0.5 + 0.5 / 3) * 1.0,
            color: new THREE.Color(),
            alpha: 1.0,
            life: life,
            maxLife: life,
            rotation: Math.random() * 2.0 * Math.PI * 2,
            // Modify as you wish the "direction" of particles.
            velocity: new THREE.Vector3(0, 0, 10),
        };
    }

    updateGeometry() {
        const positions = [];
        const sizes = [];
        const colors = [];
        const angles = [];

        for (let p of this.particles) {
            positions.push(p.position.x, p.position.y, p.position.z);
            colors.push(p.color.r, p.color.g, p.color.b, p.alpha);
            sizes.push(p.currentSize);
            angles.push(p.rotation);
        }

        this.geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
        this.geometry.setAttribute("size", new THREE.Float32BufferAttribute(sizes, 1));
        this.geometry.setAttribute("colour", new THREE.Float32BufferAttribute(colors, 4));
        this.geometry.setAttribute("angle", new THREE.Float32BufferAttribute(angles, 1));

        // Tells Three.js to re-upload the updated attributes to the GPU.
        this.geometry.attributes.position.needsUpdate = true;
        this.geometry.attributes.size.needsUpdate = true;
        this.geometry.attributes.colour.needsUpdate = true;
        this.geometry.attributes.angle.needsUpdate = true;
    }

    updateParticles(timeElapsed, basePosition) {
        for (let p of this.particles) {
            p.life -= timeElapsed;
        }

        // Remove particles that have reached their lifecycle.
        this.particles = this.particles.filter((p) => p.life > 0.0);

        for (let p of this.particles) {
            // Calculate the normalized lifecycle.
            const t = 1.0 - p.life / p.maxLife;

            p.rotation += timeElapsed * 0.5;
            p.alpha = this.alphaSpline.get(t);
            p.currentSize = p.size * this.sizeSpline.get(t);
            p.color.copy(this.colorSpline.get(t));

            p.position.add(p.velocity.clone().multiplyScalar(timeElapsed));
        }

        while (this.particles.length < 100) {
            this.particles.push(this.createParticle(basePosition));
        }

        this.updateGeometry();
    }

    step(timeElapsed, basePosition) {
        this.updateParticles(timeElapsed, basePosition);
    }
}

export { ParticleSystem };
