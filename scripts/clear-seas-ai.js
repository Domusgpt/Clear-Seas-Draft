class OrbitalField {
    constructor(canvas) {
        this.canvas = canvas;
        this.context = canvas.getContext('2d');
        this.particles = [];
        this.active = false;
        this.raf = null;
        this.dpr = window.devicePixelRatio || 1;
        this.lastTime = performance.now();
        this.intensity = 1;

        this.handleResize = this.handleResize.bind(this);
        this.animate = this.animate.bind(this);

        this.handleResize();
        window.addEventListener('resize', this.handleResize, { passive: true });
        this.drawStatic();
    }

    handleResize() {
        const rect = this.canvas.getBoundingClientRect();
        this.width = rect.width || window.innerWidth;
        this.height = rect.height || window.innerHeight;
        this.centerX = this.width / 2;
        this.centerY = this.height / 2;
        this.dpr = window.devicePixelRatio || 1;

        this.canvas.width = Math.round(this.width * this.dpr);
        this.canvas.height = Math.round(this.height * this.dpr);
        this.context.setTransform(1, 0, 0, 1, 0, 0);
        this.context.scale(this.dpr, this.dpr);
        this.setupParticles();
        if (!this.active) {
            this.drawStatic();
        }
    }

    setupParticles() {
        const base = Math.min(this.width, this.height) || 1;
        const count = Math.max(18, Math.floor(base / 14));
        this.particles = Array.from({ length: count }, () => ({
            angle: Math.random() * Math.PI * 2,
            orbit: (Math.random() * 0.5 + 0.25) * base * 0.5,
            speed: (Math.random() * 0.0007 + 0.00025) * (Math.random() > 0.5 ? 1 : -1),
            size: Math.random() * 2.4 + 0.6,
            opacity: Math.random() * 0.45 + 0.35,
            flatten: Math.random() * 0.45 + 0.55
        }));
    }

    start() {
        if (this.active) {
            return;
        }
        this.active = true;
        this.lastTime = performance.now();
        this.raf = requestAnimationFrame(this.animate);
    }

    stop() {
        this.active = false;
        if (this.raf) {
            cancelAnimationFrame(this.raf);
            this.raf = null;
        }
    }

    drawStatic() {
        this.renderFrame(16, false);
    }

    animate(now) {
        if (!this.active) {
            return;
        }
        const delta = now - this.lastTime;
        this.lastTime = now;
        this.renderFrame(delta, true);
        this.raf = requestAnimationFrame(this.animate);
    }

    renderFrame(delta, updateParticles) {
        const ctx = this.context;
        ctx.clearRect(0, 0, this.width, this.height);

        const strength = Math.max(this.intensity, 0.25);
        const nearStop = Math.min(0.55, 0.18 * strength);
        const midStop = Math.min(0.42, 0.14 * strength);
        const farStop = Math.min(0.26, 0.1 * strength);
        const glow = ctx.createRadialGradient(
            this.centerX,
            this.centerY,
            Math.min(this.width, this.height) * 0.1,
            this.centerX,
            this.centerY,
            Math.max(this.width, this.height) * 0.8
        );
        glow.addColorStop(0, `rgba(72, 198, 255, ${nearStop.toFixed(3)})`);
        glow.addColorStop(0.6, `rgba(22, 34, 76, ${midStop.toFixed(3)})`);
        glow.addColorStop(1, `rgba(4, 6, 20, ${Math.max(0, farStop - 0.02).toFixed(3)})`);
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, this.width, this.height);

        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        const positions = [];

        this.particles.forEach((particle) => {
            if (updateParticles) {
                particle.angle += particle.speed * delta;
            }

            const x = this.centerX + Math.cos(particle.angle) * particle.orbit;
            const y = this.centerY + Math.sin(particle.angle) * particle.orbit * particle.flatten;

            positions.push({ x, y });

            const particleAlpha = Math.min(1, particle.opacity * (0.6 + strength * 0.6));
            ctx.globalAlpha = particleAlpha;
            ctx.beginPath();
            ctx.fillStyle = 'rgba(148, 232, 255, 1)';
            ctx.arc(x, y, particle.size, 0, Math.PI * 2);
            ctx.fill();
        });

        ctx.globalAlpha = 1;
        ctx.lineWidth = 0.8 + strength * 0.4;

        for (let i = 0; i < positions.length; i += 1) {
            const source = positions[i];
            for (let j = i + 1; j < positions.length; j += 1) {
                const target = positions[j];
                const dx = source.x - target.x;
                const dy = source.y - target.y;
                const distance = Math.hypot(dx, dy);
                if (distance > 180) {
                    continue;
                }
                const alpha = Math.max(0, (0.18 + strength * 0.12) - distance / 900);
                if (alpha <= 0) {
                    continue;
                }
                ctx.globalAlpha = alpha;
                ctx.strokeStyle = 'rgba(120, 214, 255, 1)';
                ctx.beginPath();
                ctx.moveTo(source.x, source.y);
                ctx.lineTo(target.x, target.y);
                ctx.stroke();
            }
        }

        ctx.restore();
    }

    setIntensity(value) {
        this.intensity = Math.min(Math.max(value, 0.2), 2.4);
        if (!this.active) {
            this.drawStatic();
        }
    }
}

class ReactiveHologramField {
    static create(canvas) {
        try {
            return new ReactiveHologramField(canvas);
        } catch (error) {
            console.warn('Falling back to orbital field:', error);
            return null;
        }
    }

    constructor(canvas) {
        this.canvas = canvas;
        this.gl = canvas.getContext('webgl', { alpha: true, antialias: true, premultipliedAlpha: false });
        if (!this.gl) {
            throw new Error('WebGL not supported');
        }

        this.dpr = window.devicePixelRatio || 1;
        this.width = 0;
        this.height = 0;
        this.time = 0;
        this.modeMix = 0;
        this.targetMode = 0;
        this.pointer = { x: 0.5, y: 0.5 };
        this.focus = { x: 0.5, y: 0.5 };
        this.targetFocus = { x: 0.5, y: 0.5 };
        this.focusStrength = 0.6;
        this.targetStrength = 0.65;
        this.transition = 1;
        this.active = false;
        this.raf = null;
        this.lastTime = performance.now();

        this.handleResize = this.handleResize.bind(this);
        this.render = this.render.bind(this);

        this.setupShaders();
        this.setupGeometry();
        this.handleResize();
        window.addEventListener('resize', this.handleResize, { passive: true });

        this.drawStatic();
    }

