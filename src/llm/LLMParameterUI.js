/**
 * LLM Parameter UI for VIB34D
 * Beautiful overlay interface for natural language parameter generation
 */

export class LLMParameterUI {
    constructor(llmInterface) {
        this.llmInterface = llmInterface;
        this.overlay = null;
        this.input = null;
        this.isProcessing = false;
        
        this.exampleDescriptions = [
            // Emotional/Mood based
            "calm peaceful meditation",
            "energetic dance party",
            "mysterious magical portal",
            "warm sunset glow",
            "cool ocean waves",
            "intense lightning storm",
            
            // Color based
            "bright cyan holographic",
            "deep purple mystical",
            "warm orange sunset",
            "cool blue technology",
            "rainbow spectrum shift",
            "monochrome minimal",
            
            // Effect based
            "slow morphing crystals",
            "fast chaotic particles",
            "smooth flowing liquid",
            "sharp geometric patterns",
            "organic natural growth",
            "glitchy digital artifacts",
            
            // Style based
            "retro synthwave aesthetic",
            "futuristic hologram",
            "sacred geometry mandala",
            "psychedelic kaleidoscope",
            "minimalist zen garden",
            "maximalist explosion"
        ];
        
        this.init();
    }
    
    /**
     * Initialize UI components
     */
    init() {
        this.createOverlay();
        this.setupEventHandlers();
    }
    
