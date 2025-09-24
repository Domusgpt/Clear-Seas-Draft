/**
 * LLM Parameter Interface for VIB34D
 * Converts natural language descriptions to VIB34D parameters using Gemini Flash 1.5
 */

export class LLMParameterInterface {
    constructor() {
        // Try Firebase Function first, fallback to direct API
        this.useFirebase = true;
        this.firebaseUrl = 'https://us-central1-vib34d-llm-engine.cloudfunctions.net/generateVIB34DParameters';
        
        // Fallback to direct API if Firebase not available
        this.apiKey = localStorage.getItem('vib34d-gemini-api-key') || null;
        this.baseApiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
        this.parameterCallback = null;
        
        // Comprehensive system prompt with emotional/visual understanding
        this.systemPrompt = `You are a synesthetic AI that translates human experience into 4-dimensional holographic mathematics.

You control a VIB34D system with these parameters:
- geometry (0-7): Tetrahedron, Hypercube, Sphere, Torus, Klein Bottle, Fractal, Wave, Crystal
- hue (0-360), intensity (0-1), saturation (0-1)
- speed (0.1-3), chaos (0-1), morphFactor (0-2), gridDensity (5-100)
- rot4dXW, rot4dYW, rot4dZW (-6.28 to 6.28)

When given a description, use your understanding of:
- Visual aesthetics and emotional resonance
- Color theory and psychological associations
- Movement, rhythm, and temporal dynamics
- Mathematical beauty and complexity
- Human perception and synesthesia

Create a holographic experience that captures the essence of what they're describing.

Think beyond literal interpretation. If someone says "the sound of silence," you might create subtle, barely-there patterns with minimal chaos and low intensity. If they say "cosmic loneliness," you might use vast empty spaces with occasional fractal details.

Your goal is to create something that makes them say "YES, that's exactly what I meant, even though I couldn't have described it mathematically."

Return only JSON with the parameter names above.`;
    }
    
    /**
     * Initialize with API key from localStorage or prompt user
     */
    async initialize() {
        // Check localStorage for existing API key
        const storedKey = localStorage.getItem('vib34d-gemini-api-key');
        if (storedKey) {
            this.apiKey = storedKey;
            console.log('🔑 Gemini API key loaded from storage');
            return true;
        }
        
        // If no key, will be prompted when first used
        console.log('📝 Gemini API key will be requested on first use');
        return false;
    }
    
    /**
     * Set API key and store it
     */
    setApiKey(apiKey) {
        this.apiKey = apiKey;
        localStorage.setItem('vib34d-gemini-api-key', apiKey);
        console.log('🔑 Gemini API key saved');
    }
    
    /**
     * Set callback for parameter updates
     */
    setParameterCallback(callback) {
        this.parameterCallback = callback;
    }
    
    /**
     * Generate parameters from natural language description
     */
    async generateParameters(description) {
        // Try Firebase Function first
        if (this.useFirebase) {
            try {
                console.log('🔥 Trying Firebase Function first...');
                return await this.generateViaFirebase(description);
            } catch (error) {
                console.warn('🔥 Firebase Function failed, falling back to direct API:', error.message);
                this.useFirebase = false; // Disable for this session
            }
        }
        
        // Fallback to direct API
        console.log('🔍 Using direct API approach...');
        console.log('🔍 Checking API key:', this.apiKey ? `${this.apiKey.substring(0, 10)}...` : 'NOT SET');
        const hasValidKey = this.apiKey && this.apiKey.startsWith('AIza') && this.apiKey.length > 30;
        console.log('🔍 API key valid:', hasValidKey);
        
        if (hasValidKey) {
            // Try real API first
            try {
                // Try both authentication methods to see which works
                const apiUrl = `${this.baseApiUrl}?key=${this.apiKey}`;
                console.log('🤖 Making API request to:', apiUrl);
                
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{
                                text: `${this.systemPrompt}\n\nUser description: "${description}"\n\nGenerate JSON parameters:`
                            }]
                        }],
                        generationConfig: {
                            temperature: 0.7,
                            maxOutputTokens: 500,
                            topP: 0.8,
                            topK: 40
                        }
                    })
                });
                
                console.log('🤖 API response status:', response.status);
                console.log('🤖 API response ok:', response.ok);
                
                if (response.ok) {
                    const data = await response.json();
                    console.log('🤖 API response data:', data);
                    const generatedText = data.candidates[0].content.parts[0].text;
                    
                    // Extract JSON from response
                    const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
                    if (jsonMatch) {
                        const parameters = JSON.parse(jsonMatch[0]);
                        const validated = this.validateParameters(parameters);
                        
                        console.log('🤖 Generated parameters via Gemini API:', validated);
                        
                        if (this.parameterCallback) {
                            this.parameterCallback(validated);
                        }
                        
                        return validated;
                    }
                } else {
                    const errorText = await response.text();
                    console.error('🤖 API request failed:', response.status, errorText);
                    throw new Error(`API request failed: ${response.status} - ${errorText}`);
                }
            } catch (error) {
                console.error('🤖 API request error:', error);
                throw error;
            }
        }
        
        // No API key or API failed - just fail properly  
        if (!this.apiKey) {
            throw new Error('No API key set. Please enter your Gemini API key to use AI generation.');
        } else {
            throw new Error('API request failed. Please check your API key or network connection.');
        }
    }
    
    /**
     * Generate parameters via Firebase Function
     */
    async generateViaFirebase(description) {
        const response = await fetch(this.firebaseUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                description: description.trim()
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `Firebase Function error: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.success || !data.parameters) {
            throw new Error('Invalid response from Firebase Function');
        }
        
        const parameters = data.parameters;
        
        console.log('🔥 Generated parameters via Firebase:', parameters);
        
        if (this.parameterCallback) {
            this.parameterCallback(parameters);
        }
        
        return parameters;
    }
    
    /**
     * Validate and clamp parameters to valid ranges
     */
    validateParameters(params) {
        const validated = {};
        
        // Define parameter ranges
        const ranges = {
            geometry: { min: 0, max: 7, type: 'int' },
            hue: { min: 0, max: 360, type: 'int' },
            intensity: { min: 0, max: 1, type: 'float' },
            saturation: { min: 0, max: 1, type: 'float' },
            speed: { min: 0.1, max: 3, type: 'float' },
            chaos: { min: 0, max: 1, type: 'float' },
            morphFactor: { min: 0, max: 2, type: 'float' },
            gridDensity: { min: 5, max: 100, type: 'int' },
            rot4dXW: { min: -6.28, max: 6.28, type: 'float' },
            rot4dYW: { min: -6.28, max: 6.28, type: 'float' },
            rot4dZW: { min: -6.28, max: 6.28, type: 'float' }
        };
        
        // Validate each parameter
        Object.entries(ranges).forEach(([param, range]) => {
            if (params.hasOwnProperty(param)) {
                let value = parseFloat(params[param]);
                
                // Clamp to range
                value = Math.max(range.min, Math.min(range.max, value));
                
                // Convert to int if needed
                if (range.type === 'int') {
                    value = Math.round(value);
                }
                
                validated[param] = value;
            }
        });
        
        return validated;
    }
}