    setupShaders() {
        const vertexSource = `
            attribute vec2 a_position;
            varying vec2 v_uv;
            void main() {
                v_uv = a_position * 0.5 + 0.5;
                gl_Position = vec4(a_position, 0.0, 1.0);
            }
        `;

        const fragmentSource = `
            precision mediump float;
            varying vec2 v_uv;

            uniform vec2 u_resolution;
            uniform float u_time;
            uniform vec2 u_pointer;
            uniform vec2 u_focus;
            uniform float u_mode;
            uniform float u_transition;
            uniform float u_focusStrength;

            float hash(vec2 p) {
                return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
            }

            float noise(vec2 p) {
                vec2 i = floor(p);
                vec2 f = fract(p);
                float a = hash(i);
                float b = hash(i + vec2(1.0, 0.0));
                float c = hash(i + vec2(0.0, 1.0));
                float d = hash(i + vec2(1.0, 1.0));
                vec2 u = f * f * (3.0 - 2.0 * f);
                return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
            }

            vec3 quantumField(vec2 uv, float time) {
                vec2 q = uv;
                float grid = abs(sin(q.x * 18.0 + time * 0.8) * cos(q.y * 18.0 - time * 0.6));
                float lattice = sin((q.x + q.y) * 8.0 - time * 0.9) * 0.5 + 0.5;
                float arc = sin(length(q * 1.6) * 8.0 - time * 0.7);
                vec3 base = vec3(0.05, 0.0, 0.15);
                vec3 accent = vec3(0.4, 0.18, 0.75);
                vec3 highlight = vec3(0.18, 0.6, 0.95);
                vec3 color = base + accent * grid * 0.6 + highlight * lattice * 0.4;
                color += vec3(0.35, 0.1, 0.6) * smoothstep(0.1, 0.9, arc);
                return color;
            }

            vec3 hologramField(vec2 uv, float time) {
                vec2 h = uv;
                float waves = sin(h.x * 14.0 + time * 0.5) * 0.5 + 0.5;
                float rings = sin(length(h * vec2(1.0, 1.4)) * 8.0 + time) * 0.5 + 0.5;
                float shimmer = noise(h * 4.0 + time * 0.6);
                vec3 base = vec3(0.04, 0.08, 0.18);
                vec3 neon = vec3(0.65, 0.35, 0.85);
                vec3 cyan = vec3(0.2, 0.75, 0.9);
                vec3 color = base + neon * waves * 0.45 + cyan * rings * 0.5;
                color += vec3(0.55, 0.4, 0.95) * shimmer * 0.35;
                return color;
            }

            vec3 activeField(vec2 uv, float time) {
                vec2 a = uv;
                float lattice = abs(sin(a.x * 20.0 + time * 1.2) * cos(a.y * 22.0 - time * 1.0));
                float diagonal = abs(sin((a.x - a.y) * 16.0 + time * 0.8));
                float pulses = sin(length(a * vec2(1.3, 0.9)) * 12.0 - time * 1.4) * 0.5 + 0.5;
                float wave = sin((a.x + a.y + time * 0.6) * 10.0) * 0.5 + 0.5;
                float sparks = noise(a * 5.5 + time * 0.8);
                vec3 base = vec3(0.02, 0.14, 0.12);
                vec3 neon = vec3(0.18, 0.92, 0.55);
                vec3 magenta = vec3(0.74, 0.28, 0.86);
                vec3 amber = vec3(0.95, 0.65, 0.28);
                vec3 color = base;
                color += neon * lattice * 0.55;
                color += magenta * diagonal * 0.35;
                color += amber * pulses * 0.28;
                color += vec3(0.32, 0.78, 0.95) * sparks * 0.25;
                color += vec3(0.22, 0.44, 0.72) * wave * 0.22;
                return color;
            }

            void main() {
                vec2 uv = v_uv;
                vec2 pointer = vec2(u_pointer.x, 1.0 - u_pointer.y);
                vec2 focusPoint = vec2(u_focus.x, 1.0 - u_focus.y);

                vec2 centered = uv - 0.5;
                centered.x *= u_resolution.x / u_resolution.y;

                vec3 qColor = quantumField(centered, u_time);
                vec3 hColor = hologramField(centered, u_time);
                vec3 aColor = activeField(centered, u_time);
                float mode = clamp(u_mode, 0.0, 2.0);
                float hologramMix = smoothstep(0.0, 1.0, mode);
                float activeMix = smoothstep(1.0, 2.0, mode);
                vec3 baseColor = mix(qColor, hColor, hologramMix);
                baseColor = mix(baseColor, aColor, activeMix);

                float pointerField = exp(-length(uv - pointer) * 7.5);
                float focusField = exp(-length(uv - focusPoint) * 6.0) * (0.6 + u_focusStrength);
                float interference = sin((uv.x + uv.y + u_time * 0.25) * 12.0) * 0.5 + 0.5;

                vec3 pointerQuantum = vec3(0.1, 0.35, 0.6);
                vec3 pointerHologram = vec3(0.8, 0.3, 0.9);
                vec3 pointerActive = vec3(0.25, 0.95, 0.58);
                vec3 pointerGlow = mix(pointerQuantum, pointerHologram, hologramMix);
                pointerGlow = mix(pointerGlow, pointerActive, activeMix);

                vec3 focusQuantum = vec3(0.35, 0.65, 0.95);
                vec3 focusHologram = vec3(0.55, 0.4, 0.95);
                vec3 focusActive = vec3(0.32, 0.95, 0.65);
                vec3 focusGlow = mix(focusQuantum, focusHologram, hologramMix);
                focusGlow = mix(focusGlow, focusActive, activeMix);

                vec3 color = baseColor;
                color += pointerGlow * pointerField * 0.6;
                color += focusGlow * focusField * (0.45 + 0.35 * hologramMix + 0.4 * activeMix);
                color += vec3(0.2, 0.3, 0.6) * interference * 0.15;

                float alphaBase = 0.32 + pointerField * 0.42 + focusField * (0.34 + 0.18 * activeMix);
                float alpha = clamp(alphaBase, 0.0, 0.94);
                gl_FragColor = vec4(color, alpha) * u_transition;
            }
        `;

        const gl = this.gl;
        this.vertexShader = this.compileShader(vertexSource, gl.VERTEX_SHADER);
        this.fragmentShader = this.compileShader(fragmentSource, gl.FRAGMENT_SHADER);
        this.program = this.linkProgram(this.vertexShader, this.fragmentShader);
        gl.useProgram(this.program);

        this.attribLocation = gl.getAttribLocation(this.program, 'a_position');
        this.uniforms = {
            resolution: gl.getUniformLocation(this.program, 'u_resolution'),
            time: gl.getUniformLocation(this.program, 'u_time'),
            pointer: gl.getUniformLocation(this.program, 'u_pointer'),
            focus: gl.getUniformLocation(this.program, 'u_focus'),
            mode: gl.getUniformLocation(this.program, 'u_mode'),
            transition: gl.getUniformLocation(this.program, 'u_transition'),
            focusStrength: gl.getUniformLocation(this.program, 'u_focusStrength')
        };

        gl.disable(gl.DEPTH_TEST);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    }

    setupGeometry() {
        const gl = this.gl;
        this.buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            -1, -1,
            1, -1,
            -1, 1,
            1, 1
        ]), gl.STATIC_DRAW);
    }

    compileShader(source, type) {
        const gl = this.gl;
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            const info = gl.getShaderInfoLog(shader);
            gl.deleteShader(shader);
            throw new Error(`Shader compile error: ${info}`);
        }
        return shader;
    }

    linkProgram(vertexShader, fragmentShader) {
        const gl = this.gl;
        const program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            const info = gl.getProgramInfoLog(program);
            gl.deleteProgram(program);
            throw new Error(`Program link error: ${info}`);
        }
        return program;
    }

    handleResize() {
        const rect = this.canvas.getBoundingClientRect();
        this.dpr = window.devicePixelRatio || 1;
        this.width = Math.max(1, Math.round(rect.width * this.dpr));
        this.height = Math.max(1, Math.round(rect.height * this.dpr));
        if (this.canvas.width !== this.width || this.canvas.height !== this.height) {
            this.canvas.width = this.width;
            this.canvas.height = this.height;
        }
    }

    start() {
        if (this.active) {
            return;
        }
        this.active = true;
        this.lastTime = performance.now();
        this.raf = requestAnimationFrame(this.render);
    }

    stop() {
        this.active = false;
        if (this.raf) {
            cancelAnimationFrame(this.raf);
            this.raf = null;
        }
    }

    drawStatic() {
        this.renderFrame(0, true);
    }

    setMode(mode) {
        const normalized = typeof mode === 'string' ? mode.toLowerCase().trim() : '';
        if (normalized.startsWith('active')) {
            this.targetMode = 2;
        } else if (normalized.startsWith('holo')) {
            this.targetMode = 1;
        } else {
            this.targetMode = 0;
        }
    }

    setPointer(x, y) {
        this.pointer.x = Math.min(Math.max(x, 0), 1);
        this.pointer.y = Math.min(Math.max(y, 0), 1);
    }

    setFocus(x, y, strength = 0.65) {
        this.targetFocus.x = Math.min(Math.max(x, 0), 1);
        this.targetFocus.y = Math.min(Math.max(y, 0), 1);
        this.targetStrength = Math.min(Math.max(strength, 0), 1.4);
    }

    render(now) {
        if (!this.active) {
            return;
        }
        const delta = Math.max(0, now - this.lastTime);
        this.lastTime = now;
        this.renderFrame(delta / 1000, false);
        this.raf = requestAnimationFrame(this.render);
    }

    renderFrame(delta, force) {
        this.time += delta;
        if (force) {
            this.time = performance.now() * 0.001;
        }

        this.modeMix += (this.targetMode - this.modeMix) * 0.045;
        this.focus.x += (this.targetFocus.x - this.focus.x) * 0.08;
        this.focus.y += (this.targetFocus.y - this.focus.y) * 0.08;
        this.focusStrength += (this.targetStrength - this.focusStrength) * 0.06;

        const gl = this.gl;
        gl.viewport(0, 0, this.width, this.height);
        gl.useProgram(this.program);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        gl.enableVertexAttribArray(this.attribLocation);
        gl.vertexAttribPointer(this.attribLocation, 2, gl.FLOAT, false, 0, 0);

        gl.uniform2f(this.uniforms.resolution, this.width, this.height);
        gl.uniform1f(this.uniforms.time, this.time);
        gl.uniform2f(this.uniforms.pointer, this.pointer.x, this.pointer.y);
        gl.uniform2f(this.uniforms.focus, this.focus.x, this.focus.y);
        gl.uniform1f(this.uniforms.mode, this.modeMix);
        gl.uniform1f(this.uniforms.transition, this.transition);
        gl.uniform1f(this.uniforms.focusStrength, this.focusStrength);

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
}

