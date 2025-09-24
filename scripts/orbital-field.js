(() => {
    const canvas = document.getElementById('orbital-field');
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    const nodes = [];
    let width = 0;
    let height = 0;
    let dpr = window.devicePixelRatio || 1;
    let animationId = null;

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const palette = [
        'rgba(109, 251, 255, 0.9)',
        'rgba(159, 120, 255, 0.8)',
        'rgba(255, 111, 183, 0.65)'
    ];

    function setCanvasSize() {
        width = window.innerWidth;
        height = window.innerHeight;
        dpr = window.devicePixelRatio || 1;
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function createNodes() {
        nodes.length = 0;
        const baseCount = Math.min(140, Math.floor((width + height) / 18));
        for (let i = 0; i < baseCount; i += 1) {
            nodes.push({
                baseX: Math.random() * width,
                baseY: Math.random() * height,
                angle: Math.random() * Math.PI * 2,
                speed: 0.0004 + Math.random() * 0.0012,
                orbitRadius: 40 + Math.random() * 160,
                distortion: 0.45 + Math.random() * 0.55,
                size: 1 + Math.random() * 2.3,
                color: palette[i % palette.length],
                connectRange: 90 + Math.random() * 90
            });
        }
    }

    function drawStaticBackdrop() {
        ctx.clearRect(0, 0, width, height);
        const gradient = ctx.createRadialGradient(width * 0.5, height * 0.4, 0, width * 0.5, height * 0.4, Math.max(width, height) * 0.7);
        gradient.addColorStop(0, 'rgba(109, 251, 255, 0.16)');
        gradient.addColorStop(0.5, 'rgba(159, 120, 255, 0.12)');
        gradient.addColorStop(1, 'rgba(4, 6, 21, 0.0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        nodes.forEach((node) => {
            ctx.beginPath();
            ctx.fillStyle = node.color;
            ctx.globalAlpha = 0.35;
            ctx.arc(node.baseX, node.baseY, node.size * 3.5, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.globalAlpha = 1;
    }

    function renderFrame(timestamp) {
        ctx.clearRect(0, 0, width, height);
        const connectionIntensity = 0.38;

        for (let i = 0; i < nodes.length; i += 1) {
            const node = nodes[i];
            node.angle += node.speed * (1 + Math.sin(timestamp * 0.0002));
            const x = node.baseX + Math.cos(node.angle) * node.orbitRadius;
            const y = node.baseY + Math.sin(node.angle * node.distortion) * (node.orbitRadius * 0.6);

            const radial = ctx.createRadialGradient(x, y, 0, x, y, node.size * 14);
            radial.addColorStop(0, node.color);
            radial.addColorStop(1, 'rgba(6, 10, 30, 0)');
            ctx.fillStyle = radial;
            ctx.beginPath();
            ctx.arc(x, y, node.size * 2.2, 0, Math.PI * 2);
            ctx.fill();

            for (let j = i + 1; j < nodes.length; j += 1) {
                const peer = nodes[j];
                const px = peer.baseX + Math.cos(peer.angle) * peer.orbitRadius;
                const py = peer.baseY + Math.sin(peer.angle * peer.distortion) * (peer.orbitRadius * 0.6);
                const dx = x - px;
                const dy = y - py;
                const distance = Math.hypot(dx, dy);
                const maxDistance = Math.min(node.connectRange, peer.connectRange);

                if (distance < maxDistance) {
                    const alpha = (1 - distance / maxDistance) * connectionIntensity;
                    ctx.strokeStyle = `rgba(118, 205, 255, ${alpha.toFixed(3)})`;
                    ctx.lineWidth = 0.7;
                    ctx.beginPath();
                    ctx.moveTo(x, y);
                    ctx.lineTo(px, py);
                    ctx.stroke();
                }
            }
        }

        animationId = requestAnimationFrame(renderFrame);
    }

    function activate() {
        cancelAnimationFrame(animationId);
        setCanvasSize();
        createNodes();

        if (motionQuery.matches) {
            drawStaticBackdrop();
            return;
        }

        animationId = requestAnimationFrame(renderFrame);
    }

    function handleResize() {
        activate();
    }

    function handleMotionPreferenceChange() {
        if (motionQuery.matches) {
            cancelAnimationFrame(animationId);
            drawStaticBackdrop();
        } else {
            activate();
        }
    }

    window.addEventListener('resize', handleResize, { passive: true });
    if (typeof motionQuery.addEventListener === 'function') {
        motionQuery.addEventListener('change', handleMotionPreferenceChange);
    } else if (typeof motionQuery.addListener === 'function') {
        motionQuery.addListener(handleMotionPreferenceChange);
    }

    activate();

    const yearToken = document.getElementById('current-year');
    if (yearToken) {
        yearToken.textContent = new Date().getFullYear().toString();
    }
})();