    /**
     * Create the overlay UI
     */
    createOverlay() {
        // Create overlay container
        this.overlay = document.createElement('div');
        this.overlay.className = 'llm-overlay';
        this.overlay.innerHTML = `
            <div class="llm-modal">
                <div class="llm-header">
                    <h2>🤖 AI Parameter Generator</h2>
                    <button class="llm-close" title="Close">×</button>
                </div>
                
                <div class="llm-content">
                    <div class="llm-description">
                        Describe the visualization you want to create using natural language.
                        The AI will generate parameters to match your description.
                    </div>
                    
                    <div class="llm-input-container">
                        <input type="text" 
                               class="llm-input" 
                               placeholder="e.g. bright cyan holographic effect with fast rotation"
                               autocomplete="off">
                        <button class="llm-generate">Generate</button>
                    </div>
                    
                    <div class="llm-examples">
                        <div class="llm-examples-label">Try these examples:</div>
                        <div class="llm-examples-grid">
                            ${this.exampleDescriptions.slice(0, 6).map(desc => 
                                `<button class="llm-example-btn" data-description="${desc}">${desc}</button>`
                            ).join('')}
                        </div>
                        <button class="llm-more-examples">Show more examples...</button>
                    </div>
                    
                    <div class="llm-status"></div>
                    
                    <div class="llm-api-key-section" style="display: none;">
                        <div class="llm-api-key-prompt">
                            <p>Please enter your Gemini API key to use AI features:</p>
                            <input type="password" class="llm-api-key-input" placeholder="Your Gemini API key">
                            <button class="llm-api-key-save">Save API Key</button>
                            <p class="llm-api-key-help">
                                Get your API key from 
                                <a href="https://makersuite.google.com/app/apikey" target="_blank">Google AI Studio</a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .llm-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.9);
                backdrop-filter: blur(10px);
                display: none;
                justify-content: center;
                align-items: center;
                z-index: 10000;
                animation: llmFadeIn 0.3s ease-out;
            }
            
            .llm-overlay.active {
                display: flex;
            }
            
            @keyframes llmFadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            .llm-modal {
                background: linear-gradient(135deg, rgba(20, 20, 40, 0.95) 0%, rgba(30, 30, 50, 0.9) 100%);
                border: 2px solid rgba(0, 255, 255, 0.3);
                border-radius: 20px;
                padding: 30px;
                max-width: 600px;
                width: 90%;
                max-height: 80vh;
                overflow-y: auto;
                box-shadow: 
                    0 20px 60px rgba(0, 0, 0, 0.5),
                    0 0 100px rgba(0, 255, 255, 0.1),
                    inset 0 1px 0 rgba(255, 255, 255, 0.1);
                animation: llmModalSlide 0.3s ease-out;
            }
            
            @keyframes llmModalSlide {
                from { transform: translateY(-20px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            
            .llm-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
            }
            
            .llm-header h2 {
                color: #00ffff;
                font-family: 'Orbitron', monospace;
                font-size: 1.8rem;
                margin: 0;
                text-shadow: 0 0 20px rgba(0, 255, 255, 0.5);
            }
            
            .llm-close {
                background: transparent;
                border: 1px solid rgba(255, 255, 255, 0.2);
                color: #fff;
                font-size: 1.5rem;
                width: 40px;
                height: 40px;
                border-radius: 50%;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            
            .llm-close:hover {
                background: rgba(255, 255, 255, 0.1);
                border-color: rgba(255, 255, 255, 0.4);
                transform: rotate(90deg);
            }
            
            .llm-description {
                color: rgba(255, 255, 255, 0.8);
                margin-bottom: 20px;
                line-height: 1.6;
                font-family: 'Orbitron', monospace;
            }
            
            .llm-input-container {
                display: flex;
                gap: 10px;
                margin-bottom: 20px;
            }
            
            .llm-input {
                flex: 1;
                background: rgba(0, 0, 0, 0.3);
                border: 2px solid rgba(0, 255, 255, 0.3);
                color: #fff;
                padding: 15px;
                border-radius: 10px;
                font-size: 1rem;
                font-family: 'Orbitron', monospace;
                transition: all 0.3s ease;
            }
            
            .llm-input:focus {
                outline: none;
                border-color: #00ffff;
                box-shadow: 0 0 20px rgba(0, 255, 255, 0.3);
                background: rgba(0, 0, 0, 0.5);
            }
            
            .llm-generate {
                background: linear-gradient(135deg, #00ffff 0%, #0080ff 100%);
                border: none;
                color: #000;
                padding: 15px 30px;
                border-radius: 10px;
                font-weight: bold;
                font-family: 'Orbitron', monospace;
                cursor: pointer;
                transition: all 0.3s ease;
                text-transform: uppercase;
                letter-spacing: 1px;
            }
            
            .llm-generate:hover {
                transform: translateY(-2px);
                box-shadow: 0 10px 30px rgba(0, 255, 255, 0.4);
            }
            
            .llm-generate:disabled {
                opacity: 0.5;
                cursor: not-allowed;
                transform: none;
            }
            
            .llm-examples {
                margin-top: 30px;
            }
            
            .llm-examples-label {
                color: rgba(255, 255, 255, 0.6);
                margin-bottom: 10px;
                font-size: 0.9rem;
                font-family: 'Orbitron', monospace;
            }
            
            .llm-examples-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
                gap: 10px;
                margin-bottom: 10px;
            }
            
            .llm-example-btn {
                background: rgba(0, 255, 255, 0.1);
                border: 1px solid rgba(0, 255, 255, 0.3);
                color: #00ffff;
                padding: 10px 15px;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.3s ease;
                font-family: 'Orbitron', monospace;
                font-size: 0.85rem;
            }
            
            .llm-example-btn:hover {
                background: rgba(0, 255, 255, 0.2);
                border-color: #00ffff;
                transform: translateY(-1px);
            }
            
            .llm-more-examples {
                background: transparent;
                border: 1px solid rgba(255, 255, 255, 0.2);
                color: rgba(255, 255, 255, 0.6);
                padding: 8px 16px;
                border-radius: 6px;
                cursor: pointer;
                transition: all 0.3s ease;
                font-family: 'Orbitron', monospace;
                font-size: 0.85rem;
                width: 100%;
                margin-top: 10px;
            }
            
            .llm-more-examples:hover {
                border-color: rgba(255, 255, 255, 0.4);
                color: rgba(255, 255, 255, 0.8);
            }
            
            .llm-status {
                margin-top: 20px;
                padding: 15px;
                border-radius: 10px;
                font-family: 'Orbitron', monospace;
                display: none;
            }
            
            .llm-status.processing {
                display: block;
                background: rgba(0, 100, 255, 0.1);
                border: 1px solid rgba(0, 100, 255, 0.3);
                color: #4080ff;
            }
            
            .llm-status.success {
                display: block;
                background: rgba(0, 255, 100, 0.1);
                border: 1px solid rgba(0, 255, 100, 0.3);
                color: #00ff64;
            }
            
            .llm-status.error {
                display: block;
                background: rgba(255, 0, 100, 0.1);
                border: 1px solid rgba(255, 0, 100, 0.3);
                color: #ff0064;
            }
            
            .llm-api-key-section {
                margin-top: 20px;
                padding: 20px;
                background: rgba(255, 150, 0, 0.1);
                border: 1px solid rgba(255, 150, 0, 0.3);
                border-radius: 10px;
            }
            
            .llm-api-key-input {
                width: 100%;
                background: rgba(0, 0, 0, 0.3);
                border: 1px solid rgba(255, 150, 0, 0.3);
                color: #fff;
                padding: 10px;
                border-radius: 6px;
                margin: 10px 0;
                font-family: monospace;
            }
            
            .llm-api-key-save {
                background: linear-gradient(135deg, #ff9600 0%, #ff6432 100%);
                border: none;
                color: #000;
                padding: 10px 20px;
                border-radius: 6px;
                cursor: pointer;
                font-weight: bold;
                font-family: 'Orbitron', monospace;
                transition: all 0.3s ease;
            }
            
            .llm-api-key-save:hover {
                transform: translateY(-1px);
                box-shadow: 0 5px 20px rgba(255, 150, 0, 0.3);
            }
            
            .llm-api-key-help {
                font-size: 0.85rem;
                color: rgba(255, 255, 255, 0.6);
                margin-top: 10px;
            }
            
            .llm-api-key-help a {
                color: #ff9600;
                text-decoration: none;
            }
            
            .llm-api-key-help a:hover {
                text-decoration: underline;
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(this.overlay);
        
        // Get references
        this.input = this.overlay.querySelector('.llm-input');
    }
    
    /**
     * Setup event handlers
     */
    setupEventHandlers() {
        // Close button
        this.overlay.querySelector('.llm-close').addEventListener('click', () => this.hide());
        
        // Click outside to close
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) {
                this.hide();
            }
        });
        
        // Generate button
        this.overlay.querySelector('.llm-generate').addEventListener('click', () => {
            this.generateFromInput();
        });
        
        // Enter key in input
        this.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !this.isProcessing) {
                this.generateFromInput();
            }
        });
        
        // Example buttons
        this.overlay.querySelectorAll('.llm-example-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.input.value = btn.dataset.description;
                this.generateFromInput();
            });
        });
        
        // More examples button
        this.overlay.querySelector('.llm-more-examples').addEventListener('click', (e) => {
            const grid = this.overlay.querySelector('.llm-examples-grid');
            const currentCount = grid.children.length;
            
            if (currentCount < this.exampleDescriptions.length) {
                // Show all examples
                grid.innerHTML = this.exampleDescriptions.map(desc => 
                    `<button class="llm-example-btn" data-description="${desc}">${desc}</button>`
                ).join('');
                e.target.textContent = 'Show fewer examples...';
            } else {
                // Show only first 6
                grid.innerHTML = this.exampleDescriptions.slice(0, 6).map(desc => 
                    `<button class="llm-example-btn" data-description="${desc}">${desc}</button>`
                ).join('');
                e.target.textContent = 'Show more examples...';
            }
            
            // Re-attach handlers to new buttons
            grid.querySelectorAll('.llm-example-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    this.input.value = btn.dataset.description;
                    this.generateFromInput();
                });
            });
        });
        
        // API key save button
        this.overlay.querySelector('.llm-api-key-save').addEventListener('click', () => {
            const apiKeyInput = this.overlay.querySelector('.llm-api-key-input');
            const apiKey = apiKeyInput.value.trim();
            
            if (!apiKey) {
                this.showStatus('Please enter an API key', 'error');
                return;
            }
            
            if (!apiKey.startsWith('AIza') || apiKey.length < 30) {
                this.showStatus('Invalid API key format. Should start with "AIza" and be longer than 30 characters.', 'error');
                return;
            }
            
            try {
                this.llmInterface.setApiKey(apiKey);
                this.overlay.querySelector('.llm-api-key-section').style.display = 'none';
                this.showStatus('API key saved successfully! You can now generate parameters.', 'success');
                
                // Clear the input to prevent accidental retries
                apiKeyInput.value = '';
                
                // DON'T auto-retry - let user manually trigger generation
                console.log('✅ API key set. Ready for manual generation.');
                
            } catch (error) {
                this.showStatus('Failed to save API key', 'error');
                console.error('API key save error:', error);
            }
        });
    }
    
    /**
     * Show the overlay
     */
    async show() {
        this.overlay.classList.add('active');
        
        // Initialize LLM interface
        await this.llmInterface.initialize();
        
        // Focus on input
        setTimeout(() => this.input.focus(), 100);
    }
    
    /**
     * Hide the overlay
     */
    hide() {
        this.overlay.classList.remove('active');
        this.input.value = '';
        this.hideStatus();
    }
    
    /**
     * Generate parameters from input
     */
    async generateFromInput() {
        const description = this.input.value.trim();
        
        if (!description) {
            this.showStatus('Please enter a description', 'error');
            return;
        }
        
        if (this.isProcessing) {
            return;
        }
        
        this.isProcessing = true;
        this.showStatus('Generating parameters...', 'processing');
        
        const generateBtn = this.overlay.querySelector('.llm-generate');
        generateBtn.disabled = true;
        
        try {
            const parameters = await this.llmInterface.generateParameters(description);
            
            this.showStatus('Parameters generated successfully!', 'success');
            
            // Close after a short delay
            setTimeout(() => this.hide(), 1500);
            
        } catch (error) {
            console.error('Generation error:', error);
            
            if (error.message.includes('No API key set')) {
                // Show API key input
                this.overlay.querySelector('.llm-api-key-section').style.display = 'block';
                this.showStatus('Please enter your Gemini API key to use AI generation', 'error');
            } else if (error.message.includes('API request failed')) {
                this.showStatus('API request failed. Please check your API key is valid and try again.', 'error');
                // Also show API key input in case they need to fix it
                this.overlay.querySelector('.llm-api-key-section').style.display = 'block';
            } else {
                this.showStatus(`Generation failed: ${error.message}`, 'error');
            }
        } finally {
            this.isProcessing = false;
            generateBtn.disabled = false;
        }
    }
    
    /**
     * Show status message
     */
    showStatus(message, type) {
        const status = this.overlay.querySelector('.llm-status');
        status.textContent = message;
        status.className = `llm-status ${type}`;
    }
    
    /**
     * Hide status message
     */
    hideStatus() {
        const status = this.overlay.querySelector('.llm-status');
        status.className = 'llm-status';
        status.textContent = '';
    }
}