class BackgroundFieldController {
    static clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }

    static themePalettes = {
        default: {
            accent: 'rgba(118, 198, 255, 0.36)',
            aux: 'rgba(151, 112, 255, 0.24)',
            angle: '168deg',
            rotate: [4, 12],
            saturate: [14, 28],
            brightness: [6, 16],
            spark: [1, 1.2]
        },
        pulse: {
            accent: 'rgba(118, 198, 255, 0.44)',
            aux: 'rgba(100, 255, 208, 0.28)',
            angle: '144deg',
            rotate: [8, 18],
            saturate: [18, 42],
            brightness: [8, 20],
            spark: [1.08, 1.32]
        },
        cascade: {
            accent: 'rgba(255, 140, 234, 0.46)',
            aux: 'rgba(172, 104, 255, 0.34)',
            angle: '188deg',
            rotate: [12, 26],
            saturate: [22, 48],
            brightness: [10, 24],
            spark: [1.12, 1.28]
        },
        sync: {
            accent: 'rgba(122, 255, 214, 0.44)',
            aux: 'rgba(120, 210, 255, 0.3)',
            angle: '126deg',
            rotate: [4, 14],
            saturate: [16, 40],
            brightness: [6, 18],
            spark: [1.06, 1.24]
        },
        merge: {
            accent: 'rgba(186, 140, 255, 0.46)',
            aux: 'rgba(118, 210, 255, 0.28)',
            angle: '202deg',
            rotate: [10, 22],
            saturate: [20, 44],
            brightness: [8, 20],
            spark: [1.08, 1.26]
        },
        before: {
            accent: 'rgba(142, 210, 255, 0.4)',
            aux: 'rgba(90, 155, 255, 0.28)',
            angle: '158deg',
            rotate: [6, 16],
            saturate: [18, 36],
            brightness: [8, 18],
            spark: [1.05, 1.2]
        },
        after: {
            accent: 'rgba(255, 190, 128, 0.44)',
            aux: 'rgba(255, 116, 182, 0.26)',
            angle: '212deg',
            rotate: [4, 14],
            saturate: [14, 32],
            brightness: [10, 24],
            spark: [1.04, 1.22]
        },
        chorus: {
            accent: 'rgba(255, 112, 210, 0.46)',
            aux: 'rgba(134, 180, 255, 0.3)',
            angle: '198deg',
            rotate: [14, 28],
            saturate: [26, 54],
            brightness: [12, 26],
            spark: [1.12, 1.34]
        },
        echo: {
            accent: 'rgba(134, 198, 255, 0.42)',
            aux: 'rgba(90, 116, 255, 0.3)',
            angle: '176deg',
            rotate: [6, 18],
            saturate: [18, 40],
            brightness: [8, 22],
            spark: [1.06, 1.24]
        },
        spark: {
            accent: 'rgba(255, 142, 221, 0.48)',
            aux: 'rgba(255, 201, 125, 0.3)',
            angle: '164deg',
            rotate: [16, 30],
            saturate: [30, 56],
            brightness: [12, 28],
            spark: [1.16, 1.4]
        },
        commit: {
            accent: 'rgba(255, 214, 134, 0.44)',
            aux: 'rgba(255, 142, 186, 0.3)',
            angle: '220deg',
            rotate: [4, 14],
            saturate: [16, 34],
            brightness: [10, 22],
            spark: [1.08, 1.26]
        },
        glide: {
            accent: 'rgba(128, 216, 255, 0.42)',
            aux: 'rgba(72, 255, 215, 0.28)',
            angle: '150deg',
            rotate: [6, 16],
            saturate: [18, 38],
            brightness: [8, 20],
            spark: [1.05, 1.24]
        },
        handoff: {
            accent: 'rgba(168, 174, 255, 0.42)',
            aux: 'rgba(128, 212, 255, 0.3)',
            angle: '206deg',
            rotate: [8, 20],
            saturate: [20, 42],
            brightness: [10, 24],
            spark: [1.08, 1.26]
        }
    };

    constructor(canvas) {
        this.canvas = canvas;
        this.webglField = ReactiveHologramField.create(canvas);
        this.particleField = this.webglField ? null : new OrbitalField(canvas);
        this.activeSection = null;
        this.sectionObserver = null;
        this.mode = 'quantum';
        this.targetIntensity = 1;
        this.intensity = 1;
        this.bursts = [];
        this.intensityFrame = null;
        this.lastIntensityTick = performance.now();
        this.pointerVelocity = 0;
        this.handlePhaseEvent = this.handlePhaseEvent.bind(this);
        this.animateIntensity = this.animateIntensity.bind(this);

        const root = document.documentElement;
        root.setAttribute('data-background-mode', this.mode);
        root.style.setProperty('--background-base-intensity', '1');
        root.style.setProperty('--background-intensity', '1');
        root.style.setProperty('--background-burst', '0');

        this.ensureIntensityLoop();
        this.init();
    }

    ensureIntensityLoop() {
        if (this.intensityFrame) {
            return;
        }
        this.lastIntensityTick = performance.now();
        this.intensityFrame = requestAnimationFrame(this.animateIntensity);
    }

    animateIntensity(now) {
        const root = document.documentElement;
        const delta = now - this.lastIntensityTick;
        this.lastIntensityTick = now;

        let boost = 0;
        if (this.bursts.length) {
            const active = [];
            this.bursts.forEach((burst) => {
                const progress = BackgroundFieldController.clamp((now - burst.start) / burst.duration, 0, 1);
                const eased = 1 - Math.pow(progress, 2);
                boost = Math.max(boost, burst.amount * eased);
                if (progress < 1) {
                    active.push(burst);
                }
            });
            this.bursts = active;
        }

        const base = this.targetIntensity;
        const target = base + boost;
        const smoothing = BackgroundFieldController.clamp(delta / 260, 0.08, 0.32);
        this.intensity += (target - this.intensity) * smoothing;
        const applied = BackgroundFieldController.clamp(this.intensity, 0.3, 2.6);

        root.style.setProperty('--background-base-intensity', base.toFixed(3));
        root.style.setProperty('--background-intensity', applied.toFixed(3));
        root.style.setProperty('--background-burst', Math.max(0, applied - base).toFixed(3));

        if (this.webglField && typeof this.webglField.setIntensity === 'function') {
            this.webglField.setIntensity(applied);
        } else if (this.particleField && typeof this.particleField.setIntensity === 'function') {
            this.particleField.setIntensity(applied);
        }

        this.intensityFrame = requestAnimationFrame(this.animateIntensity);
    }

    setIntensityTarget(value, options = {}) {
        const { immediate = false } = options;
        const numeric = Number(value);
        const clamped = BackgroundFieldController.clamp(Number.isFinite(numeric) ? numeric : 1, 0.3, 2.4);
        this.targetIntensity = clamped;
        if (immediate) {
            this.intensity = clamped;
        }
        this.ensureIntensityLoop();
    }

    triggerBurst(amount, options = {}) {
        const { decay = 900 } = options;
        const numericAmount = Number(amount);
        const normalized = Number.isFinite(numericAmount) ? Math.max(0, numericAmount) : 0;
        if (normalized <= 0) {
            return;
        }
        const numericDecay = Number(decay);
        const duration = Number.isFinite(numericDecay) ? Math.max(numericDecay, 180) : 900;
        this.bursts.push({
            amount: Math.min(normalized, 1.6),
            start: performance.now(),
            duration
        });
        this.ensureIntensityLoop();
    }

    cardReleased(card) {
        if (!card) {
            return;
        }
        this.triggerBurst(0.1, { decay: 680 });
    }

    init() {
        if (this.webglField) {
            this.webglField.start();
        } else if (this.particleField) {
            this.particleField.start();
        }

        this.observeSections();
        window.addEventListener('resize', () => {
            if (this.activeSection) {
                this.updateSectionFocus(this.activeSection);
            }
        }, { passive: true });
        document.addEventListener('clear-seas:showcase-phase', this.handlePhaseEvent);
    }

    destroy() {
        document.removeEventListener('clear-seas:showcase-phase', this.handlePhaseEvent);
        if (this.sectionObserver) {
            this.sectionObserver.disconnect();
            this.sectionObserver = null;
        }
        if (this.intensityFrame) {
            cancelAnimationFrame(this.intensityFrame);
            this.intensityFrame = null;
        }
    }

    observeSections() {
        const sections = Array.from(document.querySelectorAll('[data-background]'));
        if (!sections.length || !('IntersectionObserver' in window)) {
            return;
        }

        this.sectionObserver = new IntersectionObserver((entries) => {
            const visible = entries
                .filter((entry) => entry.isIntersecting)
                .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
            if (!visible.length) {
                return;
            }
            const candidate = visible[0].target;
            if (candidate === this.activeSection) {
                return;
            }
            this.activeSection = candidate;
            this.setMode(candidate.dataset.background || 'quantum');
            this.updateSectionFocus(candidate);
        }, { threshold: [0.25, 0.55, 0.85], rootMargin: '-20% 0px -20% 0px' });

        sections.forEach((section) => this.sectionObserver.observe(section));
    }

    updateSectionFocus(section) {
        if (!section) {
            return;
        }
        const focusAttr = section.dataset.backgroundFocus;
        let focusX;
        let focusY;
        if (focusAttr) {
            const parts = focusAttr.split(',').map((part) => Number(part.trim()));
            if (parts.length === 2 && parts.every((value) => Number.isFinite(value))) {
                focusX = BackgroundFieldController.clamp(parts[0], 0, 1);
                focusY = BackgroundFieldController.clamp(parts[1], 0, 1);
            }
        }

        if (focusX === undefined || focusY === undefined) {
            const rect = section.getBoundingClientRect();
            focusX = BackgroundFieldController.clamp((rect.left + rect.width / 2) / window.innerWidth, 0, 1);
            focusY = BackgroundFieldController.clamp((rect.top + rect.height / 2) / window.innerHeight, 0, 1);
        }

        const strength = Number(section.dataset.backgroundStrength || '0.7');
        this.setFocus(focusX, focusY, Number.isFinite(strength) ? strength : 0.7);

        if (section.dataset.backgroundIntensity !== undefined) {
            const baseIntensity = Number(section.dataset.backgroundIntensity);
            if (Number.isFinite(baseIntensity)) {
                this.setIntensityTarget(baseIntensity);
            }
        }

        if (section.dataset.backgroundPulse !== undefined) {
            const pulse = Number(section.dataset.backgroundPulse);
            const pulseDecay = Number(section.dataset.backgroundPulseDecay);
            if (Number.isFinite(pulse)) {
                this.triggerBurst(pulse, {
                    decay: Number.isFinite(pulseDecay) ? Math.max(pulseDecay, 200) : 1400
                });
            }
        }
    }

    handlePhaseEvent(event) {
        const detail = event.detail || {};
        const card = detail.card;
        if (!card) {
            return;
        }
        const rect = card.getBoundingClientRect();
        const ratio = detail.totalPhases && detail.totalPhases > 1
            ? BackgroundFieldController.clamp(detail.phaseIndex / (detail.totalPhases - 1), 0, 1)
            : 0;
        const centerX = BackgroundFieldController.clamp((rect.left + rect.width / 2) / window.innerWidth, 0, 1);
        const targetY = rect.top + rect.height * (0.35 + ratio * 0.3);
        const centerY = BackgroundFieldController.clamp(targetY / window.innerHeight, 0, 1);
        const baseStrength = Number(card.dataset.backgroundFlare || '0.75');
        const strength = Number.isFinite(baseStrength) ? baseStrength + ratio * 0.2 : 0.8;
        this.setFocus(centerX, centerY, strength);
        if (card.dataset.backgroundMode) {
            this.setMode(card.dataset.backgroundMode);
        }
        const root = document.documentElement;
        const themeNameRaw = typeof detail.theme === 'string' && detail.theme.trim()
            ? detail.theme.trim().toLowerCase()
            : (card.dataset.phaseTheme || '').trim().toLowerCase();
        const accent = detail.phase && detail.phase.dataset.phaseAccent
            ? detail.phase.dataset.phaseAccent
            : undefined;

        const theme = themeNameRaw || 'pulse';
        root.setAttribute('data-showcase-theme', theme);
        root.style.setProperty('--showcase-phase-progress', ratio.toFixed(4));
        if (typeof detail.phaseIndex === 'number') {
            root.style.setProperty('--showcase-phase-index', String(detail.phaseIndex));
        }
        if (typeof detail.totalPhases === 'number') {
            root.style.setProperty('--showcase-phase-count', String(detail.totalPhases));
        }
        if (card.dataset.element) {
            root.setAttribute('data-showcase-card', card.dataset.element);
        }

        this.applyPalette(theme, ratio, accent);
        let targetIntensity = 0.95 + ratio * 0.55;
        let burstAmount = 0.16 + ratio * 0.22;
        let burstDecay = 1400;

        if (detail.phase) {
            const phaseIntensityAttr = detail.phase.dataset.phaseIntensity;
            if (phaseIntensityAttr !== undefined) {
                const phaseIntensity = Number(phaseIntensityAttr);
                if (Number.isFinite(phaseIntensity)) {
                    targetIntensity = phaseIntensity;
                }
            }

            const phaseBurstAttr = detail.phase.dataset.phaseBurst;
            if (phaseBurstAttr !== undefined) {
                const phaseBurst = Number(phaseBurstAttr);
                if (Number.isFinite(phaseBurst)) {
                    burstAmount = phaseBurst;
                }
            }

            const phaseBurstDecayAttr = detail.phase.dataset.phaseBurstDecay;
            if (phaseBurstDecayAttr !== undefined) {
                const decayValue = Number(phaseBurstDecayAttr);
                if (Number.isFinite(decayValue)) {
                    burstDecay = Math.max(decayValue, 200);
                }
            }
        }

        this.setIntensityTarget(targetIntensity);
        this.triggerBurst(burstAmount, { decay: burstDecay });
    }

    applyPalette(theme, ratio, accentOverride) {
        const root = document.documentElement;
        const palette = BackgroundFieldController.themePalettes[theme] || BackgroundFieldController.themePalettes.default;
        const progress = BackgroundFieldController.clamp(Number.isFinite(ratio) ? ratio : 0, 0, 1);
        const lerpRange = (range) => {
            if (!Array.isArray(range)) {
                return Number(range || 0);
            }
            if (range.length <= 1) {
                return Number(range[0] || 0);
            }
            const [start, end] = range;
            return start + (end - start) * progress;
        };

        const overlayAccent = accentOverride || palette.accent;
        if (overlayAccent) {
            root.style.setProperty('--background-overlay-accent', overlayAccent);
        }
        if (palette.aux) {
            root.style.setProperty('--background-overlay-aux', palette.aux);
        }
        if (palette.angle) {
            root.style.setProperty('--background-overlay-angle', palette.angle);
        }
        if (palette.rotate) {
            root.style.setProperty('--text-hue-rotate-shift', `${lerpRange(palette.rotate).toFixed(2)}deg`);
        }
        if (palette.saturate) {
            root.style.setProperty('--text-hue-saturate-shift', `${lerpRange(palette.saturate).toFixed(2)}%`);
        }
        if (palette.brightness) {
            root.style.setProperty('--text-hue-brightness-shift', `${lerpRange(palette.brightness).toFixed(2)}%`);
        }
        if (palette.spark) {
            root.style.setProperty('--spark-intensity', lerpRange(palette.spark).toFixed(3));
        }
    }

    setMode(mode) {
        const normalized = typeof mode === 'string' ? mode.toLowerCase().trim() : '';
        let alias = 'quantum';
        if (normalized.startsWith('active')) {
            alias = 'active';
        } else if (normalized.startsWith('holo')) {
            alias = 'hologram';
        }
        if (alias === this.mode) {
            return;
        }
        this.mode = alias;
        document.documentElement.setAttribute('data-background-mode', alias);
        if (this.webglField) {
            this.webglField.setMode(alias);
        }
        this.triggerBurst(0.14, { decay: 1200 });
    }

    setPointer(x, y, velocity = 0) {
        const clampedX = BackgroundFieldController.clamp(x, 0, 1);
        const clampedY = BackgroundFieldController.clamp(y, 0, 1);
        if (this.webglField) {
            this.webglField.setPointer(clampedX, clampedY);
        }
        const clampedVelocity = BackgroundFieldController.clamp(Number(velocity), 0, 1);
        this.pointerVelocity = clampedVelocity;
        const root = document.documentElement;
        root.style.setProperty('--pointer-velocity', clampedVelocity.toFixed(3));

        const primaryAlpha = BackgroundFieldController.clamp(0.25 + clampedVelocity * 0.6, 0.22, 0.85);
        const secondaryAlpha = BackgroundFieldController.clamp(0.18 + clampedVelocity * 0.5, 0.18, 0.74);
        const highlightAlpha = BackgroundFieldController.clamp(0.12 + clampedVelocity * 0.45, 0.12, 0.82);

        root.style.setProperty('--pointer-primary-glow', `rgba(72, 198, 255, ${primaryAlpha.toFixed(3)})`);
        root.style.setProperty('--pointer-secondary-glow', `rgba(151, 112, 255, ${secondaryAlpha.toFixed(3)})`);
        root.style.setProperty('--pointer-highlight', `rgba(255, 214, 170, ${highlightAlpha.toFixed(3)})`);

        if (clampedVelocity > 0.18) {
            this.triggerBurst(0.12 + clampedVelocity * 0.32, { decay: 680 + clampedVelocity * 620 });
        }
    }

    setFocus(x, y, strength) {
        const clampedX = BackgroundFieldController.clamp(x, 0, 1);
        const clampedY = BackgroundFieldController.clamp(y, 0, 1);
        const cleanStrength = Number.isFinite(strength) ? strength : 0.7;
        const normalizedStrength = BackgroundFieldController.clamp(cleanStrength, 0.2, 1.6);
        const root = document.documentElement;
        root.style.setProperty('--background-focus-x', `${(clampedX * 100).toFixed(2)}%`);
        root.style.setProperty('--background-focus-y', `${(clampedY * 100).toFixed(2)}%`);
        root.style.setProperty('--background-focus-strength', normalizedStrength.toFixed(3));
        if (this.webglField) {
            this.webglField.setFocus(clampedX, clampedY, normalizedStrength);
        }
    }

    nudgeToCard(card, meta = {}) {
        if (!card) {
            return;
        }
        const rect = card.getBoundingClientRect();
        const centerX = BackgroundFieldController.clamp((rect.left + rect.width / 2) / window.innerWidth, 0, 1);
        const offset = meta.total && meta.total > 1 ? meta.index / (meta.total - 1) : 0.5;
        const targetY = rect.top + rect.height * (0.3 + offset * 0.35);
        const centerY = BackgroundFieldController.clamp(targetY / window.innerHeight, 0, 1);
        const baseStrength = Number(card.dataset.backgroundFlare || '0.75');
        const strength = Number.isFinite(baseStrength) ? baseStrength : 0.75;
        this.setFocus(centerX, centerY, strength);
        if (card.dataset.backgroundMode) {
            this.setMode(card.dataset.backgroundMode);
        }
        if (typeof meta.index === 'number') {
            document.documentElement.style.setProperty('--showcase-card-index', String(meta.index));
        }
        if (typeof meta.total === 'number') {
            document.documentElement.style.setProperty('--showcase-card-count', String(meta.total));
        }
        if (card.dataset.element) {
            document.documentElement.setAttribute('data-showcase-card', card.dataset.element);
        }

        const ratio = meta.total && meta.total > 1 ? BackgroundFieldController.clamp(meta.index / (meta.total - 1), 0, 1) : 0.5;
        if (card.dataset.backgroundIntensity !== undefined) {
            const baseIntensity = Number(card.dataset.backgroundIntensity);
            if (Number.isFinite(baseIntensity)) {
                this.setIntensityTarget(baseIntensity);
            }
        } else {
            this.setIntensityTarget(1 + ratio * 0.28);
        }

        if (card.dataset.backgroundBurst !== undefined) {
            const burst = Number(card.dataset.backgroundBurst);
            const decay = Number(card.dataset.backgroundBurstDecay);
            if (Number.isFinite(burst)) {
                this.triggerBurst(burst, {
                    decay: Number.isFinite(decay) ? Math.max(decay, 200) : 1200
                });
            }
        } else {
            this.triggerBurst(0.18 + ratio * 0.2, { decay: 1200 });
        }
    }
}

