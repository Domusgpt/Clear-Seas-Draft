class ReactiveSynergyConductor {
    constructor({ progressionSystem, tiltSystem, backdropElement } = {}) {
        this.progressionSystem = progressionSystem || null;
        this.tiltSystem = tiltSystem || null;
        this.backdropElement = backdropElement || document.getElementById('reactiveBackdrop') || null;
        this.pointerActive = false;
        this.lastPayload = { normX: 0.5, normY: 0.5, intensity: 0 };
        this.currentSystemType = null;

        this.handlePointerMove = this.handlePointerMove.bind(this);
        this.handlePointerDown = this.handlePointerDown.bind(this);
        this.handlePointerUp = this.handlePointerUp.bind(this);
        this.handlePointerLeave = this.handlePointerLeave.bind(this);
        this.handleCardFocus = this.handleCardFocus.bind(this);
        this.handleCardExit = this.handleCardExit.bind(this);
        this.handleCardDestroy = this.handleCardDestroy.bind(this);
        this.handleSystemThemeChange = this.handleSystemThemeChange.bind(this);

        this.init();
    }

    init() {
        this.bindPointerLayer();
        this.bindProgressionEvents();
        if (this.progressionSystem?.getFocusedCard) {
            const card = this.progressionSystem.getFocusedCard();
            if (card) {
                this.syncBackdropTheme(card.dataset.vib34d || null, 0);
            }
        }
    }

    bindPointerLayer() {
        const container = document.getElementById('progressionContainer');
        if (!container) return;

        container.addEventListener('pointermove', this.handlePointerMove, { passive: true });
        container.addEventListener('pointerdown', this.handlePointerDown, { passive: true });
        container.addEventListener('pointerup', this.handlePointerUp, { passive: true });
        container.addEventListener('pointercancel', this.handlePointerLeave, { passive: true });
        container.addEventListener('pointerleave', this.handlePointerLeave, { passive: true });
    }

    bindProgressionEvents() {
        if (!this.progressionSystem || typeof this.progressionSystem.on !== 'function') {
            return;
        }

        this.progressionSystem.on('cardFocus', this.handleCardFocus);
        this.progressionSystem.on('cardExit', this.handleCardExit);
        this.progressionSystem.on('cardDestroy', this.handleCardDestroy);
        this.progressionSystem.on('systemThemeChanged', this.handleSystemThemeChange);
    }

    handlePointerMove(event) {
        const bounds = event.currentTarget.getBoundingClientRect();
        const normX = (event.clientX - bounds.left) / bounds.width;
        const normY = (event.clientY - bounds.top) / bounds.height;
        const clampedX = Math.max(0, Math.min(1, normX));
        const clampedY = Math.max(0, Math.min(1, normY));
        const offsetX = clampedX - 0.5;
        const offsetY = clampedY - 0.5;
        const intensity = Math.min(1, Math.hypot(offsetX, offsetY) * 1.5);

        const payload = { normX: clampedX, normY: clampedY, intensity };
        this.lastPayload = payload;
        this.pointerActive = true;

        this.applyBackdropResponse('pointer-move', payload);
        this.progressionSystem?.applyRelationalResponse?.('pointer-move', payload);
    }

    handlePointerDown() {
        this.pointerActive = true;
        const payload = { ...this.lastPayload, intensity: 1 };
        this.applyBackdropResponse('pointer-press', payload);
        this.progressionSystem?.applyRelationalResponse?.('pointer-press', payload);
    }

    handlePointerUp() {
        if (!this.pointerActive) return;
        const payload = { ...this.lastPayload, intensity: this.lastPayload.intensity };
        this.applyBackdropResponse('pointer-release', payload);
        this.progressionSystem?.applyRelationalResponse?.('pointer-release', payload);
    }

    handlePointerLeave() {
        this.pointerActive = false;
        this.lastPayload = { normX: 0.5, normY: 0.5, intensity: 0 };
        this.applyBackdropResponse('pointer-neutral', this.lastPayload);
        this.progressionSystem?.applyRelationalResponse?.('pointer-neutral', this.lastPayload);
    }

    handleCardFocus(event) {
        const { card, systemType, index } = event.detail || {};
        this.syncBackdropTheme(systemType || card?.dataset?.vib34d || null, index);

        if (this.pointerActive) {
            this.progressionSystem?.applyRelationalResponse?.('pointer-move', this.lastPayload);
        } else {
            this.progressionSystem?.applyRelationalResponse?.('pointer-neutral', { normX: 0.5, normY: 0.5, intensity: 0 });
        }
    }

    handleCardExit(event) {
        const { card } = event.detail || {};
        if (!card) return;
        card.style.removeProperty('--card-glow-strength');
    }

    handleCardDestroy(event) {
        const { inheritedTrait } = event.detail || {};
        const payload = { ...this.lastPayload, intensity: 1 };
        this.applyBackdropResponse('destruction', payload);
        if (inheritedTrait && this.pointerActive) {
            this.progressionSystem?.applyRelationalResponse?.('pointer-move', this.lastPayload);
        }
    }

    handleSystemThemeChange(event) {
        const { systemType } = event.detail || {};
        this.syncBackdropTheme(systemType || null);
    }

    syncBackdropTheme(systemType, index = 0) {
        if (systemType) {
            this.currentSystemType = systemType;
        }

        if (this.backdropElement) {
            this.backdropElement.setAttribute('data-system', this.currentSystemType || 'faceted');
        }

        const baseIntensity = 0.42 + (index || 0) * 0.025;
        this.setBackdropIntensity(baseIntensity);
    }

    setBackdropIntensity(value) {
        if (!this.backdropElement) return;
        const clamped = Math.max(0.2, Math.min(1.2, value));
        this.backdropElement.style.setProperty('--backdrop-intensity', clamped.toFixed(3));
    }

    applyBackdropResponse(action, payload = {}) {
        if (!this.backdropElement) return;

        const normX = typeof payload.normX === 'number' ? payload.normX : 0.5;
        const normY = typeof payload.normY === 'number' ? payload.normY : 0.5;
        const intensity = typeof payload.intensity === 'number' ? payload.intensity : 0;
        const offsetX = (0.5 - normX) * 160;
        const offsetY = (0.5 - normY) * 120;

        switch (action) {
            case 'pointer-move': {
                this.backdropElement.style.setProperty('--backdrop-shift-x', `${offsetX.toFixed(2)}px`);
                this.backdropElement.style.setProperty('--backdrop-shift-y', `${offsetY.toFixed(2)}px`);
                this.backdropElement.style.setProperty('--backdrop-tilt-x', `${(offsetX * 0.12).toFixed(3)}deg`);
                this.backdropElement.style.setProperty('--backdrop-tilt-y', `${(offsetY * 0.1).toFixed(3)}deg`);
                this.setBackdropIntensity(0.4 + intensity * 0.55);
                break;
            }
            case 'pointer-press': {
                this.setBackdropIntensity(0.58 + intensity * 0.4);
                break;
            }
            case 'pointer-release': {
                this.setBackdropIntensity(0.46 + intensity * 0.25);
                break;
            }
            case 'pointer-neutral': {
                this.backdropElement.style.removeProperty('--backdrop-shift-x');
                this.backdropElement.style.removeProperty('--backdrop-shift-y');
                this.backdropElement.style.removeProperty('--backdrop-tilt-x');
                this.backdropElement.style.removeProperty('--backdrop-tilt-y');
                this.setBackdropIntensity(0.45);
                break;
            }
            case 'destruction': {
                this.setBackdropIntensity(0.78);
                break;
            }
        }
    }
}

window.ReactiveSynergyConductor = ReactiveSynergyConductor;
