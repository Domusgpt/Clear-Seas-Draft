/**
 * Firebase-based LLM Interface for VIB34D
 * Uses Firebase Functions to handle Gemini API calls server-side
 * No API keys needed on client side!
 */

export class FirebaseLLMInterface {
    constructor() {
        // Firebase Function endpoint (will be set after deployment)
        this.functionUrl = 'https://us-central1-vib34d-llm.cloudfunctions.net/generateVIB34DParameters';
        this.parameterCallback = null;
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
        if (!description || !description.trim()) {
            throw new Error('Description is required');
        }

        console.log('🔥 Generating parameters via Firebase Function for:', description);
        
        try {
            const response = await fetch(this.functionUrl, {
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
                throw new Error(errorData.error || `Server error: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (!data.success || !data.parameters) {
                throw new Error('Invalid response from server');
            }
            
            const parameters = data.parameters;
            
            console.log('🔥 Generated parameters via Firebase:', parameters);
            
            if (this.parameterCallback) {
                this.parameterCallback(parameters);
            }
            
            return parameters;
            
        } catch (error) {
            console.error('🔥 Firebase LLM error:', error);
            
            if (error.message.includes('Failed to fetch')) {
                throw new Error('Network error. Please check your internet connection.');
            }
            
            throw error;
        }
    }
    
    /**
     * Test if the Firebase Function is available
     */
    async testConnection() {
        try {
            const testParams = await this.generateParameters('test connection');
            return true;
        } catch (error) {
            console.error('Firebase Function connection test failed:', error);
            return false;
        }
    }
}