function easeOutCubic(x) {
    return 1 - Math.pow(1 - x, 3);
}

function initialiseReveals() {
    const elements = document.querySelectorAll('[data-reveal]');
    if (!('IntersectionObserver' in window)) {
        elements.forEach((element) => element.classList.add('is-visible'));
        return;
    }

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) {
                return;
            }
            entry.target.classList.add('is-visible');
            obs.unobserve(entry.target);
        });
    }, { threshold: 0.2, rootMargin: '0px 0px -10% 0px' });

    elements.forEach((element) => observer.observe(element));
}

function initialiseCounters() {
    const counters = document.querySelectorAll('[data-count]');
    if (!counters.length) {
        return;
    }

    counters.forEach((counter) => {
        counter.setAttribute('aria-live', 'polite');
    });

    const seen = new WeakSet();

    const formatValue = (value, decimals) => value.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    });

    const displayFinal = (element) => {
        const target = Number(element.dataset.target || 0);
        const prefix = element.dataset.prefix || '';
        const suffix = element.dataset.suffix || '';
        const decimals = Number(element.dataset.decimals || 0);
        element.textContent = `${prefix}${formatValue(target, decimals)}${suffix}`;
    };

    const animateCounter = (element) => {
        const target = Number(element.dataset.target || 0);
        const start = Number(element.dataset.start || 0);
        const suffix = element.dataset.suffix || '';
        const prefix = element.dataset.prefix || '';
        const decimals = Number(element.dataset.decimals || 0);
        const duration = Number(element.dataset.duration || 1600);
        const startTime = performance.now();

        const step = (now) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = easeOutCubic(progress);
            const current = start + (target - start) * eased;
            const output = progress === 1 ? target : current;
            element.textContent = `${prefix}${formatValue(output, decimals)}${suffix}`;
            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                displayFinal(element);
                if (backgroundFieldController) {
                    backgroundFieldController.triggerBurst(0.08, { decay: 640 });
                }
            }
        };

        requestAnimationFrame(step);
    };

    const startCounter = (element) => {
        if (seen.has(element)) {
            return;
        }
        seen.add(element);
        animateCounter(element);
        if (backgroundFieldController) {
            backgroundFieldController.triggerBurst(0.12, { decay: 900 });
        }
    };

    if (!('IntersectionObserver' in window)) {
        counters.forEach((counter) => startCounter(counter));
        return;
    }

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) {
                return;
            }
            startCounter(entry.target);
            obs.unobserve(entry.target);
        });
    }, { threshold: 0.6, rootMargin: '0px 0px -10% 0px' });

    counters.forEach((counter) => observer.observe(counter));
}

