/**
 * API Configuration for VIB34D
 * Manages API keys and service configurations
 */

export class ApiConfig {
    constructor() {
        this.keys = {
            gemini: null
        };
        
        this.endpoints = {
            gemini: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent'
        };
        
        this.loadFromStorage();
    }
    
    /**
     * Load API keys from localStorage
     */
    loadFromStorage() {
        const storedKeys = localStorage.getItem('vib34d-api-keys');
        if (storedKeys) {
            try {
                const parsed = JSON.parse(storedKeys);
                Object.assign(this.keys, parsed);
                console.log('🔑 API keys loaded from storage');
            } catch (error) {
                console.error('Error loading API keys:', error);
            }
        }
    }
    
    /**
     * Save API keys to localStorage
     */
    saveToStorage() {
        localStorage.setItem('vib34d-api-keys', JSON.stringify(this.keys));
        console.log('💾 API keys saved to storage');
    }
    
    /**
     * Set Gemini API key
     */
    setGeminiKey(apiKey) {
        this.keys.gemini = apiKey;
        this.saveToStorage();
    }
    
    /**
     * Get Gemini API key
     */
    getGeminiKey() {
        return this.keys.gemini;
    }
    
    /**
     * Check if Gemini is configured
     */
    isGeminiConfigured() {
        return !!this.keys.gemini;
    }
    
    /**
     * Clear all API keys
     */
    clearKeys() {
        this.keys = {
            gemini: null
        };
        localStorage.removeItem('vib34d-api-keys');
        console.log('🗑️ API keys cleared');
    }
    
    /**
     * Get API endpoint URL with key
     */
    getGeminiEndpoint() {
        if (!this.keys.gemini) {
            throw new Error('Gemini API key not configured');
        }
        return `${this.endpoints.gemini}?key=${this.keys.gemini}`;
    }
}

// Export singleton instance
export const apiConfig = new ApiConfig();