function initialiseNavigation() {
    const nav = document.querySelector('.primary-nav');
    const toggle = document.querySelector('.nav-toggle');
    if (!nav || !toggle) {
        return;
    }

    const closeNav = () => {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
    };

    toggle.addEventListener('click', () => {
        const isOpen = nav.classList.toggle('is-open');
        toggle.setAttribute('aria-expanded', String(isOpen));
    });

    nav.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => {
            closeNav();
        });
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeNav();
        }
    });

    document.addEventListener('click', (event) => {
        if (!nav.classList.contains('is-open')) {
            return;
        }
        if (event.target instanceof Node && (nav.contains(event.target) || toggle.contains(event.target))) {
            return;
        }
        closeNav();
    });
}

function initialiseHeaderState() {
    const header = document.querySelector('.site-header');
    if (!header) {
        return;
    }

    let lastKnownScroll = window.scrollY;
    let ticking = false;

    const update = () => {
        header.classList.toggle('is-condensed', lastKnownScroll > 18);
        ticking = false;
    };

    update();

    window.addEventListener('scroll', () => {
        lastKnownScroll = window.scrollY;
        if (!ticking) {
            ticking = true;
            requestAnimationFrame(update);
        }
    }, { passive: true });
}

function initialiseSectionTracking() {
    const navLinks = Array.from(document.querySelectorAll('.primary-nav a[href^="#"]'));
    if (!navLinks.length) {
        return;
    }

    const sections = navLinks
        .map((link) => {
            const id = link.getAttribute('href');
            if (!id || id.length <= 1) {
                return null;
            }
            return document.getElementById(id.slice(1));
        })
        .filter((section) => section);

    if (!sections.length) {
        return;
    }

    const linkBySection = new Map();
    sections.forEach((section) => {
        const match = navLinks.find((link) => link.getAttribute('href') === `#${section.id}`);
        if (match) {
            linkBySection.set(section, match);
        }
    });

    const setActive = (section) => {
        const link = linkBySection.get(section);
        if (!link) {
            return;
        }
        navLinks.forEach((item) => {
            item.classList.toggle('is-active', item === link);
        });
    };

    navLinks.forEach((link) => {
        link.addEventListener('click', () => {
            navLinks.forEach((item) => item.classList.toggle('is-active', item === link));
        });
    });

    if (!('IntersectionObserver' in window)) {
        setActive(sections[0]);
        return;
    }

    let activeSection = null;

    const observer = new IntersectionObserver((entries) => {
        const visible = entries
            .filter((entry) => entry.isIntersecting)
            .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (!visible.length) {
            return;
        }

        const candidate = visible[0].target;
        if (candidate === activeSection) {
            return;
        }

        activeSection = candidate;
        setActive(activeSection);
    }, { threshold: [0.35, 0.55, 0.75], rootMargin: '0px 0px -45% 0px' });

    sections.forEach((section) => observer.observe(section));
}

function createTiltController(elements, options = {}) {
    const targets = Array.from(elements);
    const defaultStrength = options.strength || 6;
    const handlers = new WeakMap();

    const enable = () => {
        targets.forEach((element) => {
            const strength = Number(element.dataset.tiltStrength || defaultStrength);
            const onMove = (event) => {
                const rect = element.getBoundingClientRect();
                const x = (event.clientX - rect.left) / rect.width;
                const y = (event.clientY - rect.top) / rect.height;
                const clampedX = Math.min(Math.max(x, 0), 1);
                const clampedY = Math.min(Math.max(y, 0), 1);
                const rotateX = (0.5 - clampedY) * strength;
                const rotateY = (clampedX - 0.5) * strength;
                element.style.setProperty('--tilt-x', `${rotateX.toFixed(2)}deg`);
                element.style.setProperty('--tilt-y', `${rotateY.toFixed(2)}deg`);
            };
            const onLeave = () => {
                element.style.setProperty('--tilt-x', '0deg');
                element.style.setProperty('--tilt-y', '0deg');
            };

            element.addEventListener('pointermove', onMove);
            element.addEventListener('pointerleave', onLeave);
            element.addEventListener('pointerup', onLeave);
            handlers.set(element, { onMove, onLeave });
        });
    };

    const disable = () => {
        targets.forEach((element) => {
            const entry = handlers.get(element);
            if (!entry) {
                return;
            }
            element.removeEventListener('pointermove', entry.onMove);
            element.removeEventListener('pointerleave', entry.onLeave);
            element.removeEventListener('pointerup', entry.onLeave);
            element.style.setProperty('--tilt-x', '0deg');
            element.style.setProperty('--tilt-y', '0deg');
            handlers.delete(element);
        });
    };

    return { enable, disable };
}

function initialisePointerBackground(onUpdate) {
    const root = document.documentElement;
    const state = {
        currentX: 50,
        currentY: 50,
        targetX: 50,
        targetY: 50,
        prevX: 50,
        prevY: 50,
        velocity: 0,
        lastTime: performance.now()
    };
    let frameId = null;

    const update = (timestamp) => {
        state.currentX += (state.targetX - state.currentX) * 0.12;
        state.currentY += (state.targetY - state.currentY) * 0.12;
        const deltaX = state.currentX - state.prevX;
        const deltaY = state.currentY - state.prevY;
        const elapsed = Math.max((timestamp || performance.now()) - state.lastTime, 16);
        const distance = Math.hypot(deltaX, deltaY);
        const speed = distance / elapsed;
        state.velocity = state.velocity * 0.82 + speed * 0.18;
        const normalizedVelocity = Math.min(state.velocity * 16, 1);
        state.prevX = state.currentX;
        state.prevY = state.currentY;
        state.lastTime = timestamp || performance.now();
        root.style.setProperty('--pointer-x', `${state.currentX}%`);
        root.style.setProperty('--pointer-y', `${state.currentY}%`);
        if (typeof onUpdate === 'function') {
            onUpdate(state.currentX / 100, state.currentY / 100, normalizedVelocity);
        }
        frameId = requestAnimationFrame(update);
    };

    const handlePointer = (event) => {
        const x = (event.clientX / window.innerWidth) * 100;
        const y = (event.clientY / window.innerHeight) * 100;
        state.targetX = Math.min(Math.max(x, 0), 100);
        state.targetY = Math.min(Math.max(y, 0), 100);
    };

    const resetTarget = () => {
        state.targetX = 50;
        state.targetY = 50;
    };

    const enable = () => {
        cancelAnimationFrame(frameId);
        state.prevX = state.currentX;
        state.prevY = state.currentY;
        state.lastTime = performance.now();
        frameId = requestAnimationFrame(update);
        window.addEventListener('pointermove', handlePointer, { passive: true });
        window.addEventListener('pointerleave', resetTarget, { passive: true });
        window.addEventListener('pointerdown', handlePointer, { passive: true });
        if (typeof onUpdate === 'function') {
            onUpdate(state.currentX / 100, state.currentY / 100, 0);
        }
    };

    enable();
}


function initialiseStackedShowcase() {
    const stacks = document.querySelectorAll('[data-stack]');
    if (!stacks.length) {
        return;
    }

    stacks.forEach((stack) => {
        const cards = Array.from(stack.querySelectorAll('[data-stack-card]'));
        if (!cards.length) {
            return;
        }

        const supportsObserver = 'IntersectionObserver' in window;
        let observer = null;
        let activeIndex = -1;

        const stackState = {
            locked: false,
            pendingIndex: null,
            releaseTimeout: null
        };

        const clearReleaseTimeout = () => {
            if (stackState.releaseTimeout) {
                clearTimeout(stackState.releaseTimeout);
                stackState.releaseTimeout = null;
            }
        };

        const createCardState = (card) => {
            const phases = Array.from(card.querySelectorAll('[data-phase]'));
            const fallbackDurationRaw = Number(card.dataset.phaseDuration || stack.dataset.stackPhaseDuration || '3200');
            const baseDuration = Number.isFinite(fallbackDurationRaw) ? Math.max(fallbackDurationRaw, 0) : 3200;
            if (phases.length) {
                card.setAttribute('data-phase-count', String(phases.length));
            } else {
                card.removeAttribute('data-phase-count');
            }
            const durations = phases.map((phase) => {
                const specific = Number(phase.dataset.phaseDuration || phase.dataset.phaseDelay);
                if (Number.isFinite(specific)) {
                    return Math.max(specific, 0);
                }
                return baseDuration;
            });

            let timers = [];

            const clearTimers = () => {
                timers.forEach((timer) => clearTimeout(timer));
                timers = [];
            };

            const applyPhaseState = (phase, active) => {
                phase.classList.toggle('is-active', active);
                phase.classList.toggle('is-visible', active);
                phase.setAttribute('aria-hidden', active ? 'false' : 'true');
            };

            const showPhase = (index, options = {}) => {
                const silent = Boolean(options.silent);
                if (!phases.length) {
                    card.removeAttribute('data-phase-theme');
                    card.removeAttribute('data-phase-index');
                    return;
                }
                const clamped = Math.min(Math.max(index, 0), phases.length - 1);
                phases.forEach((phase, phaseIndex) => {
                    applyPhaseState(phase, phaseIndex === clamped);
                });
                const activePhase = phases[clamped];
                if (activePhase) {
                    const theme = activePhase.dataset.phaseTheme || activePhase.dataset.phase || `phase-${clamped}`;
                    const accent = activePhase.dataset.phaseAccent;
                    card.setAttribute('data-phase-theme', theme);
                    card.setAttribute('data-phase-index', String(clamped));
                    if (accent) {
                        card.style.setProperty('--card-phase-accent', accent);
                    } else {
                        card.style.removeProperty('--card-phase-accent');
                    }
                    if (!silent) {
                        document.dispatchEvent(new CustomEvent('clear-seas:showcase-phase', {
                            detail: {
                                card,
                                phaseIndex: clamped,
                                totalPhases: phases.length,
                                theme,
                                phase: activePhase
                            }
                        }));
                    }
                }
            };

            const prepareIdle = () => {
                clearTimers();
                if (!phases.length) {
                    card.removeAttribute('data-phase-theme');
                    card.removeAttribute('data-phase-index');
                    card.removeAttribute('data-phase-count');
                    card.style.removeProperty('--card-phase-accent');
                    return;
                }
                showPhase(0, { silent: true });
            };

            const runSequence = () => {
                clearTimers();
                if (!phases.length) {
                    card.removeAttribute('data-phase-theme');
                    card.removeAttribute('data-phase-index');
                    card.removeAttribute('data-phase-count');
                    card.style.removeProperty('--card-phase-accent');
                    return 0;
                }
                showPhase(0);
                let accumulated = 0;
                for (let i = 1; i < phases.length; i += 1) {
                    const delay = Math.max(0, durations[i - 1] || 0);
                    accumulated += delay;
                    const nextIndex = i;
                    const timer = setTimeout(() => {
                        showPhase(nextIndex);
                    }, accumulated);
                    timers.push(timer);
                }
                const finalDuration = durations.length ? Math.max(0, durations[durations.length - 1] || 0) : 0;
                return accumulated + finalDuration;
            };

            prepareIdle();

            return {
                prepareIdle,
                runSequence,
                clearTimers
            };
        };

        const states = cards.map((card, index) => {
            card.dataset.stackIndex = String(index);
            return createCardState(card);
        });

        document.documentElement.style.setProperty('--showcase-card-count', String(cards.length));

        const markAllActive = () => {
            cards.forEach((card, index) => {
                card.classList.add('is-active');
                card.classList.remove('is-exiting');
                const state = states[index];
                if (state) {
                    state.prepareIdle();
                }
            });
        };

        const disconnectObserver = () => {
            if (observer) {
                observer.disconnect();
                observer = null;
            }
        };

        const setActive = (index) => {
            if (index < 0 || index >= cards.length || index === activeIndex) {
                return;
            }

            if (stackState.locked) {
                stackState.pendingIndex = index;
                return;
            }

            const previousCard = cards[activeIndex];
            const previousState = states[activeIndex];

            if (previousCard) {
                previousCard.classList.remove('is-active');
                previousCard.classList.add('is-exiting');
                const handleExit = () => {
                    previousCard.classList.remove('is-exiting');
                    if (previousState) {
                        previousState.prepareIdle();
                    }
                    if (backgroundFieldController && typeof backgroundFieldController.cardReleased === 'function') {
                        backgroundFieldController.cardReleased(previousCard);
                    }
                };
                previousCard.addEventListener('animationend', handleExit, { once: true });
            }

            const nextCard = cards[index];
            const nextState = states[index];

            nextCard.classList.add('is-active');
            nextCard.classList.remove('is-exiting');
            activeIndex = index;

            document.documentElement.style.setProperty('--showcase-card-index', String(index));
            document.documentElement.style.setProperty('--showcase-card-count', String(cards.length));
            if (nextCard.dataset.element) {
                document.documentElement.setAttribute('data-showcase-card', nextCard.dataset.element);
            }

            const holdDuration = nextState ? nextState.runSequence() : 0;

            stackState.locked = true;
            clearReleaseTimeout();
            const pause = Number(nextCard.dataset.phasePause || '480');
            const buffer = Number.isFinite(pause) ? Math.max(pause, 0) : 480;
            const totalHold = Math.max(holdDuration + buffer, 600);
            stackState.releaseTimeout = setTimeout(releaseLock, totalHold);

            if (backgroundFieldController) {
                backgroundFieldController.nudgeToCard(nextCard, { index, total: cards.length });
            }
        };

        const releaseLock = () => {
            stackState.locked = false;
            clearReleaseTimeout();
            if (stackState.pendingIndex !== null) {
                const pending = stackState.pendingIndex;
                stackState.pendingIndex = null;
                setActive(pending);
            }
            if (backgroundFieldController) {
                backgroundFieldController.triggerBurst(0.12, { decay: 720 });
            }
        };

        const createObserver = () => new IntersectionObserver((entries) => {
            const visible = entries
                .filter((entry) => entry.isIntersecting)
                .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

            if (!visible.length) {
                return;
            }

            const topEntry = visible[0].target;
            const index = cards.indexOf(topEntry);
            if (index >= 0) {
                setActive(index);
            }
        }, { threshold: [0.35, 0.55, 0.75], rootMargin: '-42% 0px -42% 0px' });

        const enablePinned = () => {
            if (!supportsObserver) {
                stack.setAttribute('data-prefer-static', 'true');
                markAllActive();
                return;
            }

            disconnectObserver();
            stack.removeAttribute('data-prefer-static');
            clearReleaseTimeout();
            stackState.locked = false;
            stackState.pendingIndex = null;

            cards.forEach((card, index) => {
                card.classList.remove('is-active');
                card.classList.remove('is-exiting');
                const state = states[index];
                if (state) {
                    state.prepareIdle();
                }
            });

            const targetIndex = Math.min(Math.max(activeIndex, 0), cards.length - 1);
            activeIndex = -1;
            observer = createObserver();
            cards.forEach((card) => observer.observe(card));
            setActive(targetIndex >= 0 ? targetIndex : 0);
        };

        if (!supportsObserver) {
            stack.setAttribute('data-prefer-static', 'true');
            markAllActive();
            return;
        }

        enablePinned();
    });
}

function initialiseParallaxGroups() {
    const groups = Array.from(document.querySelectorAll('[data-parallax-group]'));
    if (!groups.length) {
        return;
    }

    const controllers = groups.map((group) => {
        const layers = Array.from(group.querySelectorAll('[data-parallax-layer]'));
        if (!layers.length) {
            return null;
        }

        const state = {
            pointerX: 0.5,
            pointerY: 0.5,
            scrollProgress: 0.5
        };
        let frameId = null;

        const apply = () => {
            frameId = null;
            layers.forEach((layer) => {
                const depth = Number(layer.dataset.parallaxDepth || 0.15);
                const pointerInfluence = depth * 24;
                const scrollInfluence = depth * 36;
                const offsetX = (state.pointerX - 0.5) * pointerInfluence;
                const offsetY = (state.pointerY - 0.5) * pointerInfluence + (state.scrollProgress - 0.5) * scrollInfluence;
                const scale = 1 + depth * 0.02;
                layer.style.transform = `translate3d(${offsetX.toFixed(2)}px, ${offsetY.toFixed(2)}px, 0) scale(${scale.toFixed(3)})`;
            });
        };

        const schedule = () => {
            if (frameId) {
                return;
            }
            frameId = requestAnimationFrame(apply);
        };

        const handleScroll = () => {
            const rect = group.getBoundingClientRect();
            if (!rect.height) {
                state.scrollProgress = 0.5;
            } else {
                const ratio = (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
                state.scrollProgress = Math.min(Math.max(ratio, 0), 1);
            }
            schedule();
        };

        const handlePointer = (event) => {
            const rect = group.getBoundingClientRect();
            state.pointerX = rect.width ? (event.clientX - rect.left) / rect.width : 0.5;
            state.pointerY = rect.height ? (event.clientY - rect.top) / rect.height : 0.5;
            schedule();
        };

        const resetPointer = () => {
            state.pointerX = 0.5;
            state.pointerY = 0.5;
            schedule();
        };

        const disable = () => {
            group.removeEventListener('pointermove', handlePointer);
            group.removeEventListener('pointerleave', resetPointer);
            group.removeEventListener('pointerdown', handlePointer);
            window.removeEventListener('scroll', handleScroll);
            if (frameId) {
                cancelAnimationFrame(frameId);
                frameId = null;
            }
            state.pointerX = 0.5;
            state.pointerY = 0.5;
            state.scrollProgress = 0.5;
            layers.forEach((layer) => {
                layer.style.transform = '';
            });
        };

        const enable = () => {
            disable();
            handleScroll();
            schedule();
            group.addEventListener('pointermove', handlePointer);
            group.addEventListener('pointerleave', resetPointer);
            group.addEventListener('pointerdown', handlePointer);
            window.addEventListener('scroll', handleScroll, { passive: true });
        };

        return { enable, disable };
    }).filter((controller) => controller);

    if (!controllers.length) {
        return;
    }

    controllers.forEach((controller) => controller.enable());
}

function initialiseSparkInteractions() {
    const elements = Array.from(document.querySelectorAll('[data-spark]'));
    if (!elements.length) {
        return;
    }

    const update = (element, event) => {
        const rect = element.getBoundingClientRect();
        const x = rect.width ? ((event.clientX - rect.left) / rect.width) * 100 : 50;
        const y = rect.height ? ((event.clientY - rect.top) / rect.height) * 100 : 50;
        element.style.setProperty('--spark-x', `${x}%`);
        element.style.setProperty('--spark-y', `${y}%`);
        element.style.setProperty('--spark-opacity', '0.92');
        element.style.setProperty('--spark-scale', '1.04');
    };

    const reset = (element) => {
        element.style.setProperty('--spark-opacity', '0');
        element.style.setProperty('--spark-scale', '0.94');
    };

    elements.forEach((element) => {
        element.addEventListener('pointermove', (event) => {
            update(element, event);
        });
        element.addEventListener('pointerdown', (event) => {
            update(element, event);
        });
        element.addEventListener('pointerleave', () => {
            reset(element);
        });
    });
}

function initialiseTimelines() {
    const timelines = Array.from(document.querySelectorAll('[data-timeline]'));
    if (!timelines.length) {
        return;
    }

    const supportsObserver = 'IntersectionObserver' in window;

    timelines.forEach((timeline) => {
        const steps = Array.from(timeline.querySelectorAll('[data-timeline-step]'));
        if (!steps.length) {
            return;
        }

        const progressEl = timeline.querySelector('[data-timeline-progress]');
        let activeIndex = 0;

        const setActive = (index) => {
            const clamped = Math.min(Math.max(index, 0), steps.length - 1);
            if (clamped === activeIndex && steps[clamped].classList.contains('is-active')) {
                return;
            }
            steps.forEach((step, stepIndex) => {
                step.classList.toggle('is-active', stepIndex === clamped);
            });
            if (progressEl) {
                const ratio = steps.length <= 1 ? 1 : clamped / (steps.length - 1);
                timeline.style.setProperty('--timeline-progress', String(Math.min(Math.max(ratio, 0), 1)));
            }
            activeIndex = clamped;
        };

        if (!supportsObserver) {
            setActive(steps.length - 1);
            return;
        }

        const observer = new IntersectionObserver((entries) => {
            const visible = entries
                .filter((entry) => entry.isIntersecting)
                .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
            if (!visible.length) {
                return;
            }
            const candidate = visible[0].target;
            const index = steps.indexOf(candidate);
            if (index >= 0) {
                setActive(index);
            }
        }, { threshold: [0.35, 0.55, 0.75], rootMargin: '-20% 0px -20% 0px' });

        steps.forEach((step) => observer.observe(step));
        setActive(0);
    });
}

function updateFooterYear() {
    const target = document.querySelector('[data-year]');
    if (target) {
        target.textContent = String(new Date().getFullYear());
    }
}

let backgroundFieldController = null;

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('orbital-field');
    if (canvas) {
        backgroundFieldController = new BackgroundFieldController(canvas);
    }

    initialiseReveals();
    initialiseCounters();
    initialiseNavigation();
    initialiseHeaderState();
    initialiseSectionTracking();

    initialisePointerBackground((x, y, velocity) => {
        if (backgroundFieldController) {
            backgroundFieldController.setPointer(x, y, velocity);
        }
    });

    initialiseStackedShowcase();
    initialiseParallaxGroups();
    initialiseSparkInteractions();
    initialiseTimelines();
    updateFooterYear();

    const tiltTargets = document.querySelectorAll('.hero__module, .canvas-card, .stacked-card, .flow-step, .flow-thread, .metric, .micro-card, .system-card, .variant-card, .signal-card, .signal-node, .resource-card');
    const tiltController = createTiltController(tiltTargets, { strength: 8 });
    tiltController.enable();

});
